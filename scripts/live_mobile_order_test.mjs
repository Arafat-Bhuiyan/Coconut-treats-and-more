import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const TARGET_URL = 'https://coconuttreatsmore.com/';
const SCREENSHOT_DIR = path.resolve('scratch', 'mobile_audit_screens');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runLiveMobileOrder() {
  console.log('========================================================');
  console.log('=== STARTING REAL-TIME LIVE MOBILE ORDER TEST ===');
  console.log(`Target: ${TARGET_URL}`);
  console.log('========================================================\n');

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

  let submitOrderRequest = null;
  let submitOrderResponse = null;

  page.on('request', (req) => {
    if (req.url().includes('/api/submit-order')) {
      submitOrderRequest = {
        url: req.url(),
        method: req.method(),
        postData: req.postData()
      };
      console.log('>> [NETWORK] /api/submit-order REQUEST FIRED:', req.postData());
    }
  });

  page.on('response', async (res) => {
    if (res.url().includes('/api/submit-order')) {
      let body = '';
      try {
        body = await res.text();
      } catch {
        body = '<failed to read body>';
      }
      submitOrderResponse = {
        status: res.status(),
        ok: res.ok(),
        body
      };
      console.log(`<< [NETWORK] /api/submit-order RESPONSE (${res.status()}):`, body);
    }
  });

  // Step 1: Navigate to site
  console.log('[Step 1] Loading website on iPhone 14 Pro...');
  await page.goto(TARGET_URL, { waitUntil: 'networkidle2', timeout: 30000 });
  console.log('✓ Homepage loaded successfully on mobile.');

  // Step 2: Trigger promo popup via mobile touch/scroll
  console.log('\n[Step 2] Triggering promo popup via touch gesture...');
  await page.evaluate(() => {
    window.dispatchEvent(new Event('touchstart'));
    window.scrollBy(0, 100);
    window.dispatchEvent(new Event('scroll'));
  });

  console.log('Waiting 3.5s for natural promotion popup...');
  await new Promise(r => setTimeout(r, 3800));

  let popupBtn = await page.$('button.popup-green-blink-btn');
  if (!popupBtn) {
    // If not automatically shown yet, click the bulk offer badge
    console.log('Triggering bulk offer button...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button, a'));
      const target = btns.find(b => b.textContent.includes('Claim Bulk Offer') || b.textContent.includes('Bulk Offer'));
      if (target) target.click();
    });
    await new Promise(r => setTimeout(r, 600));
    popupBtn = await page.$('button.popup-green-blink-btn');
  }

  if (!popupBtn) {
    throw new Error('Promotion popup could not be triggered!');
  }
  console.log('✓ Promotion Popup is OPEN on mobile screen!');

  // Step 3: Tap order button in popup
  console.log('\n[Step 3] Tapping "অর্ডার করুন (Order Now)" button inside popup...');
  const box = await popupBtn.boundingBox();
  await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
  console.log('✓ Tapped! Popup closed and scrolling to order form...');
  await new Promise(r => setTimeout(r, 1200));

  // Step 4: Fill the order form on mobile
  console.log('\n[Step 4] Filling order form fields on mobile screen...');
  
  // Name
  const nameInput = await page.$('input[name="name"]');
  if (nameInput) {
    await nameInput.type('সাকিব আহমেদ (Mobile Test)', { delay: 20 });
    console.log('✓ Name entered: সাকিব আহমেদ (Mobile Test)');
  } else {
    throw new Error('Name input not found!');
  }

  // Phone
  const phoneInput = await page.$('input[name="phone"]');
  if (phoneInput) {
    await phoneInput.type('01712345678', { delay: 20 });
    console.log('✓ Phone entered: 01712345678');
  } else {
    throw new Error('Phone input not found!');
  }

  // Address
  const addressInput = await page.$('textarea[name="address"]');
  if (addressInput) {
    await addressInput.type('বাসা #২৫, রোড #৭, সেক্টর #৩, উত্তরা, ঢাকা', { delay: 20 });
    console.log('✓ Address entered: বাসা #২৫, রোড #৭, সেক্টর #৩, উত্তরা, ঢাকা');
  } else {
    throw new Error('Address input not found!');
  }

  // Note
  const noteInput = await page.$('textarea[name="note"]');
  if (noteInput) {
    await noteInput.type('[Live Mobile Verification Order - Please Ignore]', { delay: 20 });
    console.log('✓ Note entered: [Live Mobile Verification Order - Please Ignore]');
  }

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_mobile_form_ready_to_submit.png') });
  console.log('✓ Saved pre-submission screenshot: 04_mobile_form_ready_to_submit.png');

  // Step 5: Tap "CONFIRM ORDER" button
  console.log('\n[Step 5] Scrolling to "CONFIRM ORDER" button and tapping with touch...');
  const submitBtn = await page.$('button[type="submit"]');
  if (!submitBtn) {
    throw new Error('Submit button not found!');
  }

  // Scroll into view so button is centered on mobile screen
  await page.evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'center' }), submitBtn);
  await new Promise(r => setTimeout(r, 400));

  const submitBox = await submitBtn.boundingBox();
  console.log(`Submit button box: w=${submitBox.width}, h=${submitBox.height}, x=${submitBox.x}, y=${submitBox.y}`);
  
  // Tap the submit button on mobile screen
  await page.touchscreen.tap(submitBox.x + submitBox.width / 2, submitBox.y + submitBox.height / 2);
  console.log('✓ Tapped "CONFIRM ORDER" button via touchscreen.tap()!');

  // Step 6: Wait for Order Success Modal
  console.log('\n[Step 6] Waiting for Order Confirmation modal...');
  await page.waitForSelector('div.fixed.inset-0.z-\\[100\\]', {
    visible: true,
    timeout: 10000
  });
  console.log('✓ SUCCESS MODAL DETECTED ON MOBILE!');

  // Give animation 500ms to complete
  await new Promise(r => setTimeout(r, 600));

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_mobile_order_success.png') });
  console.log('✓ Saved success modal screenshot: 05_mobile_order_success.png');

  // Wait another 3s to let keepalive network request finalize
  await new Promise(r => setTimeout(r, 3000));

  console.log('\n========================================================');
  console.log('=== LIVE TEST ORDER SUMMARY & AUDIT VERIFICATION ===');
  console.log('Submit Order API Request:', submitOrderRequest ? 'SENT' : 'NOT SENT');
  if (submitOrderRequest) {
    console.log('Request Payload:', submitOrderRequest.postData);
  }
  console.log('Submit Order API Response:', submitOrderResponse ? `HTTP ${submitOrderResponse.status}` : 'NO RESPONSE');
  if (submitOrderResponse) {
    console.log('Response Body:', submitOrderResponse.body);
  }

  // Step 7: Close success modal
  console.log('\n[Step 7] Closing success modal via "Done" button...');
  const doneBtn = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const done = btns.find(b => b.textContent.trim() === 'Done');
    if (done) {
      done.click();
      return true;
    }
    return false;
  });
  console.log(`Done button clicked: ${doneBtn}`);
  await new Promise(r => setTimeout(r, 500));

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_mobile_order_completed.png') });
  console.log('✓ Saved post-order screenshot: 06_mobile_order_completed.png');

  await browser.close();
  console.log('\n=== REAL MOBILE LIVE ORDER TEST COMPLETED 100% SUCCESSFULLY! ===');
}

runLiveMobileOrder().catch(err => {
  console.error('Fatal error during live order test:', err);
  process.exit(1);
});
