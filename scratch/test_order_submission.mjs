import puppeteer from 'puppeteer-core';
import { spawn } from 'child_process';

async function run() {
  const preview = spawn('cmd.exe', ['/c', 'npm.cmd', 'run', 'preview', '--', '--port', '4177'], {
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
    await page.setViewport({ width: 1440, height: 1350 });
    await page.goto('http://localhost:4177/', { waitUntil: 'networkidle2' });

    // 1. Try submitting empty form to verify validation
    await page.evaluate(() => {
      const submitBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('CONFIRM ORDER'));
      if (submitBtn) submitBtn.click();
    });
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: 'scratch/validation_error_test.png' });
    console.log("Captured validation error");

    // 2. Fill Name, Phone, and Address
    await page.type('input[name="name"]', 'Arafat Test');
    await page.type('input[name="phone"]', '01712345678');
    await page.type('textarea[name="address"]', 'House 12, Road 5, Block C, Banani, Flat 4B');

    // 3. Submit form
    await page.evaluate(() => {
      const submitBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('CONFIRM ORDER'));
      if (submitBtn) submitBtn.click();
    });
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: 'scratch/order_success_popup_test.png' });
    console.log("Captured order success popup");

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
