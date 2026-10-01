import puppeteer from 'puppeteer-core';
import { spawn } from 'child_process';

async function run() {
  const preview = spawn('cmd.exe', ['/c', 'npm.cmd', 'run', 'preview', '--', '--port', '4175'], {
    cwd: 'c:\\Users\\Gigabyte\\Documents\\website\\Coconut-treats-and-more',
    shell: true,
  });

  await new Promise(r => setTimeout(r, 3000));

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    // 1. Desktop Test (Full 1440x1200)
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 1200 });
    await page.goto('http://localhost:4175/', { waitUntil: 'networkidle2' });

    // Desktop view of the unified hero checkout card
    await page.screenshot({ path: 'scratch/desktop_unified_checkout_default.png' });
    console.log("Captured desktop unified default");

    // Click bKash to test bKash view
    await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('div[role="button"]'));
      const bkashBtn = elements.find(el => el.textContent.includes('bKash'));
      if (bkashBtn) bkashBtn.click();
    });
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: 'scratch/desktop_unified_checkout_bkash.png' });
    console.log("Captured desktop unified bKash");

    // Click "Copy Number"
    await page.evaluate(() => {
      const copyBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('নাম্বার কপি করুন'));
      if (copyBtn) copyBtn.click();
    });
    await new Promise(r => setTimeout(r, 300));
    await page.screenshot({ path: 'scratch/desktop_unified_checkout_copied.png' });
    console.log("Captured desktop unified copy state");

    // 2. Mobile Test (412x915)
    const mobilePage = await browser.newPage();
    await mobilePage.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true });
    await mobilePage.goto('http://localhost:4175/', { waitUntil: 'networkidle2' });

    // Scroll down to the order form on mobile
    await mobilePage.evaluate(() => {
      const inputs = document.querySelector('input[name="name"]');
      if (inputs) inputs.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await new Promise(r => setTimeout(r, 400));
    await mobilePage.screenshot({ path: 'scratch/mobile_unified_form_visible.png' });
    console.log("Captured mobile unified form");

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
