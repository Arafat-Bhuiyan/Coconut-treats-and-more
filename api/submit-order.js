/**
 * Secure Serverless Proxy for Google Apps Script
 * 
 * This handler runs server-side on Vercel.
 * It forwards order details to the Google Apps Script Web App URL securely.
 * 
 * NOTE: Google Apps Script Web Apps redirect POST requests.
 * We handle this by following redirects (redirect: 'follow').
 */
// Server-side in-memory cache to prevent accidental double-tap order submissions within 3 seconds
const recentOrdersCache = new Map();
const DEDUPLICATION_WINDOW_MS = 3000; // 3 seconds double-tap guard (allows consecutive/concurrent orders freely)

function cleanupExpiredOrders() {
  const now = Date.now();
  for (const [key, timestamp] of recentOrdersCache.entries()) {
    if (now - timestamp > 10000) {
      recentOrdersCache.delete(key);
    }
  }
}

async function postToGoogleScriptWithRetry(url, payload, maxAttempts = 3) {
  let lastError = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        redirect: 'follow',
        body: JSON.stringify(payload)
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

    // Server-side outside-Dhaka delivery restriction check (7 Divisions & surrounding restricted areas)
    const OUTSIDE_DHAKA_AREAS = [
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
      "naogaon", "নওগাঁ", "natore", "নাটোর", "chapainawabganj", "nawabganj", "চাঁপাইনবাবগঞ্জ", "নবাবগঞ্জ",
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
      "mymensingh", "ময়মনসিংহ", "ময়মনসিংহ", "jamalpur", "জামালপুর", "netrokona", "netrakona", "নেত্রকোণা", "নেত্রকোনা",
      "sherpur", "শেরপুর", "muktagacha", "মুক্তাগাছা",

      // ঢাকা বিভাগের বাইরের জেলা ও শহর
      "savar", "সাভার", "ashulia", "আশুলিয়া", "আশুলিয়া", "asulia",
      "keraniganj", "কেরানীগঞ্জ", "keranigang", "keranigonj",
      "narayanganj", "নারায়ণগঞ্জ", "নারায়ণগঞ্জ", "naraynganj", "narayangonj", "fatullah", "ফতুল্লা", "সিদ্ধিরগঞ্জ", "siddhirganj",
      "munshiganj", "মুন্সীগঞ্জ", "মুন্সিগঞ্জ", "munshigang",
      "jatrabari", "যাত্রাবাড়ী", "যাত্রাবাড়ী", "sayedabad", "সায়েদাবাদ", "সায়েদাবাদ",
      "gazipur", "গাজীপুর", "tongi", "টঙ্গী", "টঙ্গি",
      "tangail", "টাঙ্গাইল", "faridpur", "ফরিদপুর", "gopalganj", "গোপালগঞ্জ",
      "madaripur", "মাদারীপুর", "manikganj", "মানিকগঞ্জ", "narsingdi", "নরসিংদী",
      "rajbari", "রাজবাড়ী", "রাজবাড়ী", "shariatpur", "শরীয়তপুর", "শরিয়তপুর", "kishoreganj", "কিশোরগঞ্জ"
    ];

    const SAFE_DHAKA_ROADS = [
      "tongi diversion", "টঙ্গী ডাইভারশন", "টঙ্গি ডাইভারশন",
      "mymensingh road", "mymensingh lane", "ময়মনসিংহ রোড", "ময়মনসিংহ রোড",
      "comilla para", "কুমিল্লা পাড়া", "কুমিল্লা পাড়া",
      "noakhali tower", "নোয়াখালী টাওয়ার", "নোয়াখালী টাওয়ার",
      "barisal plaza", "বরিশাল প্লাজা", "sylhet tower", "সিলেট টাওয়ার", "সিলেট টাওয়ার",
      "bogura bhaban", "বগুড়া ভবন", "বগুড়া ভবন", "rajshahi market", "রাজশাহী মার্কেট", "rangpur house", "রংপুর হাউস"
    ];

    let checkText = `${String(address).toLowerCase()} ${String(orderData?.Customer || '').toLowerCase()}`;
    for (const safeRoad of SAFE_DHAKA_ROADS) {
      if (checkText.includes(safeRoad.toLowerCase())) {
        checkText = checkText.replace(new RegExp(safeRoad.toLowerCase(), "g"), " ");
      }
    }

    const matchedRestrictedKey = OUTSIDE_DHAKA_AREAS.find((k) => checkText.includes(k.toLowerCase()));
    if (matchedRestrictedKey) {
      return res.status(400).json({
        success: false,
        message: `দুঃখিত! এই অর্ডার আপনার ঠিকানায় (${matchedRestrictedKey}) ডেলিভারি করা সম্ভব নয়। ফ্রেশ ডাবের পুডিং ডেলিভারি শুধুমাত্র ঢাকা সিটির ভেতরে সীমাবদ্ধ (ঢাকার বাইরে কোনো ডেলিভারি সেবা নেই)।`
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

    orderData.Phone = phone;
    orderData.Address = address;

    // New Apps Script deployed from coconuttreatsmore@gmail.com
    const googleScriptUrl = process.env.GOOGLE_SCRIPT_URL || "https://script.google.com/macros/s/AKfycbygtsftenbteNaL_IUxy1a82Yy8Jy__jAHeK26NRG0HUrH_jVnCMkAeOyITvQ-lzW9f/exec";

    // Forward the request to Google Apps Script with 5-attempt automatic concurrency retry & jittered backoff
    const forwardRes = await postToGoogleScriptWithRetry(googleScriptUrl, orderData, 5);

    if (!forwardRes.ok) {
      console.error("Google Apps Script failed after retries:", forwardRes.error);
      return res.status(200).json({
        success: false,
        message: forwardRes.error
      });
    }

    return res.status(200).json({ success: true, result: forwardRes.result });

  } catch (error) {
    console.error("Google Apps Script serverless proxy failed:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
