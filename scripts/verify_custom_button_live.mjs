import puppeteer from 'puppeteer-core';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const LIVE_URL = 'https://coconuttreatsmore.com/';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  console.log('Waiting 15 seconds for Vercel deployment...');
  await sleep(15000);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    // 1. Desktop Test
    console.log('Testing Desktop Live...');
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(LIVE_URL, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(2000);

    const desktopHero = path.join(rootDir, 'scratch', 'live_custom_stepper_desktop_default.png');
    await page.screenshot({ path: desktopHero });
    console.log('Saved desktop default screenshot to:', desktopHero);

    // Click "+" button in custom stepper
    console.log('Clicking "+" button in stepper...');
    const plusButton = await page.$('button[aria-label="Increase boxes"]');
    if (plusButton) {
      await plusButton.click();
      await sleep(500);
      await plusButton.click();
      await sleep(500);
    }

    const desktopClicked = path.join(rootDir, 'scratch', 'live_custom_stepper_desktop_clicked.png');
    await page.screenshot({ path: desktopClicked });
    console.log('Saved desktop clicked screenshot to:', desktopClicked);

    // 2. Mobile Test
    console.log('Testing Mobile Live...');
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.goto(LIVE_URL, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(2000);

    const mobileDefault = path.join(rootDir, 'scratch', 'live_custom_stepper_mobile_default.png');
    await page.screenshot({ path: mobileDefault });
    console.log('Saved mobile default screenshot to:', mobileDefault);

    // Mobile click +
    const mobilePlus = await page.$('button[aria-label="Increase boxes"]');
    if (mobilePlus) {
      await mobilePlus.click();
      await sleep(500);
    }

    const mobileClicked = path.join(rootDir, 'scratch', 'live_custom_stepper_mobile_clicked.png');
    await page.screenshot({ path: mobileClicked });
    console.log('Saved mobile clicked screenshot to:', mobileClicked);

    console.log('Verification completed successfully!');
  } catch (err) {
    console.error('Error during verification:', err);
  } finally {
    await browser.close();
  }
}

run();
