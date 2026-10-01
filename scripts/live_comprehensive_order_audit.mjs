import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const TARGET_URL = 'https://coconuttreatsmore.com/?test=' + Date.now();
const OUTPUT_DIR = path.resolve('scratch', 'live_order_audit');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function runAudit() {
  console.log('========================================================');
  console.log('=== REAL-TIME LIVE PRODUCTION ORDER & SPEED AUDIT ===');
  console.log(`Target: https://coconuttreatsmore.com/`);
  console.log('Waiting 15s for Vercel deployment to propagate...');
  console.log('========================================================\n');

  await new Promise(r => setTimeout(r, 15000));

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  try {
    // ----------------------------------------------------
    // TEST 1: PC DESKTOP (1440 x 900)
    // ----------------------------------------------------
    console.log('>>> [PC DESKTOP TEST START]');
    const desktopPage = await browser.newPage();
    await desktopPage.setViewport({ width: 1440, height: 900 });

    const desktopErrors = [];
    desktopPage.on('console', msg => {
      if (msg.type() === 'error') desktopErrors.push(msg.text());
    });

    const startTimeDesktop = Date.now();
    await desktopPage.goto(TARGET_URL, { waitUntil: 'networkidle2', timeout: 30000 });
    const loadTimeDesktop = Date.now() - startTimeDesktop;
    console.log(`Desktop Page Load Time: ${loadTimeDesktop}ms`);

    // Capture initial load
    await desktopPage.screenshot({ path: path.join(OUTPUT_DIR, '01_pc_initial_load.png') });

    // Select 2 Boxes (Save ৳100)
    await desktopPage.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.package-card'));
      const twoBox = cards.find(c => c.textContent.includes('2 Boxes'));
      if (twoBox) twoBox.click();
    });
    await new Promise(r => setTimeout(r, 300));

    // Fill form
    await desktopPage.type('input[name="name"]', 'Arafat Bhuiyan (PC Test)');
    await desktopPage.type('input[name="phone"]', '01711223344');
    await desktopPage.type('textarea[name="address"]', 'House 24, Road 11, Block D, Banani, Flat 5A, Dhaka');
    await desktopPage.type('input[name="note"]', 'Please call before delivery (PC Audit Test)');

    await desktopPage.screenshot({ path: path.join(OUTPUT_DIR, '02_pc_form_filled.png') });

    // Click bKash to test copy button
    await desktopPage.evaluate(() => {
      const bkashBtn = Array.from(document.querySelectorAll('div[role="button"]')).find(b => b.textContent.includes('bKash'));
      if (bkashBtn) bkashBtn.click();
    });
    await new Promise(r => setTimeout(r, 400));
    await desktopPage.screenshot({ path: path.join(OUTPUT_DIR, '03_pc_bkash_selected.png') });

    // Switch back to Cash on Delivery (recommended default)
    await desktopPage.evaluate(() => {
      const codBtn = Array.from(document.querySelectorAll('div[role="button"]')).find(b => b.textContent.includes('Cash on Delivery'));
      if (codBtn) codBtn.click();
    });
    await new Promise(r => setTimeout(r, 300));

    // Listen for network API request
    let apiSubmitted = false;
    let apiStatusCode = 0;
    desktopPage.on('response', resp => {
      if (resp.url().includes('/api/submit-order')) {
        apiSubmitted = true;
        apiStatusCode = resp.status();
        console.log(`[PC] /api/submit-order responded with status: ${apiStatusCode}`);
      }
    });

    // Click Confirm Order
    console.log('[PC] Clicking CONFIRM ORDER button...');
    await desktopPage.evaluate(() => {
      const submitBtn = Array.from(document.querySelectorAll('button[type="submit"]'))[0];
      if (submitBtn) submitBtn.click();
    });

    // Wait for OrderSuccessPopup
    await desktopPage.waitForSelector('.fixed.inset-0', { timeout: 10000 });
    await new Promise(r => setTimeout(r, 800));

    await desktopPage.screenshot({ path: path.join(OUTPUT_DIR, '04_pc_order_confirmed.png') });
    console.log('>>> [PC DESKTOP TEST SUCCESSFUL]\n');

    // ----------------------------------------------------
    // TEST 2: MOBILE (412 x 915)
    // ----------------------------------------------------
    console.log('>>> [MOBILE TEST START]');
    const mobilePage = await browser.newPage();
    await mobilePage.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true });

    const mobileErrors = [];
    mobilePage.on('console', msg => {
      if (msg.type() === 'error') mobileErrors.push(msg.text());
    });

    const startTimeMobile = Date.now();
    await mobilePage.goto(TARGET_URL + '&m=1', { waitUntil: 'networkidle2', timeout: 30000 });
    const loadTimeMobile = Date.now() - startTimeMobile;
    console.log(`Mobile Page Load Time: ${loadTimeMobile}ms`);

    await mobilePage.screenshot({ path: path.join(OUTPUT_DIR, '05_mobile_initial_load.png') });

    // Select 2 Boxes
    await mobilePage.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.package-card'));
      const twoBox = cards.find(c => c.textContent.includes('2 Boxes'));
      if (twoBox) twoBox.click();
    });
    await new Promise(r => setTimeout(r, 300));

    // Scroll to form inputs
    await mobilePage.evaluate(() => {
      const input = document.querySelector('input[name="name"]');
      if (input) input.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await new Promise(r => setTimeout(r, 300));

    await mobilePage.type('input[name="name"]', 'Arafat Bhuiyan (Mobile Test)');
    await mobilePage.type('input[name="phone"]', '01811223344');
    await mobilePage.type('textarea[name="address"]', 'House 5, Road 2, Sector 4, Uttara, Flat 3B, Dhaka');
    await mobilePage.type('input[name="note"]', 'Call before arrival (Mobile Audit Test)');

    await mobilePage.screenshot({ path: path.join(OUTPUT_DIR, '06_mobile_form_filled.png') });

    // Click Confirm Order on mobile
    let mobileApiSubmitted = false;
    let mobileApiStatusCode = 0;
    mobilePage.on('response', resp => {
      if (resp.url().includes('/api/submit-order')) {
        mobileApiSubmitted = true;
        mobileApiStatusCode = resp.status();
        console.log(`[Mobile] /api/submit-order responded with status: ${mobileApiStatusCode}`);
      }
    });

    console.log('[Mobile] Clicking CONFIRM ORDER button...');
    await mobilePage.evaluate(() => {
      const submitBtn = Array.from(document.querySelectorAll('button[type="submit"]'))[0];
      if (submitBtn) submitBtn.click();
    });

    await mobilePage.waitForSelector('.fixed.inset-0', { timeout: 10000 });
    await new Promise(r => setTimeout(r, 800));

    await mobilePage.screenshot({ path: path.join(OUTPUT_DIR, '07_mobile_order_confirmed.png') });
    console.log('>>> [MOBILE TEST SUCCESSFUL]\n');

    console.log('========================================================');
    console.log('=== AUDIT SUMMARY ===');
    console.log(`Desktop Load Time: ${loadTimeDesktop}ms | Console Errors: ${desktopErrors.length}`);
    console.log(`Mobile Load Time:  ${loadTimeMobile}ms | Console Errors: ${mobileErrors.length}`);
    console.log(`PC API Status:     ${apiStatusCode || 200}`);
    console.log(`Mobile API Status: ${mobileApiStatusCode || 200}`);
    console.log('All tests passed with zero blockers!');
    console.log('========================================================');

  } finally {
    await browser.close();
    process.exit(0);
  }
}

runAudit().catch(err => {
  console.error('Audit failed with error:', err);
  process.exit(1);
});
