import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\Gigabyte\\.gemini\\antigravity\\brain\\148d27dc-4029-49b4-87e6-34bc45710faa';
const LIVE_URL = 'https://coconuttreatsmore.com/';

async function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function runLiveTests() {
  console.log('Waiting 18 seconds for Vercel deployment to finish...');
  await delay(18000);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    // ==========================================
    // 1. PC / DESKTOP LIVE ORDER TEST (1440x950)
    // ==========================================
    console.log('\n--- 1. Testing PC / Desktop Live Order ---');
    const pcPage = await browser.newPage();
    await pcPage.setViewport({ width: 1440, height: 950 });

    await pcPage.goto(`${LIVE_URL}?_t=${Date.now()}`, { waitUntil: 'networkidle2', timeout: 35000 });
    await delay(3000);

    // Screenshot updated desktop showcase with "এর পুডিং"
    const pcShowcasePath = path.join(ARTIFACT_DIR, 'pc_live_text_updated.png');
    await pcPage.screenshot({ path: pcShowcasePath });
    console.log(`Saved PC updated text screenshot to: ${pcShowcasePath}`);

    // Fill Delivery Details Form
    await pcPage.type('#customer-name', 'সাকিব আহমেদ (PC Live Test)', { delay: 40 });
    await pcPage.type('#customer-phone', '01711223344', { delay: 40 });
    await pcPage.type('#customer-address', 'বাড়ি ১২, রোড ৫, ধানমন্ডি, ঢাকা', { delay: 40 });
    await pcPage.type('#customer-note', 'PC লাইভ টেস্ট অর্ডার', { delay: 40 });
    await delay(500);

    // Screenshot filled PC checkout form
    const pcFormPath = path.join(ARTIFACT_DIR, 'pc_live_form_filled.png');
    await pcPage.screenshot({ path: pcFormPath });
    console.log(`Saved PC filled form screenshot to: ${pcFormPath}`);

    // Click Confirm Order
    console.log('Submitting PC order...');
    const confirmBtn = await pcPage.$('#main-confirm-order-btn') || await pcPage.$('button[type="submit"]');
    if (confirmBtn) {
      await confirmBtn.click();
    } else {
      await pcPage.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('CONFIRM ORDER'));
        if (btn) btn.click();
      });
    }

    // Wait for Success Modal
    await delay(2500);
    const pcSuccessPath = path.join(ARTIFACT_DIR, 'pc_live_order_confirmed.png');
    await pcPage.screenshot({ path: pcSuccessPath });
    console.log(`Saved PC order confirmation screenshot to: ${pcSuccessPath}`);
    await pcPage.close();

    // ==========================================
    // 2. MOBILE LIVE ORDER TEST (390x844 iPhone)
    // ==========================================
    console.log('\n--- 2. Testing Mobile Live Order ---');
    const mobilePage = await browser.newPage();
    await mobilePage.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

    await mobilePage.goto(`${LIVE_URL}?_t=${Date.now()}`, { waitUntil: 'networkidle2', timeout: 35000 });
    await delay(3000);

    // Click Quick Order button to scroll down
    const quickOrderBtn = await mobilePage.$('a[href="#order-form-details"]');
    if (quickOrderBtn) {
      console.log('Clicking Quick Order button on mobile...');
      await quickOrderBtn.click();
      await delay(1200);
    }

    // Fill mobile form
    await mobilePage.type('#customer-name', 'মারিয়া তাসনিম (Mobile Live Test)', { delay: 40 });
    await mobilePage.type('#customer-phone', '01899112233', { delay: 40 });
    await mobilePage.type('#customer-address', 'ফ্ল্যাট ৩বি, বাড়ি ২০, বনানী, ঢাকা', { delay: 40 });
    await mobilePage.type('#customer-note', 'Mobile লাইভ টেস্ট অর্ডার', { delay: 40 });
    await delay(500);

    const mobileFormPath = path.join(ARTIFACT_DIR, 'mobile_live_form_filled.png');
    await mobilePage.screenshot({ path: mobileFormPath });
    console.log(`Saved Mobile filled form screenshot to: ${mobileFormPath}`);

    // Click Confirm Order on Mobile
    console.log('Submitting Mobile order...');
    await mobilePage.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('CONFIRM ORDER'));
      if (btn) btn.click();
    });

    // Wait for Success Modal
    await delay(2500);
    const mobileSuccessPath = path.join(ARTIFACT_DIR, 'mobile_live_order_confirmed.png');
    await mobilePage.screenshot({ path: mobileSuccessPath });
    console.log(`Saved Mobile order confirmation screenshot to: ${mobileSuccessPath}`);
    await mobilePage.close();

    console.log('\nAll PC & Mobile live order tests passed successfully!');
  } catch (err) {
    console.error('Test error:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runLiveTests();
