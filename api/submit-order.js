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
    const googleScriptUrl = process.env.GOOGLE_SCRIPT_URL || "https://script.google.com/macros/s/AKfybyLwe_eoKRyc4LUjm9e_4Krw5-hp5h8D759h1lKty7LvjWbkF_v7tPU5p_PpdPaRwkxBg/exec";

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
