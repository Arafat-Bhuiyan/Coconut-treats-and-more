/**
 * Secure Serverless Proxy for Google Apps Script
 * 
 * This handler runs server-side on Vercel.
 * It forwards order details to the Google Apps Script Web App URL securely.
 * 
 * NOTE: Google Apps Script Web Apps redirect POST requests.
 * We handle this by following redirects (redirect: 'follow').
 */
// Server-side in-memory cache to prevent duplicate order submissions (e.g. double taps, network retries)
const recentOrdersCache = new Map();
const DEDUPLICATION_WINDOW_MS = 90 * 1000; // 90 seconds deduplication window

function cleanupExpiredOrders() {
  const now = Date.now();
  for (const [key, timestamp] of recentOrdersCache.entries()) {
    if (now - timestamp > DEDUPLICATION_WINDOW_MS * 2) {
      recentOrdersCache.delete(key);
    }
  }
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
    const lowerAddr = String(address).toLowerCase();
    const isRestricted = RESTRICTED_KEYS.some((k) => lowerAddr.includes(k));
    if (isRestricted) {
      return res.status(400).json({
        success: false,
        message: "Delivery is currently unavailable in this area. Fresh pudding delivery is inside Dhaka City only."
      });
    }

    // Clean phone number for deduplication
    const cleanPhone = String(phone).replace(/[^0-9]/g, '');
    const idempotencyKey = `${cleanPhone}_${String(address).trim().toLowerCase().slice(0, 35)}`;

    // Periodic cleanup of expired orders
    cleanupExpiredOrders();

    // Check if this exact order was already processed recently
    if (recentOrdersCache.has(idempotencyKey)) {
      const lastProcessedTime = recentOrdersCache.get(idempotencyKey);
      const elapsed = Date.now() - lastProcessedTime;
      if (elapsed < DEDUPLICATION_WINDOW_MS) {
        console.warn(`[Idempotency Guard] Duplicate order attempt for ${cleanPhone} blocked (${Math.round(elapsed / 1000)}s since last submission).`);
        return res.status(200).json({
          success: true,
          duplicate: true,
          message: "Order already received and queued for dispatch. Duplicate email suppressed."
        });
      }
    }

    // Record order timestamp immediately to lock out concurrent duplicate requests
    recentOrdersCache.set(idempotencyKey, Date.now());

    orderData.Phone = phone;
    orderData.Address = address;

    // New Apps Script deployed from coconuttreatsmore@gmail.com
    const googleScriptUrl = process.env.GOOGLE_SCRIPT_URL || "https://script.google.com/macros/s/AKfycbygtsftenbteNaL_IUxy1a82Yy8Jy__jAHeK26NRG0HUrH_jVnCMkAeOyITvQ-lzW9f/exec";

    // Forward the request to Google Apps Script
    const response = await fetch(googleScriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      redirect: 'follow',
      body: JSON.stringify(orderData)
    });

    // Try to parse response
    let result = { success: false };
    const text = await response.text();

    if (!response.ok) {
      console.error(`Google Apps Script returned status ${response.status}:`, text);
      return res.status(response.status).json({
        success: false,
        message: `Google Sheets API returned status ${response.status}. Please make sure 'Who has access' is set to 'Anyone'.`
      });
    }

    try {
      if (text) {
        result = JSON.parse(text);
      } else {
        result = { success: true };
      }
    } catch {
      // If it's a 200 response but not valid JSON
      result = { success: true, message: "Order logged" };
    }

    // Return the actual result from Apps Script
    if (result.success === false) {
      console.error("Apps Script reported error:", result.error || result.message);
      return res.status(200).json({ success: false, message: result.error || result.message || "Script error" });
    }

    return res.status(200).json({ success: true, result });

  } catch (error) {
    console.error("Google Apps Script serverless proxy failed:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
