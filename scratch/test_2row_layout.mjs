import puppeteer from 'puppeteer-core';
import { spawn } from 'child_process';

async function run() {
  const preview = spawn('cmd.exe', ['/c', 'npm.cmd', 'run', 'preview', '--', '--port', '4176'], {
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
    // 1. Desktop Test (1440x1400)
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 1350 });
    await page.goto('http://localhost:4176/', { waitUntil: 'networkidle2' });

    await page.screenshot({ path: 'scratch/desktop_2row_full.png' });
    console.log("Captured desktop 2-row layout");

    // 2. Mobile Test (412x915)
    const mobilePage = await browser.newPage();
    await mobilePage.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true });
    await mobilePage.goto('http://localhost:4176/', { waitUntil: 'networkidle2' });

    // Capture top hero
    await mobilePage.screenshot({ path: 'scratch/mobile_2row_top.png' });

    // Scroll to bundle
    await mobilePage.evaluate(() => {
      window.scrollBy(0, 550);
    });
    await new Promise(r => setTimeout(r, 400));
    await mobilePage.screenshot({ path: 'scratch/mobile_2row_bundles.png' });

    // Scroll to checkout form
    await mobilePage.evaluate(() => {
      const inputs = document.querySelector('input[name="name"]');
      if (inputs) inputs.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await new Promise(r => setTimeout(r, 400));
    await mobilePage.screenshot({ path: 'scratch/mobile_2row_checkout.png' });
    console.log("Captured mobile screens");

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
