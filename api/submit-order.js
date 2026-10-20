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

    // Server-side restricted delivery area check (Savar, Ashulia, Keraniganj, Narayanganj, Munshiganj, Jatrabari)
    const RESTRICTED_KEYS = [
      "savar", "সাভার", "ashulia", "আশুলিয়া", "asulia",
      "keraniganj", "কেরানীগঞ্জ", "keranigang", "keranigonj",
      "narayanganj", "নারায়ণগঞ্জ", "naraynganj", "narayangonj", "fatullah", "ফতুল্লা",
      "munshiganj", "মুন্সীগঞ্জ", "munshigang",
      "jatrabari", "যাত্রাবাড়ী", "sayedabad", "সায়েদাবাদ",
      "gazipur", "গাজীপুর", "tongi", "টঙ্গী"
    ];
    const SAFE_DHAKA_ROADS = [
      "tongi diversion", "টঙ্গী ডাইভারশন", "mymensingh road", "mymensingh lane", "ময়মনসিংহ রোড",
      "comilla para", "কুমিল্লা পাড়া"
    ];
    const lowerAddr = String(address).toLowerCase();
    const isSafeRoad = SAFE_DHAKA_ROADS.some((r) => lowerAddr.includes(r));
    const isRestricted = !isSafeRoad && RESTRICTED_KEYS.some((k) => lowerAddr.includes(k));
    if (isRestricted) {
      return res.status(400).json({
        success: false,
        message: "Delivery is currently unavailable in this area. Fresh pudding delivery is inside Dhaka City only."
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

    // Forward the request to Google Apps Script with automatic concurrency retry & jittered backoff
    const forwardRes = await postToGoogleScriptWithRetry(googleScriptUrl, orderData, 3);

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
