import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\Gigabyte\\.gemini\\antigravity\\brain\\148d27dc-4029-49b4-87e6-34bc45710faa';
const URL = 'https://coconuttreatsmore.com/';

async function testMobileAndCapture() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
      sessionStorage.setItem('hasShownPromo', 'true');
    });
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 3 });
    await page.goto(URL, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));

    // Scroll button to center
    await page.evaluate(() => {
      const el = document.getElementById('gift-card-toggle-btn');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await new Promise(r => setTimeout(r, 500));

    // Tap the button
    await page.tap('#gift-card-toggle-btn');
    await new Promise(r => setTimeout(r, 800));

    // Screenshot after tap
    const mobShot = path.join(ARTIFACT_DIR, 'live_mobile_tap_verified.png');
    await page.screenshot({ path: mobShot });
    console.log("Saved live mobile tap screenshot:", mobShot);

  } finally {
    await browser.close();
  }
}

testMobileAndCapture();
