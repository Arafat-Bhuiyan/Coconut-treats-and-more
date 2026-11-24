/**
 * Secure Serverless Proxy for Meta Conversions API (CAPI)
 * 
 * Runs server-side on Vercel.
 * - Extracts the TRUE visitor IP address (never server/private/proxy IP)
 * - Forwards SHA-256 hashed external_id (from phone) + Advanced Matching fields
 */

function normalizeIp(raw) {
  if (!raw || typeof raw !== 'string') return '';
  let ip = raw.trim();
  // Strip IPv4-mapped IPv6 prefix (e.g. ::ffff:103.120.45.10 -> 103.120.45.10)
  if (ip.toLowerCase().startsWith('::ffff:')) {
    ip = ip.slice(7);
  }
  // Strip surrounding brackets on IPv6 if present
  if (ip.startsWith('[') && ip.endsWith(']')) {
    ip = ip.slice(1, -1);
  }
  return ip.trim();
}

function isPrivateOrLocalIp(ip) {
  if (!ip) return true;
  const lower = ip.toLowerCase();
  if (
    lower === '::1' ||
    lower === 'localhost' ||
    lower.startsWith('127.') ||
    lower.startsWith('10.') ||
    lower.startsWith('192.168.') ||
    lower.startsWith('169.254.') ||
    lower.startsWith('fc') ||
    lower.startsWith('fd') ||
    lower.startsWith('fe80:')
  ) {
    return true;
  }
  // 172.16.0.0 - 172.31.255.255
  if (lower.startsWith('172.')) {
    const secondOctet = parseInt(lower.split('.')[1], 10);
    if (secondOctet >= 16 && secondOctet <= 31) return true;
  }
  return false;
}

function extractRealVisitorIp(req) {
  const headers = req.headers || {};
  // Priority order: Cloudflare -> True-Client-IP -> Vercel Edge -> X-Forwarded-For -> X-Real-IP -> socket
  const candidates = [
    headers['cf-connecting-ip'],
    headers['true-client-ip'],
    headers['x-vercel-forwarded-for'],
    headers['x-forwarded-for'],
    headers['x-real-ip'],
    req.socket?.remoteAddress,
  ];

  for (const rawHeader of candidates) {
    if (!rawHeader) continue;
    const parts = Array.isArray(rawHeader)
      ? rawHeader.flatMap((v) => String(v).split(','))
      : String(rawHeader).split(',');

    for (const part of parts) {
      const ip = normalizeIp(part);
      if (ip && !isPrivateOrLocalIp(ip)) {
        return ip;
      }
    }
  }
  return '';
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
    const { eventName, eventTime, eventId, eventParams, userData } = body || {};

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

    // Extract true visitor IP (never private/server IP)
    const visitorIp = extractRealVisitorIp(req);

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
        hasExternalId: Boolean(userData?.external_id),
      }
    });
  } catch (error) {
    console.error("Meta Conversions API serverless function failed:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
