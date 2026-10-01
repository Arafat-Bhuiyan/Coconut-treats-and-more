import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const LIVE_URL = 'https://coconuttreatsmore.com/';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runMobileTestOrder() {
  console.log('--- STARTING MOBILE LIVE TEST ORDER ---');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

    await page.goto(LIVE_URL, { waitUntil: 'networkidle2', timeout: 35000 });
    await sleep(2000);

    // Scroll to order form
    await page.evaluate(() => {
      const el = document.getElementById('order-form-details');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await sleep(1000);

    // Type with page.type
    await page.click('#customer-name');
    await page.type('#customer-name', 'মোবাইল লাইভ টেস্ট কাস্টমার', { delay: 30 });

    await page.click('#customer-phone');
    await page.type('#customer-phone', '01898765432', { delay: 30 });

    await page.click('#customer-address');
    await page.type('#customer-address', 'রোড ৩, সেক্টর ৭, উত্তরা, ঢাকা', { delay: 30 });

    await sleep(800);

    const filledMobilePath = 'C:\\Users\\Gigabyte\\.gemini\\antigravity\\brain\\148d27dc-4029-49b4-87e6-34bc45710faa\\live_order_mobile_filled.png';
    await page.screenshot({ path: filledMobilePath });

    // Submit
    const submitBtn = await page.$('button[type="submit"]');
    if (!submitBtn) throw new Error('Mobile submit button not found');
    await submitBtn.click();

    await sleep(4500);

    const successMobilePath = 'C:\\Users\\Gigabyte\\.gemini\\antigravity\\brain\\148d27dc-4029-49b4-87e6-34bc45710faa\\live_order_mobile_success_popup.png';
    await page.screenshot({ path: successMobilePath });
    console.log('Saved Mobile success screenshot!');

  } catch (err) {
    console.error('Error in mobile test order:', err);
  } finally {
    await browser.close();
  }
}

runMobileTestOrder();
