import puppeteer from 'puppeteer-core';
import { spawn } from 'child_process';

async function testUpdatedFeatures() {
  const preview = spawn('cmd.exe', ['/c', 'npm.cmd', 'run', 'preview', '--', '--port', '4205'], {
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
    await page.goto('http://localhost:4205/', { waitUntil: 'networkidle2' });

    // 1. Screenshot of Video and Top Hero (Verify full uncropped video)
    await page.screenshot({ path: 'scratch/desktop_full_uncropped_video.png' });
    console.log("Captured desktop full uncropped video");

    // 2. Click '+' on custom quantity stepper multiple times to go to 7 boxes
    const initialScrollY = await page.evaluate(() => window.scrollY);
    
    // Click '+' 5 times
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => {
        const plusBtn = Array.from(document.querySelectorAll('button[aria-label="Increase boxes"]'))[0];
        if (plusBtn) plusBtn.click();
      });
      await new Promise(r => setTimeout(r, 100));
    }

    const scrollYAfterStepper = await page.evaluate(() => window.scrollY);
    console.log(`Scroll Y before: ${initialScrollY}, after 7 boxes stepper: ${scrollYAfterStepper} (Should be equal)`);

    await page.screenshot({ path: 'scratch/desktop_stepper_7boxes_no_scroll.png' });
    console.log("Captured 7 boxes without auto-scrolling");

    // 3. Scroll to order form
    await page.evaluate(() => {
      const form = document.getElementById('order-form-details');
      if (form) form.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await new Promise(r => setTimeout(r, 300));

    // 4. Test 1-Click Quick Area selection: click "মিরপুর"
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const mirpurBtn = buttons.find(b => b.textContent.includes('মিরপুর'));
      if (mirpurBtn) mirpurBtn.click();
    });
    await new Promise(r => setTimeout(r, 300));

    // Check address value
    const addrVal = await page.evaluate(() => {
      const textarea = document.getElementById('customer-address');
      return textarea ? textarea.value : '';
    });
    console.log("Address value after 1-click area chip:", addrVal);

    await page.screenshot({ path: 'scratch/desktop_order_form_1click_auto.png' });
    console.log("Captured 1-click area selection");

    // 5. Mobile check
    const mobilePage = await browser.newPage();
    await mobilePage.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true });
    await mobilePage.goto('http://localhost:4205/', { waitUntil: 'networkidle2' });

    await mobilePage.screenshot({ path: 'scratch/mobile_full_uncropped_video.png' });
    console.log("Captured mobile full uncropped video");

    // Mobile form with 1-click area chips
    await mobilePage.evaluate(() => {
      const addr = document.getElementById('customer-address');
      if (addr) addr.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await new Promise(r => setTimeout(r, 300));
    await mobilePage.screenshot({ path: 'scratch/mobile_order_form_chips.png' });
    console.log("Captured mobile order form chips");

  } finally {
    await browser.close();
    preview.kill();
  }
}

testUpdatedFeatures();
