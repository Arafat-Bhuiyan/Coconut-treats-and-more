import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const LIVE_URL = 'https://coconuttreatsmore.com/';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  console.log('Waiting 16 seconds for Vercel deployment...');
  await sleep(16000);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto(LIVE_URL, { waitUntil: 'networkidle2' });

  console.log('Waiting 5.5 seconds for toast to appear...');
  await sleep(5500);

  const rect = await page.evaluate(() => {
    const el = document.querySelector('[role="status"]');
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { top: Math.round(r.top), bottom: Math.round(r.bottom), height: Math.round(r.height), width: Math.round(r.width) };
  });

  console.log('Mobile Toast Rect:', rect);

  await page.screenshot({ path: 'C:\\Users\\Gigabyte\\.gemini\\antigravity\\brain\\148d27dc-4029-49b4-87e6-34bc45710faa\\live_social_proof_mobile_fixed.png' });
  await browser.close();
  console.log('Done!');
}

run();
