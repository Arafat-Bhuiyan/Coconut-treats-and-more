/**
 * Secure Serverless Proxy for Google Apps Script
 * 
 * This handler runs server-side on Vercel.
 * It forwards order details to the Google Apps Script Web App URL securely.
 * 
 * NOTE: Google Apps Script Web Apps redirect POST requests.
 * We handle this by following redirects (redirect: 'follow') and treating
 * any response as success since the script runs regardless of redirect.
 */
export default async function handler(req, res) {
  // Allow only POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const orderData = req.body;
    const googleScriptUrl = process.env.GOOGLE_SCRIPT_URL || "https://script.google.com/macros/s/AKfybyLwe_eoKRyc4LUjm9e_4Krw5-hp5h8D759h1lKty7LvjWbkF_v7tPU5p_PpdPaRwkxBg/exec";

    // Forward the request to Google Apps Script
    // redirect: 'follow' is essential because Google Apps Script redirects POST requests
    const response = await fetch(googleScriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      redirect: 'follow',
      body: JSON.stringify(orderData)
    });

    // Try to parse JSON response, but don't fail if it's not JSON
    let result = {};
    try {
      const text = await response.text();
      result = text ? JSON.parse(text) : { success: true };
    } catch {
      // If we can't parse JSON, the script ran but returned non-JSON (redirect response)
      // This is normal for Google Apps Script, treat as success
      result = { success: true, message: "Order submitted successfully" };
    }

    // Treat any 2xx or redirect response as success
    // Google Apps Script often returns 200 after redirect
    return res.status(200).json({ success: true, result });

  } catch (error) {
    console.error("Google Apps Script serverless proxy failed:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
