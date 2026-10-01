import puppeteer from 'puppeteer-core';
import path from 'path';

async function verifyLive() {
  console.log("Starting live verification on https://coconuttreatsmore.com/ ...");
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    // 1. Mobile verification (iPhone 14 / modern Android viewport)
    const mobilePage = await browser.newPage();
    await mobilePage.setViewport({ width: 393, height: 852, isMobile: true, hasTouch: true });
    await mobilePage.goto('https://coconuttreatsmore.com/?t=' + Date.now(), { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait 2s for animations/hydration
    await new Promise(r => setTimeout(r, 2000));
    
    await mobilePage.screenshot({ path: 'scratch/live_mobile_bundle_redesign.png', fullPage: false });
    console.log("Mobile top screenshot saved.");

    // Scroll down to bundle selector
    await mobilePage.evaluate(() => {
      const el = document.querySelector('h1');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await new Promise(r => setTimeout(r, 800));
    await mobilePage.screenshot({ path: 'scratch/live_mobile_bundle_hero_view.png', fullPage: false });
    console.log("Mobile bundle hero view screenshot saved.");

    // 2. Desktop verification (1440x900)
    const desktopPage = await browser.newPage();
    await desktopPage.setViewport({ width: 1440, height: 900 });
    await desktopPage.goto('https://coconuttreatsmore.com/?t=' + Date.now(), { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));

    await desktopPage.screenshot({ path: 'scratch/live_desktop_bundle_redesign.png', fullPage: false });
    console.log("Desktop screenshot saved.");

    console.log("Live verification complete!");
  } catch (err) {
    console.error("Live verification error:", err);
  } finally {
    await browser.close();
  }
}

verifyLive();
