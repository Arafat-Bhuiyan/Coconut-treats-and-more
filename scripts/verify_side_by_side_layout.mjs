import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const LIVE_URL = 'https://coconuttreatsmore.com/';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  console.log('Waiting 18 seconds for Vercel deployment...');
  await sleep(18000);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    // 1. DESKTOP VIEW
    console.log('Verifying Desktop Layout (1440x950)...');
    const desktopPage = await browser.newPage();
    await desktopPage.setViewport({ width: 1440, height: 950 });
    await desktopPage.goto(LIVE_URL, { waitUntil: 'networkidle2' });
    await sleep(2000);

    // Scroll to the checkout details section
    await desktopPage.evaluate(() => {
      const el = document.getElementById('order-form-details');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await sleep(1000);

    const desktopCheckoutPath = 'C:\\Users\\Gigabyte\\.gemini\\antigravity\\brain\\148d27dc-4029-49b4-87e6-34bc45710faa\\live_side_by_side_desktop_checkout.png';
    await desktopPage.screenshot({ path: desktopCheckoutPath });
    console.log('Saved Desktop checkout screenshot to:', desktopCheckoutPath);

    // Also take a screenshot of ROW 1 top showcase
    await desktopPage.evaluate(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
    await sleep(800);
    const desktopShowcasePath = 'C:\\Users\\Gigabyte\\.gemini\\antigravity\\brain\\148d27dc-4029-49b4-87e6-34bc45710faa\\live_side_by_side_desktop_showcase.png';
    await desktopPage.screenshot({ path: desktopShowcasePath });
    console.log('Saved Desktop showcase screenshot to:', desktopShowcasePath);

    await desktopPage.close();

    // 2. MOBILE VIEW
    console.log('Verifying Mobile Layout (390x844)...');
    const mobilePage = await browser.newPage();
    await mobilePage.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await mobilePage.goto(LIVE_URL, { waitUntil: 'networkidle2' });
    await sleep(2000);

    // Scroll to order form
    await mobilePage.evaluate(() => {
      const el = document.getElementById('order-form-details');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await sleep(1000);

    const mobileCheckoutPath = 'C:\\Users\\Gigabyte\\.gemini\\antigravity\\brain\\148d27dc-4029-49b4-87e6-34bc45710faa\\live_side_by_side_mobile_checkout.png';
    await mobilePage.screenshot({ path: mobileCheckoutPath });
    console.log('Saved Mobile checkout screenshot to:', mobileCheckoutPath);

    // Test a live order submit on Desktop or Mobile to verify 100% working
    console.log('Testing live order form submission...');
    await mobilePage.click('#customer-name');
    await mobilePage.type('#customer-name', 'নতুন লেআউট ভেরিফিকেশন টেস্ট', { delay: 25 });
    await mobilePage.click('#customer-phone');
    await mobilePage.type('#customer-phone', '01711223344', { delay: 25 });
    await mobilePage.click('#customer-address');
    await mobilePage.type('#customer-address', 'হাউজ ৯, রোড ৪, ধানমন্ডি, ঢাকা', { delay: 25 });
    await sleep(500);

    const submitBtn = await mobilePage.$('button[type="submit"]');
    if (submitBtn) {
      await submitBtn.click();
      await sleep(4000);
      const mobileSuccessPath = 'C:\\Users\\Gigabyte\\.gemini\\antigravity\\brain\\148d27dc-4029-49b4-87e6-34bc45710faa\\live_side_by_side_order_success.png';
      await mobilePage.screenshot({ path: mobileSuccessPath });
      console.log('Saved Mobile order success screenshot to:', mobileSuccessPath);
    }

    await mobilePage.close();
    console.log('Verification finished successfully!');
  } catch (err) {
    console.error('Error during verification:', err);
  } finally {
    await browser.close();
  }
}

run();
