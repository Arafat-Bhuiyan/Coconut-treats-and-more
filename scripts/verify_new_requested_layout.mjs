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

    // 1. Desktop Screenshot of ROW 1: Offer card + Quick Order on Left, Video on Right
    const desktopRow1Path = path.join(ARTIFACT_DIR, 'new_layout_desktop_row1.png');
    await page.screenshot({ path: desktopRow1Path });
    console.log(`Saved Desktop Row 1 screenshot to: ${desktopRow1Path}`);

    // 2. Test Quick Order button click
    const quickOrderBtn = await page.$('a[href="#order-form-details"]');
    if (quickOrderBtn) {
      console.log('Clicking Quick Order Now button...');
      await quickOrderBtn.click();
      await delay(1500);
    }

    // 3. Screenshot of scrolled checkout form
    const desktopScrolledPath = path.join(ARTIFACT_DIR, 'new_layout_desktop_scrolled_checkout.png');
    await page.screenshot({ path: desktopScrolledPath });
    console.log(`Saved Desktop Scrolled Checkout screenshot to: ${desktopScrolledPath}`);

    // 4. Scroll down to bottom highlights card
    await page.evaluate(() => window.scrollBy({ top: 700, behavior: 'smooth' }));
    await delay(1000);
    const desktopBottomHighlightsPath = path.join(ARTIFACT_DIR, 'new_layout_desktop_bottom_highlights.png');
    await page.screenshot({ path: desktopBottomHighlightsPath });
    console.log(`Saved Desktop Bottom Highlights screenshot to: ${desktopBottomHighlightsPath}`);

    // 5. Mobile Layout Check
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.goto(`${LIVE_URL}?_t=${Date.now()}`, { waitUntil: 'networkidle2', timeout: 35000 });
    await delay(3000);

    const mobileHeroPath = path.join(ARTIFACT_DIR, 'new_layout_mobile_hero.png');
    await page.screenshot({ path: mobileHeroPath });
    console.log(`Saved Mobile Hero screenshot to: ${mobileHeroPath}`);

    // Click mobile Quick Order button
    const mobileBtn = await page.$('a[href="#order-form-details"]');
    if (mobileBtn) {
      await mobileBtn.click();
      await delay(1500);
    }
    const mobileCheckoutPath = path.join(ARTIFACT_DIR, 'new_layout_mobile_checkout.png');
    await page.screenshot({ path: mobileCheckoutPath });
    console.log(`Saved Mobile Checkout screenshot to: ${mobileCheckoutPath}`);

    console.log('All layout verifications completed successfully!');
  } catch (err) {
    console.error('Verification error:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

verify();
