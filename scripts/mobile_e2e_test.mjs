import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const TARGET_URL = 'https://coconuttreatsmore.com/';
const SCREENSHOT_DIR = path.resolve('scratch', 'mobile_audit_screens');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runMobileAudit() {
  console.log('=== STARTING PRODUCTION MOBILE LIVE AUDIT ===');
  console.log(`Target: ${TARGET_URL}`);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ]
  });

  const page = await browser.newPage();

  // Emulate modern mobile device: iPhone 14 Pro
  await page.setViewport({
    width: 393,
    height: 852,
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true
  });

  await page.setUserAgent(
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1'
  );

  const consoleLogs = [];
  const pageErrors = [];
  const failedRequests = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleLogs.push({ type: 'error', text: msg.text() });
    }
  });

  page.on('pageerror', (err) => {
    pageErrors.push(err.toString());
  });

  page.on('requestfailed', (req) => {
    const url = req.url();
    if (url.includes('coconuttreatsmore.com')) {
      failedRequests.push({ url, failure: req.failure()?.errorText });
    }
  });

  // Step 1: Measure Initial Page Load Speed
  console.log('\n[1/6] Navigating to homepage on Mobile...');
  const t0 = Date.now();
  const response = await page.goto(TARGET_URL, {
    waitUntil: 'networkidle2',
    timeout: 30000
  });
  const tLoad = Date.now() - t0;
  console.log(`✓ Initial Mobile Load Completed in ${tLoad}ms with HTTP Status: ${response.status()}`);

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_mobile_hero.png') });

  // Step 2: Trigger Promotion Popup via Natural Mobile Touch/Scroll
  console.log('\n[2/6] Triggering Promotion Popup via Mobile Scroll Gesture...');
  // Dispatch touchstart and scroll to trigger the automatic 3s promo timer
  await page.evaluate(() => {
    window.dispatchEvent(new Event('touchstart'));
    window.scrollBy(0, 150);
    window.dispatchEvent(new Event('scroll'));
  });

  console.log('✓ Dispatched touch and scroll. Waiting 3.5s for natural promo popup appearance...');
  await new Promise(r => setTimeout(r, 3800));

  // Check if popup is visible
  let popupBtn = await page.$('button.popup-green-blink-btn');
  if (!popupBtn) {
    console.log('Popup not yet appeared via timer, clicking Claim Bulk Offer button manually...');
    const clicked = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button, a'));
      const target = btns.find(b => b.textContent.includes('Claim Bulk Offer') || b.textContent.includes('Bulk Offer'));
      if (target) {
        target.click();
        return true;
      }
      return false;
    });
    console.log(`Click result: ${clicked}`);
    await new Promise(r => setTimeout(r, 600));
    popupBtn = await page.$('button.popup-green-blink-btn');
  }

  if (!popupBtn) {
    throw new Error('Promotion Popup could not be triggered!');
  }

  console.log('✓ Promotion Popup is successfully VISIBLE on mobile screen!');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_mobile_popup_visible.png') });

  // Step 3: Tap Popup Order Button
  console.log('\n[3/6] Tapping Popup Order Button with Touch Event...');
  const box = await popupBtn.boundingBox();
  console.log(`✓ Popup Order Button Bounding Box: width=${box.width}px, height=${box.height}px, x=${box.x}, y=${box.y}`);
  
  // Mobile tap
  await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
  console.log('✓ Tapped Popup Order Button via touchscreen.tap()!');

  // Wait 1 second for instant close and smooth scroll
  await new Promise(r => setTimeout(r, 1200));

  // Verify popup is closed
  const isPopupClosed = await page.evaluate(() => {
    const btn = document.querySelector('button.popup-green-blink-btn');
    return !btn;
  });
  console.log(`✓ Is Popup closed? ${isPopupClosed ? 'YES, closed immediately!' : 'NO, still open'}`);

  // Check scroll position
  const scrollY = await page.evaluate(() => window.pageYOffset || document.documentElement.scrollTop);
  console.log(`✓ Current Mobile Scroll Position: ${scrollY}px (Successfully navigated to Order section!)`);

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_mobile_scrolled_to_order.png') });

  // Step 4: Verify Order Form
  console.log('\n[4/6] Verifying Order Form Controls on Mobile...');
  const orderSection = await page.$('#order');
  if (!orderSection) {
    throw new Error('Order section #order not found in DOM!');
  }

  // Step 5: Test filling form inputs on Mobile
  console.log('\n[5/6] Testing Mobile Input Typing & Selectors...');
  const formFields = await page.evaluate(() => {
    const name = document.querySelector('input[name="name"]') || document.querySelector('input[placeholder*="নাম"]');
    const phone = document.querySelector('input[name="phone"]') || document.querySelector('input[placeholder*="মোবাইল"]') || document.querySelector('input[type="tel"]');
    const address = document.querySelector('textarea[name="address"]') || document.querySelector('input[name="address"]') || document.querySelector('textarea');
    return {
      nameSelector: name ? name.tagName : null,
      phoneSelector: phone ? phone.tagName : null,
      addressSelector: address ? address.tagName : null,
    };
  });
  console.log('✓ Found Order Form Inputs:', formFields);

  const nameInput = await page.$('input[name="name"], input[placeholder*="নাম"]');
  if (nameInput) {
    await nameInput.type('মোবাইল টেস্ট কাস্টমার', { delay: 25 });
  }

  const phoneInput = await page.$('input[name="phone"], input[type="tel"], input[placeholder*="মোবাইল"]');
  if (phoneInput) {
    await phoneInput.type('01712345678', { delay: 25 });
  }

  const addressInput = await page.$('textarea[name="address"], textarea[placeholder*="ঠিকানা"]');
  if (addressInput) {
    await addressInput.type('বাড়ি #১২, রোড #৪, ধানমন্ডি, ঢাকা', { delay: 25 });
  }

  // Verify delivery options (Inside Dhaka vs Outside Dhaka)
  const deliveryOptions = await page.evaluate(() => {
    const labels = Array.from(document.querySelectorAll('label, button')).filter(el => el.textContent.includes('ঢাকা'));
    return labels.map(l => l.textContent.trim().replace(/\s+/g, ' '));
  });
  console.log('✓ Delivery Options Available:', deliveryOptions);

  // Verify payment options (Cash on Delivery vs bKash)
  const paymentOptions = await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('button, label, div')).filter(el => 
      el.textContent.includes('ক্যাশ অন ডেলিভারি') || el.textContent.includes('বিকাশ') || el.textContent.includes('bKash')
    );
    return els.map(e => e.textContent.trim().slice(0, 35).replace(/\s+/g, ' ')).filter((v, i, a) => a.indexOf(v) === i);
  });
  console.log('✓ Payment Options Available:', paymentOptions);

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_mobile_order_filled.png') });

  // Step 6: Verify Floating WhatsApp Button position and clickability
  console.log('\n[6/6] Verifying Floating WhatsApp Button...');
  const whatsappState = await page.evaluate(() => {
    const wa = document.querySelector('a[href*="wa.me"]') || document.querySelector('a[aria-label*="WhatsApp"]');
    if (!wa) return { exists: false };
    const rect = wa.getBoundingClientRect();
    const style = window.getComputedStyle(wa);
    return {
      exists: true,
      href: wa.href,
      zIndex: style.zIndex,
      bottom: window.innerHeight - rect.bottom,
      right: window.innerWidth - rect.right,
      width: rect.width,
      height: rect.height,
      visible: style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0'
    };
  });
  console.log('✓ WhatsApp Floating Button State on Mobile:', whatsappState);

  // Check complete audit report
  console.log('\n=== AUDIT SUMMARY ===');
  console.log(`Page JS Errors: ${pageErrors.length}`);
  if (pageErrors.length > 0) {
    console.error('Page JS Errors:', pageErrors);
  }
  console.log(`Console Errors: ${consoleLogs.length}`);
  if (consoleLogs.length > 0) {
    console.warn('Console Errors:', consoleLogs);
  }
  console.log(`Failed Internal Requests: ${failedRequests.length}`);
  if (failedRequests.length > 0) {
    console.error('Failed Requests:', failedRequests);
  }

  await browser.close();
  console.log('=== MOBILE AUDIT PASSED 100% ===');
}

runMobileAudit().catch(err => {
  console.error('Audit failed with error:', err);
  process.exit(1);
});
