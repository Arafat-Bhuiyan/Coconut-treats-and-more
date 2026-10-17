import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\Gigabyte\\.gemini\\antigravity\\brain\\148d27dc-4029-49b4-87e6-34bc45710faa';
const URL = 'https://coconuttreatsmore.com/';

function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function testNewLayout() {
  console.log("Waiting 15 seconds to ensure Vercel deployment is live...");
  await delay(15000);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
      sessionStorage.setItem('hasShownPromo', 'true');
    });

    // 1. MOBILE TEST (393x852)
    console.log("Testing Live Mobile View...");
    await page.setViewport({ width: 393, height: 852, isMobile: true, hasTouch: true });
    await page.goto(URL, { waitUntil: 'networkidle2' });
    await delay(2000);

    // Scroll to order form
    await page.evaluate(() => {
      const el = document.getElementById('order-form-details');
      if (el) el.scrollIntoView({ behavior: 'instant' });
    });
    await delay(1000);

    // Capture Mobile top view (Order summary + Gift card + Payment)
    const mobile1Path = path.join(ARTIFACT_DIR, 'new_layout_mobile_top.png');
    await page.screenshot({ path: mobile1Path });
    console.log("Saved:", mobile1Path);

    // Click Gift Card option on Mobile
    await page.evaluate(() => {
      const checkbox = document.getElementById('gift-option-checkbox');
      if (checkbox) {
        checkbox.parentElement.parentElement.click();
      }
    });
    await delay(800);

    // Capture Mobile with Gift Card expanded
    const mobile2Path = path.join(ARTIFACT_DIR, 'new_layout_mobile_gift_expanded.png');
    await page.screenshot({ path: mobile2Path });
    console.log("Saved:", mobile2Path);

    // Scroll down to see Delivery Details + Confirm Order button
    await page.evaluate(() => {
      window.scrollBy(0, 600);
    });
    await delay(800);

    const mobile3Path = path.join(ARTIFACT_DIR, 'new_layout_mobile_delivery_confirm.png');
    await page.screenshot({ path: mobile3Path });
    console.log("Saved:", mobile3Path);

    // 2. PC / DESKTOP TEST (1366x768)
    console.log("Testing Live Desktop (PC) View...");
    await page.setViewport({ width: 1366, height: 850 });
    await page.goto(URL, { waitUntil: 'networkidle2' });
    await delay(2000);

    await page.evaluate(() => {
      const el = document.getElementById('order-form-details');
      if (el) el.scrollIntoView({ behavior: 'instant' });
    });
    await delay(1000);

    const pc1Path = path.join(ARTIFACT_DIR, 'new_layout_pc_side_by_side.png');
    await page.screenshot({ path: pc1Path });
    console.log("Saved:", pc1Path);

    // Click Gift Card on PC
    await page.evaluate(() => {
      const checkbox = document.getElementById('gift-option-checkbox');
      if (checkbox) {
        checkbox.parentElement.parentElement.click();
      }
    });
    await delay(800);

    const pc2Path = path.join(ARTIFACT_DIR, 'new_layout_pc_gift_expanded.png');
    await page.screenshot({ path: pc2Path });
    console.log("Saved:", pc2Path);

    console.log("All tests and captures completed successfully!");
  } finally {
    await browser.close();
  }
}

testNewLayout().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
