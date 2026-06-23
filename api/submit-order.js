/**
 * Secure Serverless Proxy for Google Apps Script
 * 
 * This handler runs server-side on Vercel.
 * It forwards order details to the Google Apps Script Web App URL securely.
 * 
 * NOTE: Google Apps Script Web Apps redirect POST requests.
 * We handle this by following redirects (redirect: 'follow').
 */
export default async function handler(req, res) {
  // Allow only POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const orderData = req.body;
    // New Apps Script deployed from coconuttreatsmore@gmail.com
    const googleScriptUrl = process.env.GOOGLE_SCRIPT_URL || "https://script.google.com/macros/s/AKfycbw_sgPsG1C7WG9KZH70aahRleOmieTJXNXHjzC_1Fow6J233xlxWKIRpB4rp5kd08dk/exec";

    // Forward the request to Google Apps Script
    const response = await fetch(googleScriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      redirect: 'follow',
      body: JSON.stringify(orderData)
    });

    // Try to parse JSON response
    let result = { success: true };
    try {
      const text = await response.text();
      if (text) {
        result = JSON.parse(text);
      }
    } catch {
      // Google Apps Script may return non-JSON on redirect - treat as success
      result = { success: true, message: "Order submitted successfully" };
    }

    // Return the actual result from Apps Script
    if (result.success === false) {
      console.error("Apps Script reported error:", result.error);
      return res.status(200).json({ success: false, message: result.error || "Script error" });
    }

    return res.status(200).json({ success: true, result });

  } catch (error) {
    console.error("Google Apps Script serverless proxy failed:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
