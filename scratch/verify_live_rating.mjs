import puppeteer from 'puppeteer-core';

async function verifyLiveRating() {
  console.log("Verifying live rating position...");
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 393, height: 852, isMobile: true, hasTouch: true });
    await page.goto('https://coconuttreatsmore.com/?t=' + Date.now(), { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2500));

    await page.screenshot({ path: 'scratch/live_mobile_rating_under_video.png', fullPage: false });
    console.log("Live mobile screenshot taken.");

    const desktop = await browser.newPage();
    await desktop.setViewport({ width: 1440, height: 900 });
    await desktop.goto('https://coconuttreatsmore.com/?t=' + Date.now(), { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2500));

    await desktop.screenshot({ path: 'scratch/live_desktop_rating_verified.png', fullPage: false });
    console.log("Live desktop screenshot taken.");
  } catch (err) {
    console.error("Live verification error:", err);
  } finally {
    await browser.close();
  }
}

verifyLiveRating();
