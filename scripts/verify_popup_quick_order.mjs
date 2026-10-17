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
    await delay(2000);

    // Trigger user interaction so the popup timer starts
    await page.mouse.move(300, 300);
    await page.mouse.wheel({ deltaY: 200 });

    console.log('Waiting for promotion popup (5-6s)...');
    await delay(6000);

    // Check if popup is visible
    const popupVisible = await page.$('.popup-green-blink-btn');
    if (!popupVisible) {
      console.log('Popup not visible yet, triggering directly via Hero or state...');
      await page.evaluate(() => {
        // Trigger event if available or simulate click
        window.dispatchEvent(new MouseEvent('mousemove'));
      });
      await delay(6000);
    }

    // Capture screenshot of the open popup
    const popupScreenshotPath = path.join(ARTIFACT_DIR, 'live_popup_quick_order_button.png');
    await page.screenshot({ path: popupScreenshotPath });
    console.log(`Saved open popup screenshot to: ${popupScreenshotPath}`);

    // Click the Quick Order button inside the popup
    const quickOrderBtn = await page.$('.popup-green-blink-btn');
    if (quickOrderBtn) {
      console.log('Found Quick Order button inside popup! Clicking it...');
      await quickOrderBtn.click();
      await delay(1500);
    } else {
      console.warn('Could not find .popup-green-blink-btn element');
    }

    // Capture screenshot after clicking Quick Order button
    const scrolledScreenshotPath = path.join(ARTIFACT_DIR, 'live_popup_clicked_scrolled_to_checkout.png');
    await page.screenshot({ path: scrolledScreenshotPath });
    console.log(`Saved scrolled checkout screenshot to: ${scrolledScreenshotPath}`);

    // Check focused element
    const focusedTag = await page.evaluate(() => {
      const el = document.activeElement;
      return el ? { id: el.id, tagName: el.tagName } : null;
    });
    console.log('Active element after popup Quick Order click:', focusedTag);

    console.log('Verification completed successfully!');
  } catch (err) {
    console.error('Verification error:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

verify();
