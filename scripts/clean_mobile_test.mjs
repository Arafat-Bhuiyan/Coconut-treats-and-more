import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\Gigabyte\\.gemini\\antigravity\\brain\\148d27dc-4029-49b4-87e6-34bc45710faa';

async function test() {
  const browser = await puppeteer.launch({ executablePath: CHROME_PATH, headless: 'new' });
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto('https://coconuttreatsmore.com/', { waitUntil: 'networkidle2' });
  
  // Click quick order
  const btn = await page.$('a[href="#order-form-details"]');
  if (btn) await btn.click();
  await new Promise(r => setTimeout(r, 1200));

  // Fill form
  await page.type('#customer-name', 'মারিয়া তাসনিম (Mobile Test)');
  await page.type('#customer-phone', '01899112233');
  await page.type('#customer-address', 'ফ্ল্যাট ৩বি, বাড়ি ২০, বনানী, ঢাকা');
  await page.type('#customer-note', 'লাইভ মোবাইল টেস্ট অর্ডার');
  
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'mobile_clean_live_form.png') });

  // Submit
  await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('CONFIRM ORDER'));
    if (b) b.click();
  });
  await new Promise(r => setTimeout(r, 2500));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'mobile_clean_order_confirmed.png') });
  await browser.close();
  console.log('Mobile clean test done!');
}
test();
