import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const LIVE_URL = 'https://coconuttreatsmore.com/';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto(LIVE_URL, { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    const el = document.querySelector('button[aria-label="Increase boxes"]');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'C:\\Users\\Gigabyte\\.gemini\\antigravity\\brain\\148d27dc-4029-49b4-87e6-34bc45710faa\\live_custom_stepper_mobile_focused.png' });
  await browser.close();
  console.log('Done');
}

run();
