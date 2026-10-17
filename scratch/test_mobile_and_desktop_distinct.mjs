import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\Gigabyte\\.gemini\\antigravity\\brain\\148d27dc-4029-49b4-87e6-34bc45710faa';
const URL = 'https://coconuttreatsmore.com/';

async function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function verifyOrder() {
  console.log('Waiting 28 seconds for Vercel deployment of commit db209e6...');
  await delay(28000);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 393, height: 852, isMobile: true, hasTouch: true });

    let capturedPayload = null;
    page.on('request', (req) => {
      if (req.url().includes('/api/submit-order') && req.method() === 'POST') {
        try {
          capturedPayload = JSON.parse(req.postData());
          console.log('\n=== CAPTURED MOBILE ORDER PAYLOAD ===');
          console.log(JSON.stringify(capturedPayload, null, 2));
          console.log('=====================================\n');
        } catch (e) {
          console.log('Parse error:', req.postData());
        }
      }
    });

    await page.evaluateOnNewDocument(() => {
      sessionStorage.setItem('hasShownPromo', 'true');
    });

    console.log('Loading live mobile site...');
    await page.goto(`${URL}?_ts=${Date.now()}`, { waitUntil: 'networkidle2', timeout: 40000 });
    await delay(2000);

    // Scroll to order form
    await page.evaluate(() => {
      const el = document.getElementById('order-form-details');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await delay(1000);

    await page.type('#customer-name', 'আহমেদ সাদিক (গিফট অর্ডার)', { delay: 10 });
    await page.type('#customer-phone', '01719988776', { delay: 10 });
    await page.type('#customer-address', 'বাড়ি ২০, রোড ৪, সেক্টর ৭, উত্তরা, ঢাকা', { delay: 10 });
    await page.type('#customer-note', 'ডেলিভারি ম্যান যেন কল দেয়', { delay: 10 });

    console.log('Toggling gift option on mobile...');
    await page.evaluate(() => {
      const checkbox = document.getElementById('gift-option-checkbox');
      if (checkbox && checkbox.parentElement) {
        checkbox.parentElement.click();
      }
    });
    await delay(800);

    // Click preset
    console.log('Selecting preset "অনেক ভালোবাসা রইলো ❤️"...');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('অনেক ভালোবাসা রইলো'));
      if (btn) btn.click();
    });
    await delay(800);

    // Screenshot filled mobile form with gift box and summary
    const mobilePath = path.join(ARTIFACT_DIR, 'gift_card_below_note_mobile.png');
    await page.screenshot({ path: mobilePath });
    console.log('Saved mobile screenshot:', mobilePath);

    // Submit order on mobile
    console.log('Submitting mobile order...');
    await page.evaluate(() => {
      const btn = document.querySelector('button[type="submit"]');
      if (btn) btn.click();
    });
    await delay(4500);

    const mobileSuccessPath = path.join(ARTIFACT_DIR, 'gift_order_confirmed_100tk.png');
    await page.screenshot({ path: mobileSuccessPath });
    console.log('Saved mobile success screenshot:', mobileSuccessPath);

    console.log('\n--- VERIFICATION RESULT ---');
    console.log('Payload Received:', !!capturedPayload);
    if (capturedPayload) {
      console.log('Total Amount:', capturedPayload.Total_Amount);
      console.log('Gift Charge:', capturedPayload.Gift_Charge);
      console.log('Product:', capturedPayload.Product);
      console.log('Note:', capturedPayload.Note);
      console.log('Subject:', capturedPayload.subject);
    }

    await page.close();
  } catch (err) {
    console.error('Error during test:', err);
  } finally {
    await browser.close();
  }
}

verifyOrder();
