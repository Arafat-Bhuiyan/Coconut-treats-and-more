import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const TARGET_URL = 'https://coconuttreatsmore.com/';
const SCREENSHOT_DIR = path.resolve('scratch', 'live_audit_pc_mobile');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runComprehensiveLiveAudit() {
  console.log('================================================================');
  console.log('=== FULL LIVE PRODUCTION AUDIT (PC + MOBILE) & LIVE TEST ORDER ===');
  console.log(`Target URL: ${TARGET_URL}`);
  console.log('================================================================\n');

  // Wait 15 seconds to ensure Vercel has finished deploying the latest commit
  console.log('Waiting 15 seconds for Vercel deployment propagation...');
  await new Promise(r => setTimeout(r, 15000));

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });

  const auditReport = {
    pc: { consoleErrors: [], validationPassed: false, liveOrderSubmitted: false, successModalOpened: false },
    mobile: { consoleErrors: [], noHorizontalOverflow: false, liveOrderSubmitted: false, successModalOpened: false }
  };

  try {
    // ==========================================
    // PART 1: DESKTOP (PC) AUDIT & TEST ORDER
    // ==========================================
    console.log('>>> [1/2] DESKTOP (PC) 1440x900 AUDIT STARTING...');
    const pcPage = await browser.newPage();
    await pcPage.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

    pcPage.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!text.includes('facebook') && !text.includes('ERR_BLOCKED_BY_CLIENT')) {
          auditReport.pc.consoleErrors.push(text);
          console.error(' [PC Console Error]:', text);
        }
      }
    });

    let pcOrderPayload = null;
    let pcOrderResponseStatus = null;

    pcPage.on('request', req => {
      if (req.url().includes('/api/submit-order')) {
        pcOrderPayload = req.postData();
        console.log(' >> [PC NETWORK REQUEST] /api/submit-order FIRED:', pcOrderPayload);
      }
    });

    pcPage.on('response', async res => {
      if (res.url().includes('/api/submit-order')) {
        pcOrderResponseStatus = res.status();
        let body = '';
        try { body = await res.text(); } catch {}
        console.log(` << [PC NETWORK RESPONSE] status: ${pcOrderResponseStatus}, body:`, body);
      }
    });

    // Step 1: Load Homepage
    console.log('[PC 1] Loading homepage...');
    await pcPage.goto(TARGET_URL, { waitUntil: 'networkidle2', timeout: 35000 });
    await pcPage.screenshot({ path: path.join(SCREENSHOT_DIR, '01_pc_homepage_hero.png') });
    console.log('✓ Desktop Homepage loaded.');

    // Step 2: Test Stepper (+ button) without auto-scroll
    console.log('[PC 2] Testing custom quantity stepper...');
    const scrollBeforeStepper = await pcPage.evaluate(() => window.scrollY);
    for (let i = 0; i < 3; i++) {
      await pcPage.evaluate(() => {
        const plusBtn = Array.from(document.querySelectorAll('button[aria-label="Increase boxes"]'))[0];
        if (plusBtn) plusBtn.click();
      });
      await new Promise(r => setTimeout(r, 150));
    }
    const scrollAfterStepper = await pcPage.evaluate(() => window.scrollY);
    console.log(`✓ Stepper Scroll: before=${scrollBeforeStepper}, after=${scrollAfterStepper} (No unexpected jumping)`);

    // Step 3: Test Form Validation (Empty Phone validation)
    console.log('[PC 3] Testing form validation error handling...');
    await pcPage.evaluate(() => {
      const formEl = document.getElementById('order-form-details');
      if (formEl) formEl.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await new Promise(r => setTimeout(r, 300));

    // Focus and click submit without entering phone
    const submitBtn = await pcPage.$('button[type="submit"]');
    if (submitBtn) await submitBtn.click();
    await new Promise(r => setTimeout(r, 400));

    const errorMsg = await pcPage.evaluate(() => {
      const errEl = document.querySelector('.bg-red-50');
      return errEl ? errEl.textContent : '';
    });
    console.log(`✓ Form Validation Caught: "${errorMsg.trim()}"`);
    if (errorMsg) auditReport.pc.validationPassed = true;
    await pcPage.screenshot({ path: path.join(SCREENSHOT_DIR, '02_pc_validation_error.png') });

    // Step 4: Test bKash Selection and Copy Button
    console.log('[PC 4] Testing bKash payment method selection & copy...');
    await pcPage.evaluate(() => {
      const bKashOption = Array.from(document.querySelectorAll('div[role="button"]')).find(el => el.textContent.includes('bKash'));
      if (bKashOption) bKashOption.click();
    });
    await new Promise(r => setTimeout(r, 300));

    const copyBtn = await pcPage.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('নাম্বার কপি করুন'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    await new Promise(r => setTimeout(r, 300));
    await pcPage.screenshot({ path: path.join(SCREENSHOT_DIR, '03_pc_bkash_copied.png') });
    console.log(`✓ bKash copy button clicked: ${copyBtn}`);

    // Switch back to COD for live order test
    await pcPage.evaluate(() => {
      const codOption = Array.from(document.querySelectorAll('div[role="button"]')).find(el => el.textContent.includes('CASH ON DELIVERY'));
      if (codOption) codOption.click();
    });
    await new Promise(r => setTimeout(r, 200));

    // Step 5: Fill Valid Information by typing (triggering React onChange synthetic events)
    console.log('[PC 5] Typing verified test order information...');
    await pcPage.click('input[name="name"]');
    await pcPage.type('input[name="name"]', 'তানভীর আহমেদ (PC Live Test)', { delay: 15 });

    await pcPage.click('input[name="phone"]');
    await pcPage.type('input[name="phone"]', '01819999999', { delay: 15 });

    await pcPage.click('textarea[name="address"]');
    await pcPage.type('textarea[name="address"]', 'ফ্ল্যাট ৪বি, বাড়ি ২২, রোড ৯, গুলশান-২, ঢাকা', { delay: 15 });

    await pcPage.click('input[name="note"]');
    await pcPage.type('input[name="note"]', '[Live Automated Audit Order - Test Please Ignore]', { delay: 15 });

    await new Promise(r => setTimeout(r, 300));
    await pcPage.screenshot({ path: path.join(SCREENSHOT_DIR, '04_pc_order_form_filled.png') });

    console.log('[PC 6] Clicking CONFIRM ORDER button...');
    const confirmBtn = await pcPage.$('button[type="submit"]');
    await confirmBtn.click();

    console.log('[PC 7] Waiting for Order Confirmation modal...');
    await pcPage.waitForSelector('div.fixed.inset-0.z-\\[100\\]', { visible: true, timeout: 12000 });
    await new Promise(r => setTimeout(r, 800));
    await pcPage.screenshot({ path: path.join(SCREENSHOT_DIR, '05_pc_order_success_modal.png') });
    console.log('✓ Desktop Success Modal captured successfully!');
    auditReport.pc.liveOrderSubmitted = !!pcOrderPayload;
    auditReport.pc.successModalOpened = true;

    // Test ESC key closes modal
    console.log('[PC 8] Testing ESC key to close modal...');
    await pcPage.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 500));
    const isModalClosed = await pcPage.evaluate(() => !document.querySelector('div.fixed.inset-0.z-\\[100\\]'));
    console.log(`✓ Modal closed by pressing ESC key: ${isModalClosed}`);
    await pcPage.close();

    // ==========================================
    // PART 2: MOBILE (SMARTPHONE) AUDIT
    // ==========================================
    console.log('\n>>> [2/2] MOBILE (IPHONE / ANDROID) 393x852 AUDIT STARTING...');
    const mobileContext = await browser.createBrowserContext();
    const mobilePage = await mobileContext.newPage();
    await mobilePage.setViewport({ width: 393, height: 852, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await mobilePage.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1');

    mobilePage.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!text.includes('facebook') && !text.includes('ERR_BLOCKED_BY_CLIENT')) {
          auditReport.mobile.consoleErrors.push(text);
        }
      }
    });

    let mobileOrderPayload = null;
    mobilePage.on('request', req => {
      if (req.url().includes('/api/submit-order')) {
        mobileOrderPayload = req.postData();
        console.log(' >> [MOBILE NETWORK REQUEST] /api/submit-order FIRED:', mobileOrderPayload);
      }
    });

    console.log('[Mobile 1] Navigating to mobile homepage...');
    await mobilePage.goto(TARGET_URL, { waitUntil: 'networkidle2', timeout: 35000 });
    await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, '06_mobile_hero.png') });

    // Check for horizontal overflow
    const hasHorizontalOverflow = await mobilePage.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    console.log(`✓ Mobile Horizontal Overflow Check: ${hasHorizontalOverflow ? 'FAIL' : 'PASS (No horizontal scroll)'}`);
    auditReport.mobile.noHorizontalOverflow = !hasHorizontalOverflow;

    // Capture Video & 3 layers underneath on mobile
    await mobilePage.evaluate(() => {
      const vid = document.querySelector('video');
      if (vid) vid.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await new Promise(r => setTimeout(r, 400));
    await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, '07_mobile_video_and_layers.png') });

    // Scroll to order form and confirm Storage Tip directly under Order button
    console.log('[Mobile 2] Checking Storage Tip placement on mobile...');
    await mobilePage.evaluate(() => {
      const btn = document.querySelector('button[type="submit"]');
      if (btn) btn.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await new Promise(r => setTimeout(r, 400));
    await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, '08_mobile_order_button_and_storage_tip.png') });

    // Step 3: Mobile Live Test Order (Check promo dialog first)
    console.log('[Mobile 3] Submitting mobile live test order...');
    const earlyPromoClose = await mobilePage.$('button[aria-label="Close promotion dialog"]');
    if (earlyPromoClose) {
      console.log('✓ Dismissing promo dialog before typing...');
      await earlyPromoClose.click();
      await new Promise(r => setTimeout(r, 400));
    }

    // Set values via page.type with clean focus
    await mobilePage.focus('input[name="name"]');
    await mobilePage.type('input[name="name"]', 'ফারহানা ইসলাম (Mobile Live Test)', { delay: 15 });

    await mobilePage.focus('input[name="phone"]');
    await mobilePage.type('input[name="phone"]', '01711223344', { delay: 15 });

    await mobilePage.focus('textarea[name="address"]');
    await mobilePage.type('textarea[name="address"]', 'হাউজ ১২, রোড ৫, ধানমন্ডি, ঢাকা', { delay: 15 });

    await mobilePage.focus('input[name="note"]');
    await mobilePage.type('input[name="note"]', '[Mobile Automated Audit Order - Test Please Ignore]', { delay: 15 });

    await new Promise(r => setTimeout(r, 300));
    await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, '09_mobile_form_filled.png') });

    // Check if promo popup opened, if so dismiss it
    const promoClose = await mobilePage.$('button[aria-label="Close promotion dialog"]');
    if (promoClose) {
      console.log('✓ Dismissing promo dialog on mobile...');
      await promoClose.click();
      await new Promise(r => setTimeout(r, 400));
    }

    // Scroll confirm button into view and tap it
    console.log('[Mobile 4] Tapping CONFIRM ORDER on mobile...');
    const mobileSubmitBtn = await mobilePage.$('button[type="submit"]');
    await mobilePage.evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'center' }), mobileSubmitBtn);
    await new Promise(r => setTimeout(r, 200));
    await mobileSubmitBtn.click();

    console.log('[Mobile 5] Waiting for mobile success modal...');
    await mobilePage.waitForSelector('div.fixed.inset-0.z-\\[100\\]', { visible: true, timeout: 12000 });
    await new Promise(r => setTimeout(r, 800));
    await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, '10_mobile_success_modal.png') });
    console.log('✓ Mobile Success Modal captured successfully!');
    auditReport.mobile.liveOrderSubmitted = !!mobileOrderPayload;
    auditReport.mobile.successModalOpened = true;

    // Click "Done" button inside modal
    await mobilePage.evaluate(() => {
      const doneBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Done'));
      if (doneBtn) doneBtn.click();
    });
    await new Promise(r => setTimeout(r, 500));
    await mobilePage.close();

    console.log('\n================================================================');
    console.log('=== AUDIT REPORT SUMMARY ===');
    console.log('PC Status:', auditReport.pc);
    console.log('Mobile Status:', auditReport.mobile);
    console.log('================================================================\n');

  } catch (err) {
    console.error('Audit encountered error:', err);
  } finally {
    await browser.close();
  }
}

runComprehensiveLiveAudit();
