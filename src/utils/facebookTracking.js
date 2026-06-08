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
  // Handle various formats: 01XXXXXXXXX, 8801XXXXXXXXX, +8801XXXXXXXXX
  if (clean.length === 11 && clean.startsWith('0')) {
    clean = '880' + clean.slice(1); // Replace leading 0 with 880
  } else if (clean.length === 10 && !clean.startsWith('880')) {
    clean = '880' + clean; // Add full BD country code
  } else if (clean.startsWith('88') && clean.length === 13) {
    // Already correct format: 8801XXXXXXXXX
  }
  return clean.length >= 12 ? clean : null; // Only return valid numbers
}

// Helper to read a cookie value by name
function getCookie(name) {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

/**
 * Universal Meta Pixel and Conversions API Event Tracker
 * Sends the event to the browser-side Pixel and concurrently proxies to Conversions API
 */
export async function trackFacebookEvent(eventName, eventParams = {}, rawUserData = {}) {
  // 1. Generate unique event ID for deduplication
  const eventId = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // 2. Load and cache user data for Advanced Matching
  let finalUserData = { ...rawUserData };

  // If name/phone are missing, try loading from localStorage (highly boosts returning visitor PageView match quality)
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem("cc_user_data");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.phone && !finalUserData.phone) finalUserData.phone = parsed.phone;
        if (parsed.name && !finalUserData.name) finalUserData.name = parsed.name;
      }
    } catch (e) {
      console.debug("Failed to read user data cache:", e);
    }

    // Persist new user data if provided
    if (rawUserData.phone || rawUserData.name) {
      try {
        localStorage.setItem("cc_user_data", JSON.stringify({
          phone: rawUserData.phone || "",
          name: rawUserData.name || "",
        }));
      } catch (e) {
        console.debug("Failed to write user data cache:", e);
      }
    }
  }

  // 3. Prepare hashed user details for Advanced Matching
  const userData = {};
  
  if (finalUserData.phone) {
    const formattedPhone = formatPhoneForMeta(finalUserData.phone);
    if (formattedPhone) {
      userData.ph = await sha256(formattedPhone);
    }
  }

  if (finalUserData.email) {
    userData.em = await sha256(finalUserData.email);
  }

  if (finalUserData.name) {
    const trimmedName = finalUserData.name.trim().toLowerCase();
    const nameParts = trimmedName.split(/\s+/);
    if (nameParts.length > 0) {
      userData.fn = await sha256(nameParts[0]); // First name
      if (nameParts.length > 1) {
        userData.ln = await sha256(nameParts[nameParts.length - 1]); // Last name
      }
    }
  }

  // Automatically attach City, State, Zip and Country parameters (delivery is in Dhaka, BD)
  // These geo-parameters significantly boost Event Match Quality score
  userData.ct = await sha256("dhaka");         // city: dhaka
  userData.st = await sha256("dhaka");          // state: dhaka division
  userData.zp = await sha256("1000");           // zip: Dhaka central postal code
  userData.country = await sha256("bd");        // country: bangladesh

  // Retrieve Browser ID (_fbp) and Click ID (_fbc) cookies for perfect event matching
  const fbp = getCookie('_fbp');
  const fbc = getCookie('_fbc');
  if (fbp) userData.fbp = fbp;
  if (fbc) userData.fbc = fbc;

  // 4. Fire Client-side Meta Pixel Event (Browser)
  if (typeof window !== "undefined" && window.fbq) {
    try {
      // Re-initialize with Hashed Advanced Matching parameters to update user profile before tracking the event
      window.fbq('init', '939507308912648', userData);
      
      window.fbq('track', eventName, {
        ...eventParams,
      }, {
        eventID: eventId
      });
      console.log(`[Meta Pixel] Sent '${eventName}' with Advanced Matching. ID: ${eventId}`);
    } catch (err) {
      console.error("[Meta Pixel] Failed to track browser-side event:", err);
    }
  } else {
    console.warn("[Meta Pixel] window.fbq is not loaded. Skipping browser track.");
  }

  // 5. Fire Server-side Conversions API Event (Via our secure serverless proxy)
  try {
    const payload = {
      eventName,
      eventTime: Math.floor(Date.now() / 1000),
      eventId,
      eventParams,
      userData: {
        ...userData,
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : '',
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
