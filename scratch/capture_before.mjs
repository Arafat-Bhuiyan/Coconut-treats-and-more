import puppeteer from 'puppeteer-core';
import path from 'path';

async function testDeclutter() {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 393, height: 852, isMobile: true, hasTouch: true });
    await page.goto('https://coconuttreatsmore.com/?t=' + Date.now(), { waitUntil: 'networkidle2' });
    
    // Capture current mobile view for comparison
    await page.screenshot({ path: 'scratch/declutter_before_mobile.png', fullPage: true });
    console.log("Current state captured.");
  } finally {
    await browser.close();
  }
}

testDeclutter();
