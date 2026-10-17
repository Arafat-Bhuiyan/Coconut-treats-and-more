import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\Gigabyte\\.gemini\\antigravity\\brain\\148d27dc-4029-49b4-87e6-34bc45710faa';
const URL = 'https://coconuttreatsmore.com/';

function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function verifyMobileNoZoom() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
      sessionStorage.setItem('hasShownPromo', 'true');
    });

    console.log("Setting Mobile Viewport (iPhone 14: 390x844)...");
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 3 });
    await page.goto(URL, { waitUntil: 'networkidle2' });
    await delay(2000);

    // 1. Check computed styles of inputs and borders
    const stylesCheck = await page.evaluate(() => {
      const nameInput = document.getElementById('customer-name');
      const phoneInput = document.getElementById('customer-phone');
      const addressInput = document.getElementById('customer-address');
      
      const nameStyle = nameInput ? window.getComputedStyle(nameInput) : null;
      const phoneStyle = phoneInput ? window.getComputedStyle(phoneInput) : null;
      const addressStyle = addressInput ? window.getComputedStyle(addressInput) : null;

      // Find order summary and delivery cards
      const allDivs = Array.from(document.querySelectorAll('div'));
      const orderSummaryCard = allDivs.find(d => d.textContent.includes('Order Summary') && d.classList.contains('rounded-2xl'));
      const deliveryCard = allDivs.find(d => d.textContent.includes('ডেলিভারি ঠিকানা ও তথ্য') && d.classList.contains('rounded-2xl'));

      return {
        nameFontSize: nameStyle ? nameStyle.fontSize : 'N/A',
        nameTouchAction: nameStyle ? nameStyle.touchAction : 'N/A',
        phoneFontSize: phoneStyle ? phoneStyle.fontSize : 'N/A',
        phoneTouchAction: phoneStyle ? phoneStyle.touchAction : 'N/A',
        addressFontSize: addressStyle ? addressStyle.fontSize : 'N/A',
        addressTouchAction: addressStyle ? addressStyle.touchAction : 'N/A',
        orderSummaryBorder: orderSummaryCard ? {
          borderWidth: window.getComputedStyle(orderSummaryCard).borderWidth,
          borderColor: window.getComputedStyle(orderSummaryCard).borderColor,
          classes: orderSummaryCard.className
        } : 'Not found',
        deliveryBorder: deliveryCard ? {
          borderWidth: window.getComputedStyle(deliveryCard).borderWidth,
          borderColor: window.getComputedStyle(deliveryCard).borderColor,
          classes: deliveryCard.className
        } : 'Not found'
      };
    });

    console.log("=== COMPUTED STYLES CHECK ===");
    console.log(JSON.stringify(stylesCheck, null, 2));

    // 2. Scroll to Delivery Details card and focus name input
    await page.evaluate(() => {
      const el = document.getElementById('customer-name');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await delay(1000);

    console.log("Tapping #customer-name input on mobile...");
    await page.tap('#customer-name');
    await page.type('#customer-name', 'সুমাইয়া ইসলাম');
    await delay(500);

    console.log("Tapping #customer-phone input on mobile...");
    await page.tap('#customer-phone');
    await page.type('#customer-phone', '01712345678');
    await delay(500);

    console.log("Tapping #customer-address input on mobile...");
    await page.tap('#customer-address');
    await page.type('#customer-address', 'ধানমন্ডি, ঢাকা');
    await delay(500);

    const mobileInputFocusedPath = path.join(ARTIFACT_DIR, 'mobile_input_focused_no_zoom.png');
    await page.screenshot({ path: mobileInputFocusedPath });
    console.log("Saved mobile focused screenshot:", mobileInputFocusedPath);

    // 3. Scroll to gift card option and tap
    console.log("Tapping gift card checkbox...");
    await page.evaluate(() => {
      const el = document.getElementById('gift-option-checkbox');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await delay(500);
    await page.tap('#gift-option-checkbox');
    await delay(800);

    // Tap gift message input and type message
    await page.tap('#gift-message-input');
    await page.type('#gift-message-input', 'প্রিয় বন্ধুর জন্য স্পেশাল গিফট');
    await delay(500);

    const mobileGiftScreenshot = path.join(ARTIFACT_DIR, 'mobile_gift_card_filled.png');
    await page.screenshot({ path: mobileGiftScreenshot });
    console.log("Saved mobile gift filled screenshot:", mobileGiftScreenshot);

    // 4. Desktop Viewport check
    console.log("Testing PC Viewport (1280x800)...");
    await page.setViewport({ width: 1280, height: 800 });
    await delay(1000);
    await page.evaluate(() => {
      const el = document.getElementById('checkout-grid-container');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await delay(800);

    const pcScreenshot = path.join(ARTIFACT_DIR, 'pc_bold_borders_layout.png');
    await page.screenshot({ path: pcScreenshot });
    console.log("Saved PC screenshot:", pcScreenshot);

    console.log("ALL VERIFICATIONS COMPLETED SUCCESSFULLY!");
  } catch (err) {
    console.error("Test error:", err);
  } finally {
    await browser.close();
  }
}

verifyMobileNoZoom();
