import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\Gigabyte\\.gemini\\antigravity\\brain\\148d27dc-4029-49b4-87e6-34bc45710faa';
const URL = 'https://coconuttreatsmore.com/';

function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function runLiveOrderAudit() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox']
  });

  const auditResults = {
    pc: { success: false, grandTotal: '', orderId: '', details: {} },
    mobile: { success: false, grandTotal: '', orderId: '', details: {} }
  };

  try {
    // ==========================================
    // 1. PC LIVE ORDER AUDIT
    // ==========================================
    console.log("=== STARTING PC LIVE ORDER AUDIT ===");
    const pcPage = await browser.newPage();
    await pcPage.evaluateOnNewDocument(() => {
      sessionStorage.setItem('hasShownPromo', 'true');
    });
    await pcPage.setViewport({ width: 1280, height: 800 });
    await pcPage.goto(URL, { waitUntil: 'networkidle2' });
    await delay(2000);

    // Scroll to order form
    await pcPage.evaluate(() => {
      const el = document.getElementById('order-form-details');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await delay(500);

    // 1. Select 2 boxes (click + button)
    console.log("PC: Incrementing quantity to 2 boxes...");
    const plusBtn = await pcPage.$('button[aria-label="Increase quantity"]');
    if (plusBtn) await plusBtn.click();
    await delay(400);

    // 2. Click gift card toggle button
    console.log("PC: Toggling gift card ON...");
    await pcPage.click('#gift-card-toggle-btn');
    await delay(600);

    // Type custom message
    await pcPage.type('#gift-message-input', 'প্রিয় মা-বাবার জন্য শুভেচ্ছা ও ভালোবাসা');
    await delay(300);

    // 3. Select bKash payment method
    console.log("PC: Selecting bKash payment...");
    await pcPage.click('#payment-method-bkash');
    await delay(500);

    // Type bKash TrxID
    await pcPage.type('#bkash-trx', 'BKASH987654');
    await delay(300);

    // 4. Fill customer details
    console.log("PC: Filling customer details...");
    await pcPage.type('#customer-name', 'আরিফ চৌধুরী');
    await pcPage.type('#customer-phone', '01711223344');
    await pcPage.type('#customer-address', 'বাড়ি ১৫, রোড ৭, ধানমন্ডি, ঢাকা');
    await delay(500);

    // 5. Submit order
    console.log("PC: Clicking Confirm Order...");
    const pcSubmitBtn = await pcPage.$('button[type="submit"]');
    await pcSubmitBtn.click();
    await delay(3000);

    // Verify order modal
    const pcModal = await pcPage.evaluate(() => {
      const successTitle = document.querySelector('h3, h2, .font-black')?.innerText;
      const bodyText = document.body.innerText;
      const hasSuccess = bodyText.includes('সফলভাবে গ্রহণ করা হয়েছে') || bodyText.includes('Order Confirmed');
      const hasGiftNotice = bodyText.includes('উপহার অর্ডার সফল হয়েছে') || bodyText.includes('গিফট কার্ড');
      return { hasSuccess, hasGiftNotice, bodySnippet: bodyText.slice(0, 300) };
    });
    auditResults.pc.success = pcModal.hasSuccess;
    auditResults.pc.details = pcModal;
    console.log("PC Audit Result:", pcModal);

    const pcShotPath = path.join(ARTIFACT_DIR, 'live_audit_pc_success.png');
    await pcPage.screenshot({ path: pcShotPath });
    console.log("Saved PC Order Screenshot:", pcShotPath);

    // ==========================================
    // 2. MOBILE LIVE ORDER AUDIT
    // ==========================================
    console.log("\n=== STARTING MOBILE LIVE ORDER AUDIT ===");
    const mobPage = await browser.newPage();
    await mobPage.evaluateOnNewDocument(() => {
      sessionStorage.setItem('hasShownPromo', 'true');
    });
    await mobPage.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 3 });
    await mobPage.goto(URL, { waitUntil: 'networkidle2' });
    await delay(2000);

    // Scroll to gift card
    await mobPage.evaluate(() => {
      const el = document.getElementById('gift-card-toggle-btn');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await delay(500);

    // 1-Tap gift card
    console.log("Mobile: 1-Tap Gift card toggle...");
    await mobPage.tap('#gift-card-toggle-btn');
    await delay(600);

    // Tap quick wish preset
    console.log("Mobile: Tapping quick wish preset...");
    await mobPage.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const bday = btns.find(b => b.textContent.includes('শুভ জন্মদিন!'));
      if (bday) bday.click();
    });
    await delay(400);

    // Fill customer info
    console.log("Mobile: Filling customer details (COD default)...");
    await mobPage.tap('#customer-name');
    await mobPage.type('#customer-name', 'নুসরাত জাহান');
    await mobPage.tap('#customer-phone');
    await mobPage.type('#customer-phone', '01855667788');
    await mobPage.tap('#customer-address');
    await mobPage.type('#customer-address', 'ফ্ল্যাট ৩বি, বনানী, ঢাকা');
    await delay(500);

    // Tap confirm order
    console.log("Mobile: Tapping Confirm Order...");
    const mobSubmitBtn = await mobPage.$('button[type="submit"]');
    await mobSubmitBtn.click();
    await delay(3000);

    // Verify order modal
    const mobModal = await mobPage.evaluate(() => {
      const bodyText = document.body.innerText;
      const hasSuccess = bodyText.includes('সফলভাবে গ্রহণ করা হয়েছে') || bodyText.includes('Order Confirmed');
      const hasGiftNotice = bodyText.includes('উপহার অর্ডার সফল হয়েছে') || bodyText.includes('গিফট কার্ড');
      return { hasSuccess, hasGiftNotice };
    });
    auditResults.mobile.success = mobModal.hasSuccess;
    auditResults.mobile.details = mobModal;
    console.log("Mobile Audit Result:", mobModal);

    const mobShotPath = path.join(ARTIFACT_DIR, 'live_audit_mobile_success.png');
    await mobPage.screenshot({ path: mobShotPath });
    console.log("Saved Mobile Order Screenshot:", mobShotPath);

    console.log("\n==========================================");
    console.log("FINAL AUDIT SUMMARY:");
    console.log(JSON.stringify(auditResults, null, 2));
    console.log("==========================================");

  } finally {
    await browser.close();
  }
}

runLiveOrderAudit();
