import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\Gigabyte\\.gemini\\antigravity\\brain\\148d27dc-4029-49b4-87e6-34bc45710faa';
const LIVE_URL = 'https://coconuttreatsmore.com/';

async function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function verify() {
  console.log('Waiting 18 seconds for Vercel deployment...');
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

    // Desktop screenshot
    const desktopPath = path.join(ARTIFACT_DIR, 'raised_offer_under_video_desktop.png');
    await page.screenshot({ path: desktopPath });
    console.log(`Saved desktop screenshot to: ${desktopPath}`);

    // Mobile screenshot
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.goto(`${LIVE_URL}?_t=${Date.now()}`, { waitUntil: 'networkidle2', timeout: 35000 });
    await delay(3000);

    const mobilePath = path.join(ARTIFACT_DIR, 'raised_offer_under_video_mobile.png');
    await page.screenshot({ path: mobilePath });
    console.log(`Saved mobile screenshot to: ${mobilePath}`);

    console.log('Verification completed!');
  } catch (err) {
    console.error('Error during verification:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

verify();
