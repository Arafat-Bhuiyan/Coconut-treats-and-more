import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const LIVE_URL = 'https://coconuttreatsmore.com/';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTestOrder() {
  console.log('--- STARTING LIVE TEST ORDER ON PRODUCTION ---');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 950 });

    let apiResponseStatus = null;
    let apiResponseBody = null;

    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('/api/order') || url.includes('/api/create-order') || url.includes('order')) {
        if (response.request().method() === 'POST') {
          apiResponseStatus = response.status();
          try {
            apiResponseBody = await response.json();
          } catch {
            apiResponseBody = await response.text();
          }
          console.log(`[API RESPONSE] Status: ${apiResponseStatus}`, apiResponseBody);
        }
      }
    });

    console.log('Navigating to:', LIVE_URL);
    await page.goto(LIVE_URL, { waitUntil: 'networkidle2', timeout: 35000 });
    await sleep(2000);

    // 1. Scroll to order form
    console.log('Step 1: Scrolling to order form...');
    await page.evaluate(() => {
      const el = document.getElementById('order-form-details');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await sleep(1000);

    // 2. Type customer info using real keystrokes (Puppeteer page.type triggers React onChange)
    console.log('Step 2: Typing Customer Details using page.type...');
    await page.click('#customer-name');
    await page.type('#customer-name', 'আরাফাত ভূঁইয়া (লাইভ টেস্ট)', { delay: 30 });

    await page.click('#customer-phone');
    await page.type('#customer-phone', '01712345678', { delay: 30 });

    await page.click('#customer-address');
    await page.type('#customer-address', 'হাউজ ১২, রোড ৫, ধানমন্ডি, ঢাকা', { delay: 30 });

    await sleep(800);

    // Save screenshot of filled form
    const filledPath = 'C:\\Users\\Gigabyte\\.gemini\\antigravity\\brain\\148d27dc-4029-49b4-87e6-34bc45710faa\\live_order_filled_verified.png';
    await page.screenshot({ path: filledPath });
    console.log('Filled form screenshot saved:', filledPath);

    // 3. Click submit button
    console.log('Step 3: Clicking Submit button...');
    const submitBtn = await page.$('button[type="submit"]');
    if (!submitBtn) throw new Error('Submit button not found');
    await submitBtn.click();

    console.log('Waiting for order submission & success popup...');
    await sleep(4500);

    // Save screenshot of confirmation popup
    const confirmedPath = 'C:\\Users\\Gigabyte\\.gemini\\antigravity\\brain\\148d27dc-4029-49b4-87e6-34bc45710faa\\live_order_confirmed_popup.png';
    await page.screenshot({ path: confirmedPath });
    console.log('Confirmation screenshot saved:', confirmedPath);

    const checkSuccess = await page.evaluate(() => {
      const bodyText = document.body.innerText;
      return {
        hasSuccessText: bodyText.includes('অর্ডার সফল হয়েছে') || bodyText.includes('অভিনন্দন') || bodyText.includes('সফল'),
        hasOrderHeading: bodyText.includes('Order Placed') || bodyText.includes('ধন্যবাদ')
      };
    });

    console.log('Success state check:', checkSuccess);
    console.log('API Status:', apiResponseStatus);
    console.log('API Response:', JSON.stringify(apiResponseBody));

  } catch (err) {
    console.error('Error during live test order:', err);
    throw err;
  } finally {
    await browser.close();
  }
}

runTestOrder();
