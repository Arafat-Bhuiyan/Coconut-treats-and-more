import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const LIVE_URL = 'https://coconuttreatsmore.com/';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  console.log('Waiting 18 seconds for Vercel production deployment...');
  await sleep(18000);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    // 1. DESKTOP TEST
    console.log('Testing Desktop view...');
    const desktopPage = await browser.newPage();
    await desktopPage.setViewport({ width: 1440, height: 950 });
    await desktopPage.goto(LIVE_URL, { waitUntil: 'networkidle2' });
    await sleep(2000);

    // Default screenshot (2 boxes)
    await desktopPage.screenshot({
      path: 'C:\\Users\\Gigabyte\\.gemini\\antigravity\\brain\\148d27dc-4029-49b4-87e6-34bc45710faa\\restored_order_summary_desktop_2boxes.png'
    });

    // Click + 3 times to get 5 boxes (exact match with user's screenshot)
    console.log('Clicking "+" to 5 boxes...');
    const plusBtn = await desktopPage.$('button[aria-label="Increase quantity"]');
    if (plusBtn) {
      await plusBtn.click();
      await sleep(400);
      await plusBtn.click();
      await sleep(400);
      await plusBtn.click();
      await sleep(800);
    }

    // 5 boxes screenshot on Desktop
    await desktopPage.screenshot({
      path: 'C:\\Users\\Gigabyte\\.gemini\\antigravity\\brain\\148d27dc-4029-49b4-87e6-34bc45710faa\\restored_order_summary_desktop_5boxes.png'
    });
    console.log('Desktop 5 boxes screenshot saved!');

    await desktopPage.close();

    // 2. MOBILE TEST
    console.log('Testing Mobile view...');
    const mobilePage = await browser.newPage();
    await mobilePage.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await mobilePage.goto(LIVE_URL, { waitUntil: 'networkidle2' });
    await sleep(2000);

    // Scroll to the order summary
    await mobilePage.evaluate(() => {
      const h3 = Array.from(document.querySelectorAll('h3')).find(el => el.textContent.includes('Order Summary'));
      if (h3) h3.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await sleep(1000);

    // Default mobile screenshot (2 boxes)
    await mobilePage.screenshot({
      path: 'C:\\Users\\Gigabyte\\.gemini\\antigravity\\brain\\148d27dc-4029-49b4-87e6-34bc45710faa\\restored_order_summary_mobile_2boxes.png'
    });

    // Click + 3 times on mobile to reach 5 boxes
    const mobilePlus = await mobilePage.$('button[aria-label="Increase quantity"]');
    if (mobilePlus) {
      await mobilePlus.click();
      await sleep(400);
      await mobilePlus.click();
      await sleep(400);
      await mobilePlus.click();
      await sleep(800);
    }

    await mobilePage.screenshot({
      path: 'C:\\Users\\Gigabyte\\.gemini\\antigravity\\brain\\148d27dc-4029-49b4-87e6-34bc45710faa\\restored_order_summary_mobile_5boxes.png'
    });
    console.log('Mobile 5 boxes screenshot saved!');

    // 3. Test order submission on mobile with 5 boxes
    console.log('Submitting live test order on mobile...');
    await mobilePage.click('#customer-name');
    await mobilePage.type('#customer-name', 'রেস্টোর ভেরিফিকেশন টেস্ট', { delay: 25 });
    await mobilePage.click('#customer-phone');
    await mobilePage.type('#customer-phone', '01799887766', { delay: 25 });
    await mobilePage.click('#customer-address');
    await mobilePage.type('#customer-address', 'রোড ১০, ধানমন্ডি, ঢাকা', { delay: 25 });
    await sleep(500);

    const submitBtn = await mobilePage.$('button[type="submit"]');
    if (submitBtn) {
      await submitBtn.click();
      await sleep(4000);
      await mobilePage.screenshot({
        path: 'C:\\Users\\Gigabyte\\.gemini\\antigravity\\brain\\148d27dc-4029-49b4-87e6-34bc45710faa\\restored_order_test_success_popup.png'
      });
      console.log('Mobile order test success popup screenshot saved!');
    }

    await mobilePage.close();
    console.log('All verifications completed successfully!');

  } catch (err) {
    console.error('Error during verification:', err);
  } finally {
    await browser.close();
  }
}

run();
