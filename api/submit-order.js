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

    // Server-side outside-Dhaka delivery restriction check
    const OUTSIDE_DHAKA_AREAS = [
      // ঢাকা সংলগ্ন (কাছাকাছি) জেলা ও শহর
      "narayanganj", "narayangonj", "নারায়ণগঞ্জ", "নারায়ণগঞ্জ", "fatullah", "ফতুল্লা", "chasara", "চাষাড়া", "চাষাড়া", "siddhirganj", "সিদ্ধিরগঞ্জ", "sonargaon", "সোনারগাঁও", "kanchpur", "কাঁচপুর", "araihazar", "আড়াইহাজার", "রূপগঞ্জ", "rupganj",
      "munshiganj", "munshigonj", "মুন্সিগঞ্জ", "মুন্সীগঞ্জ", "sreenagar", "শ্রীনগর", "sirajdikhan", "সিরাজদিখান", "gajaria", "গজারিয়া", "গজারিয়া", "louhajang", "লৌহজং", "tongibari", "টঙ্গীবাড়ি", "টঙ্গীবাড়ি",
      "gazipur", "গাজীপুর", "joydebpur", "জয়দেবপুর", "জয়দেবপুর", "kaliakair", "কালিয়াকৈর", "কালিয়াকৈর", "sreepur", "শ্রীপুর", "kapasia", "কাপাসিয়া", "কাপাসিয়া", "konabari", "কোনাবাড়ী", "কোনাবাড়ী", "boardbazar", "বোর্ডবাজার", "tongi", "টঙ্গী", "টঙ্গি",
      "manikganj", "manikgonj", "মানিকগঞ্জ", "singair", "সিংগাইর", "saturia", "সাটুরিয়া", "সাটুরিয়া", "shibalaya", "শিবালয়", "shibaloy", "harirampur", "হরিরামপুর", "ghior", "ঘিওর", "daulatpur", "দৌলতপুর",
      "narsingdi", "নরসিংদী", "belabo", "বেলাবো", "monohardi", "মনোহরদী", "raipura", "রায়পুরা", "রায়পুরা", "shibpur", "শিবপুর",
      "savar", "সাভার", "ashulia", "আশুলিয়া", "আশুলিয়া", "keraniganj", "keranigonj", "কেরানীগঞ্জ", "কেরানিগঞ্জ",

      // যাত্রাবাড়ী, ধোলাইপাড়, পোস্তগোলা, জুরাইন, শ্যামপুর, ডেমরা
      "jatrabari", "jattrabari", "যাত্রাবাড়ী", "যাত্রাবাড়ি",
      "dholaipar", "dholaypar", "dholaiphar", "ধোলাইপাড়", "ধোলাইপাড়",
      "postogola", "postagola", "পোস্তগোলা",
      "jurain", "juraine", "জুরাইন",
      "shyampur", "shampur", "শ্যামপুর",
      "demra", "ডেমরা",

      // উত্তরাঞ্চল
      "tangail", "টাঙ্গাইল", "mirzapur", "মির্জাপুর", "delduar", "দেলদুয়ার", "দেলদুয়ার", "ghatail", "ঘাটাইল", "madhupur", "মধুপুর", "sakhipur", "সখিপুর", "kalihati", "কালিহাতী", "gopalpur", "গোপালপুর", "bhuapur", "ভূঞাপুর", "nagarpur", "নাগরপুর", "dhanbari", "ধনবাড়ী",
      "kishoreganj", "kishoregonj", "কিশোরগঞ্জ", "bhairab", "ভৈরব", "bajitpur", "বাজিতপুর", "hosenpur", "হোসেনপুর", "karimganj", "করিমগঞ্জ", "tarail", "তাড়াইল", "তাড়াইল", "katiadi", "কটিয়াদী", "কটিয়াদী", "kuliarchar", "কুলিয়ারচর", "pakundia", "পাকুন্দিয়া", "nikli", "নিকলী", "astagram", "অষ্টগ্রাম", "itna", "ইটনা", "mithamain", "মিঠামইন",

      // দক্ষিণাঞ্চল (পদ্মার ওপারে)
      "faridpur", "ফরিদপুর", "bhanga", "ভাঙ্গা", "boalmari", "বোয়ালমারী", "বোয়ালমারী", "modhukhali", "মধুখালী", "nagarkanda", "নগরকান্দা", "alfadanga", "আলফাডাঙ্গা", "sadorpur", "সদরপুর", "charbhadrasan", "চরভদ্রাসন", "saltha", "সালথা",
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
      "faridpur mansion", "ফরিদপুর ভবন"
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
        message: `দুঃখিত! এই অর্ডার আপনার ঠিকানায় (${matchedRestrictedKey}) ডেলিভারি করা সম্ভব নয়। ফ্রেশ ডাবের পুডিং ডেলিভারি শুধুমাত্র ঢাকা সিটির ভেতরে (Dhaka City) সীমাবদ্ধ।`
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

    // Multi-Account Apps Script endpoints:
    // 1. Coconut Script (coconuttreatsmore@gmail.com) - Writes to Main Google Sheet (1N_ZIAnGtN9Zx-NL0ncPqH1GOCAKZBWhc7_j94y0-5rY) + sends primary email
    // 2. Ongon Script (ongon51@gmail.com) - Backup email sender (only activates when Coconut quota runs out or fails)
    // 3. Rehab Script (rehabbhuiyian1@gmail.com) - 3rd-tier backup email sender (activates if both Coconut and Ongon fail)
    const COCONUT_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbygtsftenbteNaL_IUxy1a82Yy8Jy__jAHeK26NRG0HUrH_jVnCMkAeOyITvQ-lzW9f/exec";
    const ONGON_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzuVfOKjWHGjhJm4QK3vIshvLtLF8j9_U-1OM44RNsndXo7sj4Gasa_Ta1lDvALQVCm/exec";
    const REHAB_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzFcI1b96QTUub4Nt3T0cDu4bRM7b6nU7vy5VhcaHr-DfrCWAEufiLH-99QmbKbvJZ8_A/exec";

    // STEP 1: Always call main Coconut script first (writes to Google Sheet & sends primary email)
    const coconutRes = await postToGoogleScriptWithRetry(COCONUT_SCRIPT_URL, orderData, 3);

    const coconutEmailSucceeded =
      coconutRes.ok &&
      coconutRes.result?.emailSent !== false &&
      coconutRes.result?.quotaExceeded !== true &&
      !String(coconutRes.result?.error || '').toLowerCase().includes('quota') &&
      !String(coconutRes.result?.message || '').toLowerCase().includes('quota');

    let finalRes = coconutRes;

    // STEP 2: ONLY if main Coconut script email failed or quota exhausted, trigger Ongon backup script!
    if (!coconutEmailSucceeded) {
      console.warn("[Backup Triggered] coconuttreatsmore@gmail.com quota full/failed -> sending via ongon51@gmail.com");
      const ongonRes = await postToGoogleScriptWithRetry(ONGON_SCRIPT_URL, orderData, 3);
      if (ongonRes.ok) {
        finalRes = ongonRes;
      } else {
        // STEP 3: If Ongon also fails or quota runs out, trigger Rehab backup script!
        console.warn("[3rd-Tier Backup Triggered] ongon51@gmail.com failed -> sending via rehabbhuiyian1@gmail.com");
        const rehabRes = await postToGoogleScriptWithRetry(REHAB_SCRIPT_URL, orderData, 3);
        if (rehabRes.ok) {
          finalRes = rehabRes;
        }
      }
    }

    if (!finalRes.ok && !coconutRes.ok) {
      console.error("All Google Apps Script endpoints failed:", finalRes.error || coconutRes.error);
      return res.status(200).json({
        success: false,
        message: finalRes.error || coconutRes.error
      });
    }

    return res.status(200).json({
      success: true,
      result: finalRes.result || coconutRes.result || { success: true }
    });

  } catch (error) {
    console.error("Google Apps Script serverless proxy failed:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
