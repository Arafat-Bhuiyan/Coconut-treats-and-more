/**
 * Secure Serverless Proxy for Google Apps Script
 * 
 * This handler runs server-side on Vercel.
 * It forwards order details to the Google Apps Script Web App URL securely
 * without exposing the Google Apps Script URL in the client bundle.
 */
export default async function handler(req, res) {
  // Allow only POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const orderData = req.body;
    const googleScriptUrl = process.env.GOOGLE_SCRIPT_URL;

    if (!googleScriptUrl) {
      console.warn("GOOGLE_SCRIPT_URL is missing in server environment variables.");
      return res.status(202).json({
        success: false,
        message: "Google Apps Script URL is not configured on the server. Please add GOOGLE_SCRIPT_URL to your Vercel environment variables."
      });
    }

    // Forward the request to Google Apps Script
    const response = await fetch(googleScriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData)
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Google Apps Script error response:", result);
      return res.status(response.status).json({ success: false, error: result });
    }

    return res.status(200).json({ success: true, result });
  } catch (error) {
    console.error("Google Apps Script serverless proxy failed:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
