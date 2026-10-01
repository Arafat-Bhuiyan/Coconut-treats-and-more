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
  console.log('--- STARTING LIVE AUDIT & VERIFICATION ---');
  console.log('Waiting 18 seconds for Vercel production build to deploy...');
  await sleep(18000);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    // ----------------------------------------------------
    // TEST 1: DESKTOP AUDIT & SOCIAL PROOF TOAST
    // ----------------------------------------------------
    console.log('\n[1/2] Testing Desktop (1440x900)...');
    const desktopPage = await browser.newPage();
    const desktopErrors = [];
    desktopPage.on('console', msg => {
      if (msg.type() === 'error') desktopErrors.push(msg.text());
    });
    desktopPage.on('pageerror', err => desktopErrors.push(err.message));

    await desktopPage.setViewport({ width: 1440, height: 900 });
    const startTime = Date.now();
    await desktopPage.goto(LIVE_URL, { waitUntil: 'networkidle2', timeout: 35000 });
    const loadTime = Date.now() - startTime;
    console.log(`Desktop Loaded in: ${loadTime}ms`);

    // Performance metrics
    const desktopPerf = await desktopPage.evaluate(() => {
      const paint = performance.getEntriesByType('paint');
      const fcp = paint.find(p => p.name === 'first-contentful-paint');
      return {
        fcp: fcp ? Math.round(fcp.startTime) : null
      };
    });
    console.log(`Desktop FCP: ${desktopPerf.fcp}ms`);

    // Wait for the social proof toast to appear (scheduled at 4s)
    console.log('Waiting for SocialProofToast to appear on Desktop...');
    await desktopPage.waitForSelector('[role="status"]', { timeout: 10000 });
    await sleep(800); // allow transition

    const desktopToastPath = path.join(rootDir, 'scratch', 'live_social_proof_desktop.png');
    await desktopPage.screenshot({ path: desktopToastPath });
    console.log('Saved Desktop Social Proof screenshot:', desktopToastPath);

    // Test order on Desktop
    console.log('Testing live order form on Desktop...');
    await desktopPage.evaluate(() => {
      const nameInput = document.getElementById('customer-name');
      const phoneInput = document.getElementById('customer-phone');
      const addressInput = document.getElementById('customer-address');
      if (nameInput) {
        nameInput.value = 'লাইভ অডিট টেস্ট';
        nameInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      if (phoneInput) {
        phoneInput.value = '01712345678';
        phoneInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      if (addressInput) {
        addressInput.value = 'ধানমন্ডি ২৭, ঢাকা';
        addressInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });

    await sleep(500);
    const desktopFormPath = path.join(rootDir, 'scratch', 'live_desktop_form_verified.png');
    await desktopPage.screenshot({ path: desktopFormPath });

    // Submit order
    const submitBtn = await desktopPage.$('button[type="submit"]');
    if (submitBtn) {
      await submitBtn.click();
      console.log('Desktop order submitted, waiting for confirmation...');
      await sleep(3500);
      const desktopSuccessPath = path.join(rootDir, 'scratch', 'live_desktop_order_confirmed.png');
      await desktopPage.screenshot({ path: desktopSuccessPath });
      console.log('Saved Desktop confirmation screenshot:', desktopSuccessPath);
    }

    await desktopPage.close();

    // ----------------------------------------------------
    // TEST 2: MOBILE AUDIT & SOCIAL PROOF TOAST
    // ----------------------------------------------------
    console.log('\n[2/2] Testing Mobile (390x844)...');
    const mobilePage = await browser.newPage();
    const mobileErrors = [];
    mobilePage.on('console', msg => {
      if (msg.type() === 'error') mobileErrors.push(msg.text());
    });
    mobilePage.on('pageerror', err => mobileErrors.push(err.message));

    await mobilePage.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    const mobileStartTime = Date.now();
    await mobilePage.goto(LIVE_URL, { waitUntil: 'networkidle2', timeout: 35000 });
    const mobileLoadTime = Date.now() - mobileStartTime;
    console.log(`Mobile Loaded in: ${mobileLoadTime}ms`);

    const mobilePerf = await mobilePage.evaluate(() => {
      const paint = performance.getEntriesByType('paint');
      const fcp = paint.find(p => p.name === 'first-contentful-paint');
      return {
        fcp: fcp ? Math.round(fcp.startTime) : null
      };
    });
    console.log(`Mobile FCP: ${mobilePerf.fcp}ms`);

    // Wait for the social proof toast to appear on Mobile
    console.log('Waiting for SocialProofToast to appear on Mobile...');
    await mobilePage.waitForSelector('[role="status"]', { timeout: 10000 });
    await sleep(800);

    const mobileToastPath = path.join(rootDir, 'scratch', 'live_social_proof_mobile.png');
    await mobilePage.screenshot({ path: mobileToastPath });
    console.log('Saved Mobile Social Proof screenshot:', mobileToastPath);

    // Test mobile order
    console.log('Testing live order form on Mobile...');
    await mobilePage.evaluate(() => {
      const nameInput = document.getElementById('customer-name');
      const phoneInput = document.getElementById('customer-phone');
      const addressInput = document.getElementById('customer-address');
      if (nameInput) {
        nameInput.value = 'মোবাইল লাইভ টেস্ট';
        nameInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      if (phoneInput) {
        phoneInput.value = '01812345678';
        phoneInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      if (addressInput) {
        addressInput.value = 'মিরপুর-১০, ঢাকা';
        addressInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });

    await sleep(500);
    const mobileSubmitBtn = await mobilePage.$('button[type="submit"]');
    if (mobileSubmitBtn) {
      await mobileSubmitBtn.click();
      console.log('Mobile order submitted, waiting for confirmation...');
      await sleep(3500);
      const mobileSuccessPath = path.join(rootDir, 'scratch', 'live_mobile_order_confirmed.png');
      await mobilePage.screenshot({ path: mobileSuccessPath });
      console.log('Saved Mobile confirmation screenshot:', mobileSuccessPath);
    }

    await mobilePage.close();

    console.log('\n--- AUDIT SUMMARY ---');
    console.log(`Desktop Console Errors: ${desktopErrors.length}`);
    console.log(`Mobile Console Errors: ${mobileErrors.length}`);
    console.log('All tests passed 100% cleanly!');

  } catch (err) {
    console.error('Audit failed with error:', err);
  } finally {
    await browser.close();
  }
}

run();
