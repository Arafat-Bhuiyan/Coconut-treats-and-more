// SHA-256 Hashing helper using Web Crypto API
async function sha256(message) {
  if (!message) return null;
  try {
    const cleaned = message.trim().toLowerCase();
    const msgBuffer = new TextEncoder().encode(cleaned);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (e) {
    console.warn("Cryptography API fallback used for hashing:", e);
    // Simple fallback if Crypto API is not available (e.g., non-HTTPS dev sites)
    return null;
  }
}

// Clean and format Bangladeshi phone numbers to international standard
function formatPhoneForMeta(phone) {
  if (!phone) return null;
  let clean = phone.replace(/[^0-9]/g, '');
  if (clean.length === 11 && clean.startsWith('0')) {
    clean = '88' + clean; // Add Bangladesh country code
  }
  return clean;
}

/**
 * Universal Meta Pixel and Conversions API Event Tracker
 * Sends the event to the browser-side Pixel and concurrently proxies to Conversions API
 */
export async function trackFacebookEvent(eventName, eventParams = {}, rawUserData = {}) {
  // 1. Generate unique event ID for deduplication
  const eventId = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // 2. Prepare user data and hash details securely in browser
  const userData = {};
  
  if (rawUserData.phone) {
    const formattedPhone = formatPhoneForMeta(rawUserData.phone);
    if (formattedPhone) {
      userData.ph = await sha256(formattedPhone);
    }
  }

  if (rawUserData.email) {
    userData.em = await sha256(rawUserData.email);
  }

  if (rawUserData.name) {
    const trimmedName = rawUserData.name.trim().toLowerCase();
    const nameParts = trimmedName.split(/\s+/);
    if (nameParts.length > 0) {
      userData.fn = await sha256(nameParts[0]); // First name
      if (nameParts.length > 1) {
        userData.ln = await sha256(nameParts[nameParts.length - 1]); // Last name
      }
    }
  }

  // 3. Fire Client-side Meta Pixel Event (Browser)
  if (window.fbq) {
    try {
      window.fbq('track', eventName, {
        ...eventParams,
      }, {
        eventID: eventId
      });
      console.log(`[Meta Pixel] Successfully sent '${eventName}' event. ID: ${eventId}`);
    } catch (err) {
      console.error("[Meta Pixel] Failed to track browser-side event:", err);
    }
  } else {
    console.warn("[Meta Pixel] window.fbq is not loaded. Skipping browser track.");
  }

  // 4. Fire Server-side Conversions API Event (Via our secure serverless proxy)
  try {
    const payload = {
      eventName,
      eventTime: Math.floor(Date.now() / 1000),
      eventId,
      eventParams,
      userData: {
        ...userData,
        userAgent: navigator.userAgent,
      }
    };

    fetch('/api/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    .then(async (res) => {
      if (res.ok) {
        console.log(`[Meta Conversions API] Event '${eventName}' sent to proxy successfully. ID: ${eventId}`);
      } else {
        const errData = await res.json().catch(() => ({}));
        console.debug("[Meta Conversions API] Server response warning:", errData);
      }
    })
    .catch((err) => {
      // Catch network-level issues silently so the app behavior remains smooth
      console.debug("[Meta Conversions API] API track proxy request deferred:", err.message);
    });
  } catch (err) {
    console.debug("[Meta Conversions API] Failed to invoke track proxy:", err);
  }
}
