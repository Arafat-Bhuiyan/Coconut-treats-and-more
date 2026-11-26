import net from 'net';

/**
 * Secure Serverless Proxy for Meta Conversions API (CAPI)
 * 
 * Runs server-side on Vercel.
 * - Extracts the TRUE visitor IP address (IPv4 & IPv6) from Cloudflare / Vercel / Proxy headers
 * - NEVER falls back to server/socket/private IP addresses
 * - Purchase events are intentionally handled exclusively by /api/submit-order
 */

function normalizeIp(raw) {
  if (!raw || typeof raw !== 'string') return '';
  let ip = raw.trim().replace(/^"|"$/g, '');

  // Handle RFC 7239 Forwarded header tokens like for="[2400:...]:443" or for=103.120.45.10
  if (ip.toLowerCase().startsWith('for=')) {
    ip = ip.slice(4).trim().replace(/^"|"$/g, '');
  }

  // Handle bracketed IPv6 with optional port: [2400:cb00::1]:443 -> 2400:cb00::1
  if (ip.startsWith('[')) {
    const closeIdx = ip.indexOf(']');
    if (closeIdx !== -1) {
      ip = ip.slice(1, closeIdx);
    }
  } else if (/^\d{1,3}(?:\.\d{1,3}){3}:\d+$/.test(ip)) {
    // Strip port from IPv4:port
    ip = ip.slice(0, ip.lastIndexOf(':'));
  }

  // Strip IPv4-mapped IPv6 prefix (::ffff:103.120.45.10 -> 103.120.45.10)
  if (ip.toLowerCase().startsWith('::ffff:')) {
    const v4Part = ip.slice(7);
    if (net.isIP(v4Part) === 4) {
      ip = v4Part;
    }
  }

  // Strip IPv6 zone index if any (e.g. %eth0)
  const pctIdx = ip.indexOf('%');
  if (pctIdx !== -1) ip = ip.slice(0, pctIdx);

  return ip.trim();
}

function isPublicIp(ip) {
  const version = net.isIP(ip);
  if (!version) return false;
  const lower = ip.toLowerCase();

  if (version === 4) {
    const parts = lower.split('.').map(Number);
    if (parts.length !== 4 || parts.some(Number.isNaN)) return false;
    const [a, b] = parts;
    if (
      a === 0 ||                         // 0.0.0.0/8
      a === 10 ||                        // 10.0.0.0/8 private
      a === 127 ||                       // 127.0.0.0/8 loopback
      (a === 169 && b === 254) ||        // 169.254.0.0/16 link-local
      (a === 172 && b >= 16 && b <= 31) || // 172.16.0.0/12 private
      (a === 192 && b === 168) ||        // 192.168.0.0/16 private
      a >= 224                           // multicast / reserved
    ) {
      return false;
    }
    return true;
  }

  // IPv6 public check
  if (
    lower === '::' ||
    lower === '::1' ||
    lower.startsWith('fc') ||
    lower.startsWith('fd') ||
    lower.startsWith('fe8') ||
    lower.startsWith('fe9') ||
    lower.startsWith('fea') ||
    lower.startsWith('feb') ||
    lower.startsWith('ff')
  ) {
    return false;
  }
  return true;
}

function extractRealVisitorIp(req) {
  const headers = req.headers || {};
  // Strict priority order — Vercel Edge authoritative header first (prevents spoofed cf-connecting-ip on direct Vercel)
  // NEVER fall back to req.socket.remoteAddress (server/proxy IP)
  const headerSources = [
    ['x-vercel-forwarded-for', headers['x-vercel-forwarded-for']],
    ['x-forwarded-for', headers['x-forwarded-for']],
    ['x-real-ip', headers['x-real-ip']],
    ['cf-connecting-ip', headers['cf-connecting-ip']],
    ['true-client-ip', headers['true-client-ip']],
    ['forwarded', headers['forwarded']],
  ];

  let firstPublicV4 = null;

  for (const [sourceName, rawHeader] of headerSources) {
    if (!rawHeader) continue;
    const rawList = Array.isArray(rawHeader) ? rawHeader : [String(rawHeader)];
    const tokens = rawList.flatMap((v) =>
      sourceName === 'forwarded' ? v.split(/[;,]/g) : v.split(',')
    );

    for (const token of tokens) {
      const ip = normalizeIp(token);
      if (!ip || !isPublicIp(ip)) continue;
      const version = net.isIP(ip);
      // Prefer public IPv6 when available (unique per mobile device, avoids CGNAT IPv4 sharing)
      if (version === 6) {
        return { ip, version: 6, source: sourceName };
      }
      if (version === 4 && !firstPublicV4) {
        firstPublicV4 = { ip, version: 4, source: sourceName };
      }
    }
  }

  return firstPublicV4 || { ip: '', version: 0, source: 'none' };
}

export default async function handler(req, res) {
  // Allow only POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        // failed parse
      }
    }
    const { eventName, eventTime, eventId, eventParams, userData, test_event_code } = body || {};

    // Purchase CAPI is sent EXCLUSIVELY from /api/submit-order after order save succeeds
    if (String(eventName || '').toLowerCase() === 'purchase') {
      return res.status(200).json({
        success: true,
        skipped: true,
        reason: 'Purchase CAPI is sent exclusively by /api/submit-order'
      });
    }

    // Extract true visitor IP (IPv4 or IPv6 — never server/private IP)
    const ipInfo = extractRealVisitorIp(req);
    const visitorIp = ipInfo.ip;

    // Never send ?test=1 traffic to live Meta CAPI unless test_event_code is explicitly provided
    const srcUrl = String(userData?.sourceUrl || req.headers?.referer || '');
    const resolvedTestCode = String(test_event_code || process.env.META_TEST_EVENT_CODE || '').trim() || null;
    if (/[?&]test=(1|true)(&|$)/i.test(srcUrl) && !resolvedTestCode) {
      return res.status(200).json({
        success: true,
        skipped: true,
        reason: 'test_mode_excluded',
        metaDebug: {
          ipDetected: Boolean(visitorIp),
          ipVersion: ipInfo.version,
          ipSource: ipInfo.source,
        }
      });
    }

    // Retrieve Meta credentials securely from Environment Variables or configured token
    const pixelId = process.env.META_PIXEL_ID || '939507308912648';
    const accessToken = process.env.META_ACCESS_TOKEN || 'EAAc2aaZCnjKwBSfhUGBpyHwNYdCcBIZAfsCFqz7qZB5cGWt6P0di2SIT2upTOSs3ZCMivpfd7gmcKY2b2l1ZB00sZB9oLFewKhUG1KsO5SfYYslVkpqaPnaBiQYLML1MsgGfm9pDEdZApQaSGq7kPWWHjwMe0RxwvDTc4RmLo3ZB0xPnSuQWSlVhmdheCnz24AZDZD';

    if (!accessToken) {
      console.warn("META_ACCESS_TOKEN is missing in server environment variables.");
      return res.status(202).json({
        success: false,
        message: "Meta Access Token not configured on the server."
      });
    }

    // Prepare payload for Meta Graph API
    const metaUserData = {
      ...(visitorIp ? { client_ip_address: visitorIp } : {}),
      client_user_agent: userData?.userAgent || req.headers['user-agent'] || '',
      // Pre-hashed SHA-256 user details sent from client
      ...(userData?.ph ? { ph: [userData.ph] } : {}),
      ...(userData?.em ? { em: [userData.em] } : {}),
      ...(userData?.fn ? { fn: [userData.fn] } : {}),
      ...(userData?.ln ? { ln: [userData.ln] } : {}),
      ...(userData?.ct ? { ct: [userData.ct] } : {}),
      ...(userData?.st ? { st: [userData.st] } : {}),
      ...(userData?.zp ? { zp: [userData.zp] } : {}),
      ...(userData?.country ? { country: [userData.country] } : {}),
      ...(userData?.external_id ? { external_id: [userData.external_id] } : {}),
      ...(userData?.fbp ? { fbp: userData.fbp } : {}),
      ...(userData?.fbc ? { fbc: userData.fbc } : {}),
    };

    const metaPayload = {
      ...(resolvedTestCode ? { test_event_code: resolvedTestCode } : {}),
      data: [
        {
          event_name: eventName,
          event_time: eventTime || Math.floor(Date.now() / 1000),
          action_source: "website",
          event_id: eventId,
          event_source_url: userData?.sourceUrl || req.headers.referer || "https://coconuttreatsmore.com/",
          user_data: metaUserData,
          custom_data: {
            value: eventParams?.value ? parseFloat(eventParams.value) : undefined,
            currency: eventParams?.currency || 'BDT',
            content_name: eventParams?.content_name,
            content_ids: eventParams?.content_ids,
            contents: eventParams?.contents,
            content_type: eventParams?.content_type,
            num_items: eventParams?.num_items ? parseInt(eventParams.num_items, 10) : undefined,
          }
        }
      ]
    };

    // Forward the event to Meta Graph API
    const response = await fetch(`https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${accessToken}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(metaPayload)
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Meta Graph API error response:", result);
      return res.status(response.status).json({ success: false, error: result });
    }

    return res.status(200).json({
      success: true,
      result,
      metaDebug: {
        ipDetected: Boolean(visitorIp),
        ipVersion: ipInfo.version,
        ipSource: ipInfo.source,
        hasExternalId: Boolean(userData?.external_id),
      }
    });
  } catch (error) {
    console.error("Meta Conversions API serverless function failed:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
