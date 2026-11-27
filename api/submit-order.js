import crypto from 'crypto';

/**
 * Secure Serverless Proxy for Google Apps Script + Authoritative Single Meta CAPI Purchase
 * 
 * Runs server-side on Vercel:
 * 1. Logs every validated order immediately in structured JSON (never lost even if Sheet fails)
 * 2. Saves to Google Sheet & sends email (returns HTTP 502 if save fails, HTTP 200 ONLY when saved)
 * 3. Sends ONE authoritative Meta Conversions API Purchase event with event_id = order_id,
 *    real visitor IP, SHA-256 hashed phone + external_id, and fbp/fbc cookies.
 */
// Server-side in-memory caches:
// 1. Prevent accidental double-tap order submissions within 3 seconds
// 2. Guarantee Meta CAPI Purchase can NEVER be sent twice for the same order_id
const recentOrdersCache = new Map();
const sentCapiOrderIds = new Set();
const DEDUPLICATION_WINDOW_MS = 3000;

function sha256(val) {
  if (!val) return null;
  return crypto.createHash('sha256').update(String(val).trim().toLowerCase()).digest('hex');
}

function formatBDPhoneForMeta(phone) {
  if (!phone) return null;
  const bnToEnMap = { '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9' };
  const normalized = String(phone).replace(/[০-৯]/g, (d) => bnToEnMap[d] || d);
  let clean = normalized.replace(/[^0-9]/g, '');
  if (clean.length === 11 && clean.startsWith('0')) clean = '880' + clean.slice(1);
  else if (clean.length === 10 && clean.startsWith('1')) clean = '880' + clean;
  return clean.length >= 12 ? clean : null;
}

function normalizeIp(raw) {
  if (!raw || typeof raw !== 'string') return '';
  let ip = raw.trim();
  if (ip.toLowerCase().startsWith('::ffff:')) ip = ip.slice(7);
  if (ip.startsWith('[') && ip.endsWith(']')) ip = ip.slice(1, -1);
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
  if (lower.startsWith('172.')) {
    const secondOctet = parseInt(lower.split('.')[1], 10);
    if (secondOctet >= 16 && secondOctet <= 31) return true;
  }
  return false;
}

function extractRealVisitorIp(req) {
  const headers = req.headers || {};
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
      if (ip && !isPrivateOrLocalIp(ip)) return ip;
    }
  }
  return '';
}

function parseCookieHeader(cookieHeader, name) {
  if (!cookieHeader) return null;
  const parts = (`; ${cookieHeader}`).split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift() || null;
  return null;
}

function isTestOrderServer(req, orderData) {
  const metaTracking = orderData?.meta_tracking || {};
  if (orderData?.is_test === true || metaTracking.is_test === true) return true;
  const sourceUrl = String(metaTracking.source_url || req.headers?.referer || '');
  if (/[?&]test=(1|true)(&|$)/i.test(sourceUrl)) return true;
  const note = String(orderData?.Note || '');
  if (/\btest\b/i.test(note) || note.includes('টেস্ট')) return true;
  const addrAndName = `${orderData?.Customer || ''} ${orderData?.Address || ''}`;
  if (addrAndName.includes('সিস্টেম লাইভ টেস্ট') || /\blive audit\b/i.test(addrAndName)) return true;
  return false;
}

async function sendAuthoritativeCapiPurchase(req, orderData, orderId) {
  const metaTracking = orderData.meta_tracking || {};
  const testEventCode = String(metaTracking.test_event_code || process.env.META_TEST_EVENT_CODE || '').trim() || null;

  // NEVER send test orders to live Meta CAPI Purchase unless an explicit Meta Events Manager test_event_code is set!
  if (isTestOrderServer(req, orderData) && !testEventCode) {
    return { sent: false, skipped: true, reason: 'test_order_excluded' };
  }

  // Strictly guarantee CAPI Purchase is sent AT MOST ONCE per orderId
  if (sentCapiOrderIds.has(orderId)) {
    return { sent: false, skipped: true, reason: 'already_sent_for_order_id' };
  }
  sentCapiOrderIds.add(orderId);
  if (sentCapiOrderIds.size > 500) {
    const firstKey = sentCapiOrderIds.values().next().value;
    sentCapiOrderIds.delete(firstKey);
  }

  const pixelId = process.env.META_PIXEL_ID || '939507308912648';
  const accessToken = process.env.META_ACCESS_TOKEN || 'EAAc2aaZCnjKwBSfhUGBpyHwNYdCcBIZAfsCFqz7qZB5cGWt6P0di2SIT2upTOSs3ZCMivpfd7gmcKY2b2l1ZB00sZB9oLFewKhUG1KsO5SfYYslVkpqaPnaBiQYLML1MsgGfm9pDEdZApQaSGq7kPWWHjwMe0RxwvDTc4RmLo3ZB0xPnSuQWSlVhmdheCnz24AZDZD';
  if (!accessToken) return { sent: false, reason: 'missing_token' };

  const visitorIp = extractRealVisitorIp(req);
  const formattedPhone = formatBDPhoneForMeta(orderData.Phone);
  const hashedPhone = formattedPhone ? sha256(formattedPhone) : null;

  const rawName = String(orderData.Customer || orderData.from_name || '').trim();
  const nameParts = rawName && rawName.toLowerCase() !== 'customer' ? rawName.split(/\s+/) : [];
  const fnHash = nameParts.length > 0 ? sha256(nameParts[0]) : null;
  const lnHash = nameParts.length > 1 ? sha256(nameParts[nameParts.length - 1]) : null;
  const rawEmail = String(orderData.Email || '').trim();
  const emHash = rawEmail && rawEmail.includes('@') ? sha256(rawEmail) : null;

  const fbp = metaTracking.fbp || parseCookieHeader(req.headers?.cookie, '_fbp');
  const fbc = metaTracking.fbc || parseCookieHeader(req.headers?.cookie, '_fbc');

  const numericTotal =
    typeof metaTracking.value === 'number'
      ? metaTracking.value
      : parseFloat(String(orderData.Total_Amount || '1500').replace(/[^0-9.]/g, '')) || 1500;
  const numItems =
    typeof metaTracking.num_items === 'number'
      ? metaTracking.num_items
      : parseInt(String(orderData.Quantity || '2').replace(/[^0-9]/g, ''), 10) || 2;
  const unitPrice = typeof metaTracking.unit_price === 'number' ? metaTracking.unit_price : 750;

  const metaPayload = {
    ...(testEventCode ? { test_event_code: testEventCode } : {}),
    data: [
      {
        event_name: 'Purchase',
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        event_id: orderId,
        event_source_url: metaTracking.source_url || req.headers?.referer || 'https://coconuttreatsmore.com/',
        user_data: {
          ...(visitorIp ? { client_ip_address: visitorIp } : {}),
          client_user_agent: req.headers?.['user-agent'] || '',
          ...(hashedPhone ? { ph: [hashedPhone], external_id: [hashedPhone] } : {}),
          ...(emHash ? { em: [emHash] } : {}),
          ...(fnHash ? { fn: [fnHash] } : {}),
          ...(lnHash ? { ln: [lnHash] } : {}),
          ct: [sha256('dhaka')],
          st: [sha256('dhaka')],
          zp: [sha256('1000')],
          country: [sha256('bd')],
          ...(fbp ? { fbp } : {}),
          ...(fbc ? { fbc } : {}),
        },
        custom_data: {
          value: numericTotal,
          currency: 'BDT',
          content_name: 'Premium Coconut Pudding (6pc Box)',
          content_ids: ['coconut-pudding-6pc'],
          contents: [{ id: 'coconut-pudding-6pc', quantity: numItems, item_price: unitPrice }],
          content_type: 'product',
          num_items: numItems,
        },
      },
    ],
  };

  try {
    const resp = await fetch(`https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${accessToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metaPayload),
      signal: AbortSignal.timeout(2500),
    });
    const json = await resp.json().catch(() => ({}));
    return {
      sent: resp.ok,
      ipDetected: Boolean(visitorIp),
      hasExternalId: Boolean(hashedPhone),
      hasFbp: Boolean(fbp),
      hasFbc: Boolean(fbc),
      fbtrace_id: json?.fbtrace_id || null,
    };
  } catch (err) {
    console.error('[CAPI Purchase Error]', err?.message || err);
    return { sent: false, error: err?.message || 'capi_failed' };
  }
}

function cleanupExpiredOrders() {
  const now = Date.now();
  for (const [key, timestamp] of recentOrdersCache.entries()) {
    if (now - timestamp > 10000) {
      recentOrdersCache.delete(key);
    }
  }
}

async function postToGoogleScriptWithRetry(url, payload, maxAttempts = 2, timeoutMs = 4500) {
  let lastError = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        redirect: 'follow',
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(timeoutMs),
      });

      const text = await response.text();
      if (response.ok) {
        let parsed = { success: true };
        try {
          if (text) parsed = JSON.parse(text);
        } catch {
          parsed = { success: true, message: "Order logged" };
        }
        if (parsed && parsed.success !== false) {
          return { ok: true, status: response.status, result: parsed };
        }
        lastError = new Error(parsed.error || parsed.message || "Script lock/error");
      } else {
        lastError = new Error(`HTTP ${response.status}: ${text?.slice(0, 120)}`);
      }
    } catch (err) {
      lastError = err;
    }

    if (attempt < maxAttempts) {
      // Jittered backoff (250ms–850ms) so concurrent requests never collide on Google Sheets lock
      const jitterMs = 250 * attempt + Math.floor(Math.random() * 350);
      await new Promise((resolve) => setTimeout(resolve, jitterMs));
    }
  }
  return { ok: false, status: 502, error: lastError?.message || "Failed after retries" };
}

export default async function handler(req, res) {
  // Allow only POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    let orderData = req.body;
    if (typeof orderData === 'string') {
      try {
        orderData = JSON.parse(orderData);
      } catch {
        // failed parse
      }
    }
    
    // Support both uppercase and lowercase keys defensively
    const phone = orderData?.Phone || orderData?.phone;
    const address = orderData?.Address || orderData?.address;

    // Server-side payload validation to prevent spam/corrupted orders
    if (!orderData || !phone || !address) {
      return res.status(400).json({
        success: false,
        message: "Required order details are missing (Phone and Address are required)."
      });
    }

    // Server-side outside-Dhaka delivery restriction check
    const OUTSIDE_DHAKA_AREAS = [
      // ঢাকা সংলগ্ন (কাছাকাছি) জেলা ও শহর
      "narayanganj", "narayangonj", "নারায়ণগঞ্জ", "নারায়ণগঞ্জ", "fatullah", "ফতুল্লা", "chasara", "চাষাড়া", "চাষাড়া", "siddhirganj", "সিদ্ধিরগঞ্জ", "sonargaon", "সোনারগাঁও", "kanchpur", "কাঁচপুর", "araihazar", "আড়াইহাজার", "রূপগঞ্জ", "rupganj",
      "munshiganj", "munshigonj", "মুন্সিগঞ্জ", "মুন্সীগঞ্জ", "sreenagar", "শ্রীনগর", "sirajdikhan", "সিরাজদিখান", "gajaria", "গজারিয়া", "গজারিয়া", "louhajang", "লৌহজং", "tongibari", "টঙ্গীবাড়ি", "টঙ্গীবাড়ি",
      "gazipur", "গাজীপুর", "joydebpur", "জয়দেবপুর", "জয়দেবপুর", "kaliakair", "কালিয়াকৈর", "কালিয়াকৈর", "sreepur", "শ্রীপুর", "kapasia", "কাপাসিয়া", "কাপাসিয়া", "konabari", "কোনাবাড়ী", "কোনাবাড়ী", "boardbazar", "বোর্ডবাজার", "tongi", "টঙ্গী", "টঙ্গি",
      "manikganj", "manikgonj", "মানিকগঞ্জ", "singair", "সিংগাইর", "saturia", "সাটুরিয়া", "সাটুরিয়া", "shibalaya", "শিবালয়", "shibaloy", "harirampur", "হরিরামপুর", "ghior", "ঘিওর", "daulatpur", "দৌলতপুর",
      "narsingdi", "নরসিংদী", "belabo", "বেলাবো", "monohardi", "মনোহরদী", "raipura", "রায়পুরা", "রায়পুরা", "shibpur", "শিবপুর",
      "savar", "সাভার", "ashulia", "আশুলিয়া", "আশুলিয়া", "keraniganj", "keranigonj", "কেরানীগঞ্জ", "কেরানিগঞ্জ",
      "dohar", "দোহার", "joypara", "জয়পাড়া", "জয়পাড়া", "dhamrai", "ধামরাই",

      // যাত্রাবাড়ী, ডেমরা, জুরাইন, পোস্তগোলা, শ্যামপুর (যেখানে ডেলিভারি বন্ধ)
      "jatrabari", "jattrabari", "যাত্রাবাড়ী", "যাত্রাবাড়ি", "যাত্রাবাড়ি", "যাত্রাবাড়ী",
      "shonir akhra", "shanir akhra", "shonirakhra", "শনিরআখড়া", "শনিরআখড়া", "শনির আখড়া", "শনির আখড়া",
      "donia", "dania", "দনিয়া", "দনিয়া",
      "demra", "ডেমরা",
      "jurain", "juraine", "জুরাইন",
      "postogola", "postagola", "পোস্তগোলা",
      "shyampur", "shampur", "শ্যামপুর",
      "dholaipar", "dholaypar", "dholaiphar", "ধোলাইপাড়", "ধোলাইপাড়",
      "gandaria", "gendaria", "গেন্ডারিয়া", "গেন্ডারিয়া", "গেণ্ডারিয়া", "গেণ্ডারিয়া",
      "matuail", "matuwail", "মাতুয়াইল", "মাতুয়াইল",

      // উত্তরাঞ্চল
      "tangail", "টাঙ্গাইল", "mirzapur", "মির্জাপুর", "delduar", "দেলদুয়ার", "দেলদুয়ার", "ghatail", "ঘাটাইল", "madhupur", "মধুপুর", "sakhipur", "সখিপুর", "kalihati", "কালিহাতী", "gopalpur", "গোপালপুর", "bhuapur", "ভূঞাপুর", "nagarpur", "নাগরপুর", "dhanbari", "ধনবাড়ী",
      "kishoreganj", "kishoregonj", "কিশোরগঞ্জ", "bhairab", "ভৈরব", "bajitpur", "বাজিতপুর", "hosenpur", "হোসেনপুর", "karimganj", "করিমগঞ্জ", "tarail", "তাড়াইল", "তাড়াইল", "katiadi", "কটিয়াদী", "কটিয়াদী", "kuliarchar", "কুলিয়ারচর", "pakundia", "পাকুন্দিয়া", "nikli", "নিকলী", "astagram", "অষ্টগ্রাম", "itna", "ইটনা", "mithamain", "মিঠামইন",

      // দক্ষিণাঞ্চল (পদ্মার ওপারে)
      "faridpur", "ফরিদপুর", "boalmari", "বোয়ালমারী", "বোয়ালমারী", "modhukhali", "মধুখালী", "nagarkanda", "নগরকান্দা", "alfadanga", "আলফাডাঙ্গা", "sadorpur", "সদরপুর", "charbhadrasan", "চরভদ্রাসন", "saltha", "সালথা",
      "madaripur", "মাদারীপুর", "মাদারিপুর", "shibchar", "শিবচর", "kalkini", "কালকিনি", "rajoir", "রাজৈর", "dashar", "ডাসার",
      "shariatpur", "শরীয়তপুর", "শরীয়তপুর", "naria", "নড়িয়া", "নড়িয়া", "zajira", "jajira", "জাজিরা", "bhedarganj", "ভেদরগঞ্জ", "damudya", "ডামুড্যা", "gosairhat", "গোসাইরহাট",
      "gopalganj", "gopalgonj", "গোপালগঞ্জ", "tungipara", "টুঙ্গিপাড়া", "টুঙ্গিপাড়া", "kotalipara", "কোটালীপাড়া", "কোটালীপাড়া", "kashiani", "কাশিয়ানী", "কাশিয়ানী", "muksudpur", "মুকসুদপুর",
      "rajbari", "রাজবাড়ী", "রাজবাড়ী", "pangsha", "পাংশা", "baliakandi", "বালিয়াকান্দি", "বালিয়াকান্দি", "goalanda", "গোয়ালন্দ", "গোয়ালন্দ", "kalukhali", "কালুখালী",

      // চট্টগ্রাম বিভাগ (Chittagong Division)
      "chittagong", "chattogram", "ctg", "চট্টগ্রাম", "চট্টগ্রাাম", "চাটগাঁ",
      "cox's bazar", "coxs bazar", "coxsbazar", "কক্সবাজার", "কক্স বাজার",
      "cumilla", "comilla", "কুমিল্লা", "feni", "ফেনী", "ফেণী",
      "brahmanbaria", "ব্রাহ্মণবাড়িয়া", "ব্রাহ্মণবাড়িয়া", "rangamati", "রাঙ্গামাটি", "রাঙামাটি",
      "noakhali", "নোয়াখালী", "নোয়াখালী", "chandpur", "চাঁদপুর",
      "lakshmipur", "লক্ষ্মীপুর", "লক্ষীপুর", "khagrachhari", "খাগড়াছড়ি", "খাগড়াছড়ি",
      "bandarban", "বান্দরবান", "sitakunda", "সীতাকুণ্ড", "mirsharai", "মিরসরাই", "hathazari", "হাটহাজারী", "teknaf", "টেকনাফ",

      // রাজশাহী বিভাগ (Rajshahi Division)
      "rajshahi", "রাজশাহী", "bogura", "bogra", "বগুড়া", "বগুড়া", "joypurhat", "জয়পুরহাট", "জয়পুরহাট",
      "naogaon", "নওগাঁ", "natore", "নাটোর", "chapainawabganj", "চাঁপাইনবাবগঞ্জ",
      "pabna", "পাবনা", "sirajganj", "সিরাজগঞ্জ", "iswardi", "ishwardi", "ঈশ্বরদী",

      // খুলনা বিভাগ (Khulna Division)
      "khulna", "খুলনা", "bagerhat", "বাগেরহাট", "chuadanga", "চুয়াডাঙ্গা", "চুয়াডাঙ্গা",
      "jashore", "jessore", "যশোর", "jhenaidah", "ঝিনাইদহ", "kushtia", "কুষ্টিয়া", "কুষ্টিয়া",
      "magura", "মাগুরা", "meherpur", "মেহেরপুর", "narail", "নড়াইল", "নড়াইল", "satkhira", "সাতক্ষীরা",
      "benapole", "বেনাপোল", "mongla", "মংলা",

      // বরিশাল বিভাগ (Barisal Division)
      "barisal", "barishal", "বরিশাল", "barguna", "বরগুনা", "bhola", "ভোলা",
      "jhalokati", "jhalakathi", "ঝালকাঠি", "ঝালকাঠী", "patuakhali", "পটুয়াখালী", "পটুয়াখালী",
      "pirojpur", "পিরোজপুর", "kuakata", "কুয়াকাটা", "কুয়াকাটা",

      // সিলেট বিভাগ (Sylhet Division)
      "sylhet", "সিলেট", "habiganj", "হবিগঞ্জ", "moulvibazar", "maulvibazar", "মৌলভীবাজার",
      "sunamganj", "সুনামগঞ্জ", "sreemangal", "srimangal", "শ্রীমঙ্গল", "beanibazar", "বিয়ানীবাজার", "বিয়ানীবাজার",

      // রংপুর বিভাগ (Rangpur Division)
      "rangpur", "রংপুর", "dinajpur", "দিনাজপুর", "gaibandha", "গাইবান্ধা", "kurigram", "কুড়িগ্রাম", "কুড়িগ্রাম",
      "lalmonirhat", "লালমনিরহাট", "nilphamari", "নীলফামারী", "panchagarh", "পঞ্চগড়", "পঞ্চগড়",
      "thakurgaon", "ঠাকুরগাঁও", "saidpur", "syedpur", "সৈয়দপুর", "সৈয়দপুর",

      // ময়মনসিংহ বিভাগ (Mymensingh Division)
      "mymensingh", "ময়মনসিংহ", "ময়মনসিংহ", "jamalpur", "জামালপুর",
      "netrokona", "netrakona", "netro kona", "netra kona", "নেত্রকোণা", "নেত্রকোনা", "নেত্র কোনা", "নেত্র কোণা",
      "mohonganj", "mohanganj", "মোহনগঞ্জ", "kendua", "কেন্দুয়া", "কেন্দুয়া", "kalmakanda", "কলমাকান্দা",
      "durgapur", "দুর্গাপুর", "barhatta", "বারহাট্টা", "atpara", "আটপাড়া", "আটপাড়া",
      "purbadhala", "পূর্বধলা", "khaliajuri", "খালিয়াজুরী", "খালিয়াজুরী",
      "sherpur", "শেরপুর", "muktagacha", "মুক্তাগাছা"
    ];

    const SAFE_DHAKA_ROADS = [
      "tongi diversion", "টঙ্গী ডাইভারশন", "টঙ্গি ডাইভারশন",
      "sonargaon janapath", "sonargaon road", "hotel sonargaon", "pan pacific sonargaon", "সোনারগাঁও জনপথ", "সোনারগাঁও রোড", "হোটেল সোনারগাঁও",
      "nawabganj road", "nawabganj lane", "nawabganj park", "নবাবগঞ্জ রোড", "নবাবগঞ্জ লেন", "লালবাগ নবাবগঞ্জ",
      "mymensingh road", "mymensingh lane", "ময়মনসিংহ রোড", "ময়মনসিংহ রোড",
      "comilla para", "কুমিল্লা পাড়া", "কুমিল্লা পাড়া",
      "noakhali tower", "নোয়াখালী টাওয়ার", "নোয়াখালী টাওয়ার",
      "barisal plaza", "বরিশাল প্লাজা", "sylhet tower", "সিলেট টাওয়ার", "সিলেট টাওয়ার",
      "bogura bhaban", "বগুড়া ভবন", "বগুড়া ভবন", "rajshahi market", "রাজশাহী মার্কেট", "rangpur house", "রংপুর হাউস",
      "faridpur mansion", "ফরিদপুর ভবন",
      // Common building, colony, hotel and store names inside Dhaka
      "chittagong colony", "chittagong building", "chittagong hotel", "chittagong store", "chittagong house",
      "chattogram building", "chattogram store", "chattogram house",
      "comilla building", "comilla store", "comilla hotel", "comilla house", "comilla bhaban",
      "noakhali building", "noakhali store", "noakhali hotel", "noakhali house", "noakhali bhaban",
      "barisal building", "barisal hotel", "barisal store", "barisal house", "barisal bhaban",
      "sylhet building", "sylhet store", "sylhet hotel", "sylhet house",
      "rajshahi building", "rajshahi house", "rajshahi store",
      "bogura building", "bogra building", "bogura store", "bogra store",
      "ময়মনসিংহ ভবন", "ময়মনসিংহ ভবন", "কুমিল্লা ভবন", "কুমিল্লা হোটেল", "নোয়াখালী ভবন", "বরিশাল ভবন", "সিলেট ভবন", "চট্টগ্রাম ভবন", "চট্টগ্রাম কলোনি"
    ];

    let checkText = String(address).toLowerCase();
    for (const safeRoad of SAFE_DHAKA_ROADS) {
      if (checkText.includes(safeRoad.toLowerCase())) {
        checkText = checkText.replace(new RegExp(safeRoad.toLowerCase(), "g"), " ");
      }
    }

    const matchedRestrictedKey = OUTSIDE_DHAKA_AREAS.find((k) => {
      const escaped = k.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
      const rx = new RegExp('(?<![\\p{L}\\p{M}\\p{N}])' + escaped + '(?![\\p{L}\\p{M}\\p{N}])', 'iu');
      return rx.test(checkText);
    });
    if (matchedRestrictedKey) {
      return res.status(400).json({
        success: false,
        message: `দুঃখিত! এই অর্ডার আপনার ঠিকানায় (${matchedRestrictedKey}) ডেলিভারি করা সম্ভব নয়। ফ্রেশ ডাবের পুডিং ডেলিভারি শুধুমাত্র ঢাকা সিটির মূল এলাকায় সীমাবদ্ধ।`
      });
    }

    // Clean phone number and build full order fingerprint (only blocks accidental double-taps of the exact same order within 3s)
    const cleanPhone = String(phone).replace(/[^0-9]/g, '');
    const customerName = String(orderData?.Customer || orderData?.from_name || '').trim().toLowerCase();
    const quantity = String(orderData?.Quantity || '').trim().toLowerCase();
    const totalAmt = String(orderData?.Total_Amount || '').trim().toLowerCase();
    const note = String(orderData?.Note || '').trim().toLowerCase();
    const idempotencyKey = `${cleanPhone}_${customerName}_${String(address).trim().toLowerCase().slice(0, 35)}_${quantity}_${totalAmt}_${note}`;

    // Periodic cleanup of expired orders
    cleanupExpiredOrders();

    // Check if this exact order was double-tapped within 3 seconds
    if (recentOrdersCache.has(idempotencyKey)) {
      const lastProcessedTime = recentOrdersCache.get(idempotencyKey);
      const elapsed = Date.now() - lastProcessedTime;
      if (elapsed < DEDUPLICATION_WINDOW_MS) {
        console.warn(`[Double-Tap Guard] Duplicate tap for ${cleanPhone} suppressed (${elapsed}ms).`);
        return res.status(200).json({
          success: true,
          duplicate: true,
          message: "Order already received and queued for dispatch."
        });
      }
    }

    // Record order timestamp for 3-second double-tap guard
    recentOrdersCache.set(idempotencyKey, Date.now());

    const orderId = orderData.order_id || `ORD_${Date.now()}_${cleanPhone.slice(-4)}`;
    orderData.Phone = phone;
    orderData.Address = address;

    // Reliable structured log BEFORE external Sheet/Email calls so NO order is ever lost
    console.log('[ORDER_RECEIVED]', JSON.stringify({
      order_id: orderId,
      timestamp: new Date().toISOString(),
      customer: orderData.Customer || orderData.from_name || 'Customer',
      phone,
      address,
      quantity: orderData.Quantity || '',
      total: orderData.Total_Amount || '',
      payment: orderData.Payment_Method || '',
      note: orderData.Note || '',
    }));

    // Clean payload for Google Apps Script (omit internal meta_tracking object)
    const { meta_tracking: _omitMeta, ...sheetPayload } = orderData;
    sheetPayload.Order_ID = orderId;

    // Multi-Account Apps Script endpoints:
    // 1. Coconut Script (coconuttreatsmore@gmail.com) - Writes to Main Google Sheet + sends primary email
    // 2. Ongon Script (ongon51@gmail.com) - Backup email sender
    // 3. Rehab Script (rehabbhuiyian1@gmail.com) - 3rd-tier backup email sender
    const COCONUT_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbygtsftenbteNaL_IUxy1a82Yy8Jy__jAHeK26NRG0HUrH_jVnCMkAeOyITvQ-lzW9f/exec";
    const ONGON_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzuVfOKjWHGjhJm4QK3vIshvLtLF8j9_U-1OM44RNsndXo7sj4Gasa_Ta1lDvALQVCm/exec";
    const REHAB_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzFcI1b96QTUub4Nt3T0cDu4bRM7b6nU7vy5VhcaHr-DfrCWAEufiLH-99QmbKbvJZ8_A/exec";

    // STEP 1: Run primary Google Sheet save (single 7.5s attempt to prevent duplicate rows)
    // IN PARALLEL with authoritative Meta CAPI Purchase (2.5s timeout) so total stays strictly < 10s Vercel limit!
    const [coconutRes, capiDebug] = await Promise.all([
      postToGoogleScriptWithRetry(COCONUT_SCRIPT_URL, sheetPayload, 1, 7500),
      sendAuthoritativeCapiPurchase(req, orderData, orderId),
    ]);

    const coconutEmailSucceeded =
      coconutRes.ok &&
      coconutRes.result?.emailSent !== false &&
      coconutRes.result?.quotaExceeded !== true &&
      !String(coconutRes.result?.error || '').toLowerCase().includes('quota') &&
      !String(coconutRes.result?.message || '').toLowerCase().includes('quota');

    let finalRes = coconutRes;

    // STEP 2: ONLY if primary failed or quota exhausted, trigger fast backup within remaining Vercel budget
    if (!coconutEmailSucceeded) {
      console.warn("[Backup Triggered] coconuttreatsmore@gmail.com quota full/failed -> sending via ongon51@gmail.com");
      const ongonRes = await postToGoogleScriptWithRetry(ONGON_SCRIPT_URL, sheetPayload, 1, 1800);
      if (ongonRes.ok) {
        finalRes = ongonRes;
      } else {
        console.warn("[3rd-Tier Backup Triggered] ongon51@gmail.com failed -> sending via rehabbhuiyian1@gmail.com");
        const rehabRes = await postToGoogleScriptWithRetry(REHAB_SCRIPT_URL, sheetPayload, 1, 1500);
        if (rehabRes.ok) {
          finalRes = rehabRes;
        }
      }
    }

    if (!finalRes.ok && !coconutRes.ok) {
      console.error('[ORDER_SAVE_FAILED]', JSON.stringify({
        order_id: orderId,
        phone,
        customer: orderData.Customer || 'Customer',
        address,
        error: finalRes.error || coconutRes.error,
      }));
      // Return HTTP 502 (NEVER 200) so frontend shows error + WhatsApp button
      return res.status(502).json({
        success: false,
        order_id: orderId,
        message: "অর্ডার সেভ করতে সাময়িক সমস্যা হয়েছে। আবার চেষ্টা করুন অথবা WhatsApp-এ অর্ডার করুন।"
      });
    }

    return res.status(200).json({
      success: true,
      order_id: orderId,
      capi: capiDebug,
      result: finalRes.result || coconutRes.result || { success: true }
    });

  } catch (error) {
    console.error("Google Apps Script serverless proxy failed:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
