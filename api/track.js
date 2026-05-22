/**
 * Secure Serverless Proxy for Meta Conversions API (CAPI)
 * 
 * This handler runs server-side on Vercel or Netlify.
 * It reads environment variables securely without exposing them in the client bundle.
 */
export default async function handler(req, res) {
  // Allow only POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { eventName, eventTime, eventId, eventParams, userData } = req.body;

    // Retrieve Meta credentials securely from Environment Variables
    const pixelId = process.env.META_PIXEL_ID || '939507308912648';
    const accessToken = process.env.META_ACCESS_TOKEN;

    if (!accessToken) {
      // If access token is not set, log warning server-side and exit gracefully.
      // Returning 200/202 keeps the client UI safe and operational.
      console.warn("META_ACCESS_TOKEN is missing in server environment variables. Please configure it.");
      return res.status(202).json({
        success: false,
        message: "Meta Access Token not configured on the server."
      });
    }

    // Capture the client IP from hosting headers
    const clientIp = req.headers['x-forwarded-for'] || 
                     req.headers['x-real-ip'] || 
                     req.socket?.remoteAddress || 
                     '';

    const cleanIp = clientIp.split(',')[0].trim(); // Take the first IP if multiple exist

    // Prepare payload for Meta Graph API
    const metaPayload = {
      data: [
        {
          event_name: eventName,
          event_time: eventTime || Math.floor(Date.now() / 1000),
          action_source: "website",
          event_id: eventId,
          event_source_url: req.headers.referer || "https://coconut-treats-and-more.vercel.app/",
          user_data: {
            client_ip_address: cleanIp,
            client_user_agent: userData?.userAgent || req.headers['user-agent'] || '',
            // Populate pre-hashed user details safely sent from the client
            ...(userData?.ph ? { ph: userData.ph } : {}),
            ...(userData?.em ? { em: userData.em } : {}),
            ...(userData?.fn ? { fn: userData.fn } : {}),
            ...(userData?.ln ? { ln: userData.ln } : {}),
          },
          custom_data: {
            value: eventParams?.value ? parseFloat(eventParams.value) : undefined,
            currency: eventParams?.currency || 'BDT',
            content_name: eventParams?.content_name,
            content_type: eventParams?.content_type,
            num_items: eventParams?.num_items ? parseInt(eventParams.num_items, 10) : undefined,
          }
        }
      ]
    };

    // Forward the event to Meta Graph API
    const response = await fetch(`https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`, {
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

    return res.status(200).json({ success: true, result });
  } catch (error) {
    console.error("Meta Conversions API serverless function failed:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
