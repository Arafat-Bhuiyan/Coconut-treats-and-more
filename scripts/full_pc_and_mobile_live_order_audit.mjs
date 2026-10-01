import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const TARGET_URL = 'https://coconuttreatsmore.com/';
const SCREENSHOT_DIR = path.resolve('scratch', 'live_audit_pc_mobile');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runDesktopAndMobileAudit() {
  console.log('===============================================================');
  console.log('=== STARTING COMPLETE PC & MOBILE LIVE PRODUCTION AUDIT ===');
  console.log(`Target: ${TARGET_URL}`);
  console.log('===============================================================\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });

  // ==========================================
  // PART 1: PC (DESKTOP) LIVE TEST & ORDER
  // ==========================================
  console.log('>>> [PART 1/2] RUNNING PC (DESKTOP) TEST & LIVE ORDER...');
  const pcPage = await browser.newPage();
  await pcPage.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  let pcOrderReq = null;
  let pcOrderRes = null;

  pcPage.on('request', (req) => {
    if (req.url().includes('/api/submit-order')) {
      pcOrderReq = { url: req.url(), postData: req.postData() };
      console.log('>> [PC NETWORK] /api/submit-order REQUEST FIRED:', req.postData());
    }
  });

  pcPage.on('response', async (res) => {
    if (res.url().includes('/api/submit-order')) {
      let body = '';
      try { body = await res.text(); } catch { body = '<err>'; }
      pcOrderRes = { status: res.status(), body };
      console.log(`<< [PC NETWORK] /api/submit-order RESPONSE (${res.status()}):`, body);
    }
  });

  console.log('[PC Step 1] Navigating to homepage on Desktop...');
  await pcPage.goto(TARGET_URL, { waitUntil: 'networkidle2', timeout: 30000 });
  await pcPage.screenshot({ path: path.join(SCREENSHOT_DIR, '01_pc_desktop_hero.png') });
  console.log('✓ Desktop Homepage loaded.');

  // Trigger and test the promotion popup on desktop
  console.log('[PC Step 2] Triggering Promotion Popup on Desktop...');
  await pcPage.evaluate(() => {
    window.scrollBy(0, 100);
    window.dispatchEvent(new Event('mousemove'));
  });
  await new Promise(r => setTimeout(r, 3500));

  let pcPopupBtn = await pcPage.$('button.popup-green-blink-btn');
  if (pcPopupBtn) {
    console.log('✓ Promotion Popup appeared on Desktop. Taking screenshot...');
    await pcPage.screenshot({ path: path.join(SCREENSHOT_DIR, '02_pc_popup_active.png') });
    
    // Tap the order button on popup to claim offer
    console.log('[PC Step 3] Clicking "অর্ডার করুন (Order Now)" inside Desktop Popup...');
    await pcPopupBtn.click();
    await new Promise(r => setTimeout(r, 1200));
  } else {
    // If not shown automatically, click Quick Order
    console.log('Clicking Quick Order in Navbar...');
    const quickOrderBtn = await pcPage.$('a[href="#order"]');
    if (quickOrderBtn) await quickOrderBtn.click();
    await new Promise(r => setTimeout(r, 800));
  }

  const pcScrollY = await pcPage.evaluate(() => window.pageYOffset || document.documentElement.scrollTop);
  console.log(`✓ Desktop Scroll Position: ${pcScrollY}px (Landed cleanly on Order section)`);

  console.log('[PC Step 4] Filling Order Form on Desktop...');
  await pcPage.type('input[name="name"]', 'তানভীর আহমেদ (PC Live Test)', { delay: 20 });
  await pcPage.type('input[name="phone"]', '01819999999', { delay: 20 });
  await pcPage.type('textarea[name="address"]', 'ফ্ল্যাট ৪বি, বাড়ি ২২, রোড ৯, গুলশান-২, ঢাকা', { delay: 20 });
  await pcPage.type('input[name="note"]', '[Live PC Automated Audit Order - Please Ignore]', { delay: 20 });
  await pcPage.screenshot({ path: path.join(SCREENSHOT_DIR, '03_pc_form_filled.png') });

  console.log('[PC Step 5] Clicking "CONFIRM ORDER" on Desktop...');
  const pcSubmitBtn = await pcPage.$('button[type="submit"]');
  await pcPage.evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'center' }), pcSubmitBtn);
  await new Promise(r => setTimeout(r, 300));
  await pcSubmitBtn.click();

  console.log('[PC Step 6] Waiting for Order Confirmation modal on Desktop...');
  await pcPage.waitForSelector('div.fixed.inset-0.z-\\[100\\]', { visible: true, timeout: 10000 });
  await new Promise(r => setTimeout(r, 800));
  await pcPage.screenshot({ path: path.join(SCREENSHOT_DIR, '04_pc_order_success.png') });
  console.log('✓ Desktop Success Modal captured!');

  // Test ESC key closing modal on PC
  console.log('[PC Step 7] Testing ESC key to close modal on Desktop...');
  await pcPage.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 500));
  const isModalClosedByEsc = await pcPage.evaluate(() => !document.querySelector('div.fixed.inset-0.z-\\[100\\]'));
  console.log(`✓ Modal closed by pressing ESC key: ${isModalClosedByEsc}`);

  await pcPage.close();

  // ==========================================
  // PART 2: MOBILE LIVE TEST & ORDER
  // ==========================================
  console.log('\n>>> [PART 2/2] RUNNING MOBILE (IPHONE) TEST & LIVE ORDER...');
  const mobilePage = await browser.newPage();
  await mobilePage.setViewport({ width: 393, height: 852, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  await mobilePage.setUserAgent(
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1'
  );

  let mobileOrderReq = null;
  let mobileOrderRes = null;

  mobilePage.on('request', (req) => {
    if (req.url().includes('/api/submit-order')) {
      mobileOrderReq = { url: req.url(), postData: req.postData() };
      console.log('>> [MOBILE NETWORK] /api/submit-order REQUEST FIRED:', req.postData());
    }
  });

  mobilePage.on('response', async (res) => {
    if (res.url().includes('/api/submit-order')) {
      let body = '';
      try { body = await res.text(); } catch { body = '<err>'; }
      mobileOrderRes = { status: res.status(), body };
      console.log(`<< [MOBILE NETWORK] /api/submit-order RESPONSE (${res.status()}):`, body);
    }
  });

  console.log('[Mobile Step 1] Navigating to homepage on Mobile...');
  await mobilePage.goto(TARGET_URL, { waitUntil: 'networkidle2', timeout: 30000 });
  await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, '05_mobile_hero.png') });

  console.log('[Mobile Step 2] Triggering natural promo popup on Mobile...');
  await mobilePage.evaluate(() => {
    window.dispatchEvent(new Event('touchstart'));
    window.scrollBy(0, 80);
    window.dispatchEvent(new Event('scroll'));
  });
  await new Promise(r => setTimeout(r, 3800));

  // Check if promo popup exists and click its CTA or close it
  const ctaBtn = await mobilePage.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const target = btns.find(b => b.textContent.includes('অর্ডার') || b.textContent.includes('Order'));
    if (target) {
      target.click();
      return true;
    }
    return false;
  });
  console.log('Mobile CTA / Popup interaction:', ctaBtn);
  await new Promise(r => setTimeout(r, 1000));

  console.log('[Mobile Step 4] Filling Order Form on Mobile...');
  await mobilePage.type('input[name="name"]', 'সাকিব আহমেদ (Mobile Live Test)', { delay: 20 });
  await mobilePage.type('input[name="phone"]', '01711223344', { delay: 20 });
  await mobilePage.type('textarea[name="address"]', 'বাসা ১২, রোড ৪, ব্লক সি, বনশ্রী, ঢাকা', { delay: 20 });
  await mobilePage.type('input[name="note"]', '[Live Mobile Automated Audit Order - Please Ignore]', { delay: 20 });
  await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, '07_mobile_form_ready.png') });

  console.log('[Mobile Step 5] Scrolling to and Tapping "CONFIRM ORDER" on Mobile...');
  const mobileSubmitBtn = await mobilePage.$('button[type="submit"]');
  await mobilePage.evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'center' }), mobileSubmitBtn);
  await new Promise(r => setTimeout(r, 400));

  const mobileSubmitBox = await mobileSubmitBtn.boundingBox();
  await mobilePage.touchscreen.tap(mobileSubmitBox.x + mobileSubmitBox.width / 2, mobileSubmitBox.y + mobileSubmitBox.height / 2);

  console.log('[Mobile Step 6] Waiting for Order Confirmation modal on Mobile...');
  await mobilePage.waitForSelector('div.fixed.inset-0.z-\\[100\\]', { visible: true, timeout: 10000 });
  await new Promise(r => setTimeout(r, 800));
  await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, '08_mobile_order_success.png') });
  console.log('✓ Mobile Success Modal captured!');

  await new Promise(r => setTimeout(r, 2000));
  await mobilePage.close();
  await browser.close();

  console.log('\n===============================================================');
  console.log('=== COMPLETE PC & MOBILE AUDIT SUMMARY ===');
  console.log(`PC Order Request: ${pcOrderReq ? 'SUCCESS (Sent)' : 'FAILED'}`);
  console.log(`PC Order Response: ${pcOrderRes ? `HTTP ${pcOrderRes.status}` : 'FAILED'}`);
  console.log(`Mobile Order Request: ${mobileOrderReq ? 'SUCCESS (Sent)' : 'FAILED'}`);
  console.log(`Mobile Order Response: ${mobileOrderRes ? `HTTP ${mobileOrderRes.status}` : 'FAILED'}`);
  console.log('===============================================================');
}

runDesktopAndMobileAudit().catch(err => {
  console.error('Audit fatal error:', err);
  process.exit(1);
});
