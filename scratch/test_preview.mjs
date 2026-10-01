import puppeteer from 'puppeteer-core';
import { spawn } from 'child_process';
import path from 'path';

async function run() {
  console.log("Starting preview server...");
  const preview = spawn('cmd.exe', ['/c', 'npm.cmd', 'run', 'preview', '--', '--port', '4173'], {
    cwd: 'c:\\Users\\Gigabyte\\Documents\\website\\Coconut-treats-and-more',
    shell: true,
  });

  // Wait 3 seconds for preview to start
  await new Promise(r => setTimeout(r, 3000));

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    // 1. Desktop Check
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto('http://localhost:4173/', { waitUntil: 'networkidle2' });

    // Desktop Hero
    await page.screenshot({ path: 'scratch/desktop_hero_smart.png' });
    console.log("Captured desktop hero");

    // Scroll to Order section
    await page.evaluate(() => {
      document.getElementById('order').scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await new Promise(r => setTimeout(r, 600));

    // Click bKash payment option
    await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('div[role="button"]'));
      const bkashBtn = elements.find(el => el.textContent.includes('bKash'));
      if (bkashBtn) bkashBtn.click();
    });
    await new Promise(r => setTimeout(r, 500));

    // Capture bKash opened state on Desktop
    await page.screenshot({ path: 'scratch/desktop_order_bkash_active.png' });
    console.log("Captured desktop order with bKash active");

    // Click "Copy Number" button
    await page.evaluate(() => {
      const copyBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('নাম্বার কপি করুন'));
      if (copyBtn) copyBtn.click();
    });
    await new Promise(r => setTimeout(r, 300));
    await page.screenshot({ path: 'scratch/desktop_bkash_copied.png' });
    console.log("Captured desktop bKash copied state");

    // 2. Mobile Check (iPhone / Pixel style)
    const mobilePage = await browser.newPage();
    await mobilePage.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true });
    await mobilePage.goto('http://localhost:4173/', { waitUntil: 'networkidle2' });

    // Mobile Hero
    await mobilePage.screenshot({ path: 'scratch/mobile_hero_smart.png' });
    console.log("Captured mobile hero");

    // Scroll to order
    await mobilePage.evaluate(() => {
      document.getElementById('order').scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await new Promise(r => setTimeout(r, 600));

    // Click bKash on Mobile
    await mobilePage.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('div[role="button"]'));
      const bkashBtn = elements.find(el => el.textContent.includes('bKash'));
      if (bkashBtn) bkashBtn.click();
    });
    await new Promise(r => setTimeout(r, 500));
    await mobilePage.screenshot({ path: 'scratch/mobile_order_bkash_active.png' });
    console.log("Captured mobile order with bKash");

  } finally {
    await browser.close();
    preview.kill('SIGINT');
    process.exit(0);
  }
}

run().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
