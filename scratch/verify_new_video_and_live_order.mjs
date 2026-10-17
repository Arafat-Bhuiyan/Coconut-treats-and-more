import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\Gigabyte\\.gemini\\antigravity\\brain\\148d27dc-4029-49b4-87e6-34bc45710faa';
const LIVE_URL = 'https://coconuttreatsmore.com/';

async function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function verify() {
  console.log('Waiting 20 seconds for Vercel deployment to complete...');
  await delay(20000);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    // ------------------------------------------
    // 1. PC / DESKTOP VERIFICATION (1440x900)
    // ------------------------------------------
    console.log('\n--- 1. Testing PC Viewport & Video Playback ---');
    const pcPage = await browser.newPage();
    await pcPage.setViewport({ width: 1440, height: 900 });

    const pcErrors = [];
    pcPage.on('pageerror', err => pcErrors.push(err.toString()));

    await pcPage.goto(`${LIVE_URL}?_v=${Date.now()}`, { waitUntil: 'networkidle2', timeout: 40000 });
    await delay(3000);

    const pcVideoState = await pcPage.evaluate(() => {
      const vid = document.querySelector('video');
      return {
        exists: !!vid,
        src: vid ? vid.currentSrc : null,
        poster: vid ? vid.poster : null,
        duration: vid ? vid.duration : null,
        paused: vid ? vid.paused : null,
        videoWidth: vid ? vid.videoWidth : null,
        videoHeight: vid ? vid.videoHeight : null
      };
    });
    console.log('PC Video State:', pcVideoState);

    const pcScreenshotPath = path.join(ARTIFACT_DIR, 'new_video_pc_live.png');
    await pcPage.screenshot({ path: pcScreenshotPath });
    console.log('Saved PC Screenshot to:', pcScreenshotPath);
    await pcPage.close();

    // ------------------------------------------
    // 2. MOBILE VIEWPORT & LIVE ORDER TEST (393x852)
    // ------------------------------------------
    console.log('\n--- 2. Testing Mobile Viewport & Live Order Submission ---');
    const mobilePage = await browser.newPage();
    await mobilePage.setViewport({ width: 393, height: 852, isMobile: true, hasTouch: true });

    const mobileErrors = [];
    mobilePage.on('pageerror', err => mobileErrors.push(err.toString()));

    await mobilePage.goto(`${LIVE_URL}?_v=${Date.now()}`, { waitUntil: 'networkidle2', timeout: 40000 });
    await delay(3000);

    const mobileVideoState = await mobilePage.evaluate(() => {
      const vid = document.querySelector('video');
      return {
        exists: !!vid,
        duration: vid ? vid.duration : null,
        paused: vid ? vid.paused : null
      };
    });
    console.log('Mobile Video State:', mobileVideoState);

    const mobileScreenshotPath = path.join(ARTIFACT_DIR, 'new_video_mobile_live.png');
    await mobilePage.screenshot({ path: mobileScreenshotPath });
    console.log('Saved Mobile Screenshot to:', mobileScreenshotPath);

    // Now fill and submit a real live test order
    console.log('Filling live order form on Mobile...');
    await mobilePage.type('#customer-name', 'সরাসরি লাইভ টেস্ট (নতুন ভিডিও)', { delay: 30 });
    await mobilePage.type('#customer-phone', '01712233445', { delay: 30 });
    await mobilePage.type('#customer-address', 'ফ্ল্যাট ৫এ, বাড়ি ২২, রোড ৪, ধানমন্ডি, ঢাকা', { delay: 30 });
    await mobilePage.type('#customer-note', 'New Video Live Verification Order', { delay: 30 });
    await delay(500);

    const submitBtn = await mobilePage.$('button[type="submit"]');
    if (submitBtn) {
      console.log('Submitting live test order...');
      await submitBtn.click();
    }

    await delay(4000);

    const orderResult = await mobilePage.evaluate(() => {
      return {
        hasSuccessBanner: document.body.innerText.includes('আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে'),
        hasModal: document.body.innerText.includes('Order Confirmed!')
      };
    });
    console.log('Mobile Order Result:', orderResult);

    const confirmedScreenshotPath = path.join(ARTIFACT_DIR, 'new_video_order_confirmed.png');
    await mobilePage.screenshot({ path: confirmedScreenshotPath });
    console.log('Saved Order Confirmation Screenshot to:', confirmedScreenshotPath);

    await mobilePage.close();

    console.log('\n--- VERIFICATION SUMMARY ---');
    console.log('PC Errors:', pcErrors);
    console.log('Mobile Errors:', mobileErrors);

  } catch (err) {
    console.error('Test error:', err);
  } finally {
    await browser.close();
  }
}

verify();
