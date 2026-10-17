import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\Gigabyte\\.gemini\\antigravity\\brain\\148d27dc-4029-49b4-87e6-34bc45710faa';
const URL = 'https://coconuttreatsmore.com/';

function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function finalVerification() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox']
  });

  const report = {
    pcOrderPassed: false,
    mobileOrderPassed: false,
    giftCardToggledPassed: false,
    noZoomPassed: false,
    consoleErrors: []
  };

  try {
    const page = await browser.newPage();
    page.on('console', msg => {
      if (msg.type() === 'error') report.consoleErrors.push(msg.text());
    });

    await page.evaluateOnNewDocument(() => {
      sessionStorage.setItem('hasShownPromo', 'true');
    });

    // ==========================================
    // 1. PC END-TO-END TEST
    // ==========================================
    console.log("=== 1. RUNNING PC VERIFICATION ===");
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto(URL, { waitUntil: 'networkidle2' });
    await delay(2000);

    // Scroll to gift card box
    await page.evaluate(() => {
      const el = document.getElementById('gift-card-box-container');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await delay(500);

    // Click anywhere on gift card box
    await page.click('#gift-card-box-container');
    await delay(500);

    // Click preset
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const bday = btns.find(b => b.textContent.includes('শুভ জন্মদিন!'));
      if (bday) bday.click();
    });
    await delay(300);

    // Fill delivery form
    await page.type('#customer-name', 'আহমেদ রাজিব');
    await page.type('#customer-phone', '01811223344');
    await page.type('#customer-address', 'হাউজ ১২, রোড ৫, ধানমন্ডি, ঢাকা');
    await delay(300);

    // Click Confirm Order
    const confirmBtn = await page.$('button[type="submit"]');
    await confirmBtn.click();
    await delay(2500);

    // Check if order success
    const pcSuccess = await page.evaluate(() => {
      return document.body.innerText.includes('সফলভাবে গ্রহণ করা হয়েছে') ||
             document.body.innerText.includes('Order Confirmation');
    });
    report.pcOrderPassed = pcSuccess;
    console.log("PC Order success:", pcSuccess);

    const pcScreenshot = path.join(ARTIFACT_DIR, 'final_pc_verified_order.png');
    await page.screenshot({ path: pcScreenshot });

    // ==========================================
    // 2. MOBILE END-TO-END TEST
    // ==========================================
    console.log("=== 2. RUNNING MOBILE VERIFICATION ===");
    const mobilePage = await browser.newPage();
    mobilePage.on('console', msg => {
      if (msg.type() === 'error') report.consoleErrors.push(msg.text());
    });
    await mobilePage.evaluateOnNewDocument(() => {
      sessionStorage.setItem('hasShownPromo', 'true');
    });
    await mobilePage.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 3 });
    await mobilePage.goto(URL, { waitUntil: 'networkidle2' });
    await delay(2000);

    // Scroll to gift card container
    await mobilePage.evaluate(() => {
      const el = document.getElementById('gift-card-box-container');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await delay(500);

    // 1-Tap gift card box
    await mobilePage.tap('#gift-card-box-container');
    await delay(500);

    const mobileGiftOpened = await mobilePage.evaluate(() => {
      return !!document.getElementById('gift-message-input');
    });
    report.giftCardToggledPassed = mobileGiftOpened;
    console.log("Mobile Gift Card 1-Tap opened:", mobileGiftOpened);

    // Check input font-size for zoom prevention
    const fontSize = await mobilePage.evaluate(() => {
      const el = document.getElementById('customer-name');
      return window.getComputedStyle(el).fontSize;
    });
    report.noZoomPassed = (fontSize === '16px');
    console.log("Mobile Input Font Size (Must be 16px):", fontSize);

    // Fill form on mobile
    await mobilePage.tap('#customer-name');
    await mobilePage.type('#customer-name', 'মাহিরা খাতুন');
    await mobilePage.tap('#customer-phone');
    await mobilePage.type('#customer-phone', '01799887766');
    await mobilePage.tap('#customer-address');
    await mobilePage.type('#customer-address', 'মিরপুর ১০, ঢাকা');
    await delay(500);

    // Tap confirm order
    const mobileConfirmBtn = await mobilePage.$('button[type="submit"]');
    await mobileConfirmBtn.click();
    await delay(2500);

    const mobileSuccess = await mobilePage.evaluate(() => {
      return document.body.innerText.includes('সফলভাবে গ্রহণ করা হয়েছে') ||
             document.body.innerText.includes('Order Confirmation');
    });
    report.mobileOrderPassed = mobileSuccess;
    console.log("Mobile Order success:", mobileSuccess);

    const mobileScreenshot = path.join(ARTIFACT_DIR, 'final_mobile_verified_order.png');
    await mobilePage.screenshot({ path: mobileScreenshot });

    console.log("\n==========================================");
    console.log("FINAL AUDIT SUMMARY REPORT:");
    console.log(JSON.stringify(report, null, 2));
    console.log("==========================================");

  } catch (err) {
    console.error("Verification failed:", err);
  } finally {
    await browser.close();
  }
}

finalVerification();
