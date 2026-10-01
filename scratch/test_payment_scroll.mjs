import puppeteer from 'puppeteer-core';
import { spawn } from 'child_process';

async function run() {
  const preview = spawn('cmd.exe', ['/c', 'npm.cmd', 'run', 'preview', '--', '--port', '4174'], {
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
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 1100 });
    await page.goto('http://localhost:4174/', { waitUntil: 'networkidle2' });

    // Click bKash
    await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('div[role="button"]'));
      const bkashBtn = elements.find(el => el.textContent.includes('bKash'));
      if (bkashBtn) {
        bkashBtn.scrollIntoView({ behavior: 'instant', block: 'center' });
        bkashBtn.click();
      }
    });
    await new Promise(r => setTimeout(r, 500));

    // Capture payment methods with bKash open
    await page.screenshot({ path: 'scratch/desktop_payment_bkash.png' });

    // Click copy button
    await page.evaluate(() => {
      const copyBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('নাম্বার কপি করুন'));
      if (copyBtn) copyBtn.click();
    });
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: 'scratch/desktop_payment_bkash_copied.png' });

    // Also check footer
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: 'scratch/desktop_footer.png' });

    // Mobile check
    const mobilePage = await browser.newPage();
    await mobilePage.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true });
    await mobilePage.goto('http://localhost:4174/', { waitUntil: 'networkidle2' });

    await mobilePage.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('div[role="button"]'));
      const bkashBtn = elements.find(el => el.textContent.includes('bKash'));
      if (bkashBtn) {
        bkashBtn.scrollIntoView({ behavior: 'instant', block: 'center' });
        bkashBtn.click();
      }
    });
    await new Promise(r => setTimeout(r, 500));
    await mobilePage.screenshot({ path: 'scratch/mobile_payment_bkash.png' });

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
