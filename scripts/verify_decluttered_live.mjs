import puppeteer from 'puppeteer-core';
import path from 'path';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  console.log('Launching Chrome to verify live decluttered website...');
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const liveUrl = 'https://coconuttreatsmore.com/?t=' + Date.now();
  const artifactsDir = 'C:\\Users\\Gigabyte\\.gemini\\antigravity\\brain\\148d27dc-4029-49b4-87e6-34bc45710faa';

  // 1. Mobile Test
  const pageMobile = await browser.newPage();
  await pageMobile.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  console.log('Navigating mobile to:', liveUrl);
  await pageMobile.goto(liveUrl, { waitUntil: 'networkidle2', timeout: 45000 });
  await sleep(3000);

  // Take screenshot of mobile hero top
  const mobileHeroPath = path.join(artifactsDir, 'live_decluttered_mobile_hero.png');
  await pageMobile.screenshot({ path: mobileHeroPath });
  console.log('Saved mobile hero:', mobileHeroPath);

  // Scroll to checkout form
  await pageMobile.evaluate(() => {
    const el = document.getElementById('order-form-details');
    if (el) el.scrollIntoView();
  });
  await sleep(1000);

  const mobileFormPath = path.join(artifactsDir, 'live_decluttered_mobile_form.png');
  await pageMobile.screenshot({ path: mobileFormPath });
  console.log('Saved mobile form:', mobileFormPath);

  // 2. Desktop Test
  const pageDesktop = await browser.newPage();
  await pageDesktop.setViewport({ width: 1280, height: 900 });
  console.log('Navigating desktop to:', liveUrl);
  await pageDesktop.goto(liveUrl, { waitUntil: 'networkidle2', timeout: 45000 });
  await sleep(3000);

  const desktopHeroPath = path.join(artifactsDir, 'live_decluttered_desktop_hero.png');
  await pageDesktop.screenshot({ path: desktopHeroPath });
  console.log('Saved desktop hero:', desktopHeroPath);

  // Scroll to checkout form on desktop
  await pageDesktop.evaluate(() => {
    const el = document.getElementById('order-form-details');
    if (el) el.scrollIntoView();
  });
  await sleep(1000);

  const desktopFormPath = path.join(artifactsDir, 'live_decluttered_desktop_form.png');
  await pageDesktop.screenshot({ path: desktopFormPath });
  console.log('Saved desktop form:', desktopFormPath);

  await browser.close();
  console.log('Verification completed successfully!');
}

run().catch((err) => {
  console.error('Error during verification:', err);
  process.exit(1);
});
