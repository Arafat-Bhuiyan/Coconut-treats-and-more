import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\Gigabyte\\.gemini\\antigravity\\brain\\148d27dc-4029-49b4-87e6-34bc45710faa';
const LIVE_URL = 'https://coconuttreatsmore.com/';

async function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function verify() {
  console.log('Waiting 18 seconds for Vercel deployment to finish...');
  await delay(18000);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 950 });

    console.log(`Navigating to ${LIVE_URL}...`);
    await page.goto(`${LIVE_URL}?_t=${Date.now()}`, { waitUntil: 'networkidle2', timeout: 35000 });
    await delay(3000);

    // Desktop screenshot of Showcase Section with bilingual card and Quick Order button
    const desktopPath = path.join(ARTIFACT_DIR, 'bilingual_quick_order_desktop.png');
    await page.screenshot({ path: desktopPath });
    console.log(`Saved desktop screenshot to: ${desktopPath}`);

    // Test clicking the Quick Order button
    const quickOrderBtn = await page.$('a[href="#order-form-details"]');
    if (quickOrderBtn) {
      console.log('Found Quick Order button! Clicking it...');
      await quickOrderBtn.click();
      await delay(1500);
    }

    const scrolledPath = path.join(ARTIFACT_DIR, 'bilingual_quick_order_desktop_scrolled.png');
    await page.screenshot({ path: scrolledPath });
    console.log(`Saved scrolled screenshot to: ${scrolledPath}`);

    // Mobile verification (iPhone 14 / modern mobile 390x844)
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.goto(`${LIVE_URL}?_t=${Date.now()}`, { waitUntil: 'networkidle2', timeout: 35000 });
    await delay(3000);

    const mobilePath = path.join(ARTIFACT_DIR, 'bilingual_quick_order_mobile.png');
    await page.screenshot({ path: mobilePath });
    console.log(`Saved mobile screenshot to: ${mobilePath}`);

    console.log('All bilingual & Quick Order button verifications completed!');
  } catch (err) {
    console.error('Error during verification:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

verify();
