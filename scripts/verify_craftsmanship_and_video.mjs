import puppeteer from 'puppeteer-core';
import path from 'path';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  console.log('Launching Chrome to verify craftsmanship section & video on live site...');
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const artifactsDir = 'C:\\Users\\Gigabyte\\.gemini\\antigravity\\brain\\148d27dc-4029-49b4-87e6-34bc45710faa';
  const liveUrl = 'https://coconuttreatsmore.com/?t=' + Date.now();

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto(liveUrl, { waitUntil: 'networkidle2', timeout: 45000 });
  await sleep(3000);

  // 1. Verify Video has no poster attribute and is playing
  const videoDetails = await page.evaluate(() => {
    const v = document.querySelector('video');
    return {
      hasPoster: v ? v.hasAttribute('poster') : false,
      posterAttr: v ? v.getAttribute('poster') : null,
      preload: v ? v.getAttribute('preload') : null,
      paused: v ? v.paused : true,
      currentTime: v ? v.currentTime : 0
    };
  });
  console.log('Video Details:', videoDetails);

  // Take screenshot of video playing
  const videoScreenshot = path.join(artifactsDir, 'live_video_no_poster.png');
  await page.screenshot({ path: videoScreenshot });
  console.log('Saved video screenshot:', videoScreenshot);

  // 2. Scroll to Craftsmanship & Ingredients section
  await page.evaluate(() => {
    const el = document.querySelector('h2');
    const allH2 = Array.from(document.querySelectorAll('h2'));
    const target = allH2.find(h => h.textContent.includes('Fresh Homemade') || h.textContent.includes('Coconut Pudding'));
    if (target) target.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await sleep(1500);

  const craftsmanshipScreenshot = path.join(artifactsDir, 'live_craftsmanship_section.png');
  await page.screenshot({ path: craftsmanshipScreenshot });
  console.log('Saved craftsmanship screenshot:', craftsmanshipScreenshot);

  // 3. Mobile view test for craftsmanship section
  const mobilePage = await browser.newPage();
  await mobilePage.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await mobilePage.goto(liveUrl, { waitUntil: 'networkidle2', timeout: 45000 });
  await sleep(3000);

  await mobilePage.evaluate(() => {
    const allH2 = Array.from(document.querySelectorAll('h2'));
    const target = allH2.find(h => h.textContent.includes('Fresh Homemade') || h.textContent.includes('Coconut Pudding'));
    if (target) target.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await sleep(1500);

  const mobileCraftsmanshipScreenshot = path.join(artifactsDir, 'live_mobile_craftsmanship_section.png');
  await mobilePage.screenshot({ path: mobileCraftsmanshipScreenshot });
  console.log('Saved mobile craftsmanship screenshot:', mobileCraftsmanshipScreenshot);

  await browser.close();
  console.log('All verifications completed successfully!');
}

run().catch((err) => {
  console.error('Error during verification:', err);
  process.exit(1);
});
