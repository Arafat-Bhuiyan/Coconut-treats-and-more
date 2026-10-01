import puppeteer from 'puppeteer-core';
import { spawn } from 'child_process';

async function run() {
  const preview = spawn('cmd.exe', ['/c', 'npm.cmd', 'run', 'preview', '--', '--port', '4188'], {
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
    await page.goto('http://localhost:4188/', { waitUntil: 'networkidle2' });

    // 1. Capture Top Hero: Video on left with 3 layers underneath, Bundle selector on right
    await page.screenshot({ path: 'scratch/desktop_hero_layers_and_bundles.png' });
    console.log("Captured desktop hero layers and bundles");

    // 2. Click 2 Boxes bundle, check price update
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, div[role="button"]'));
      const twoBoxBtn = buttons.find(b => b.textContent.includes('২ বক্স') || b.textContent.includes('2 Box'));
      if (twoBoxBtn) twoBoxBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));

    // 3. Scroll to Order Form & Confirm Order + Storage Tip
    await page.evaluate(() => {
      const el = document.getElementById('order-form-details');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: 'scratch/desktop_order_form_and_storage_tips.png' });
    console.log("Captured desktop order form and storage tip under order button");

    // 4. Test Auto-Fill feature: fill input, reload, verify persisted
    await page.type('input[name="name"]', 'মো: আরাফাত ইসলাম');
    await page.type('input[name="phone"]', '01712345678');
    await page.type('textarea[name="address"]', 'মিরপুর ১০, ঢাকা');
    await new Promise(r => setTimeout(r, 400));

    // Reload page to test localStorage auto-fill
    await page.reload({ waitUntil: 'networkidle2' });
    await page.evaluate(() => {
      const el = document.getElementById('order-form-details');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: 'scratch/desktop_autofill_verified.png' });
    console.log("Captured autofill verified after reload");

    // 5. Mobile Test (412x915)
    const mobilePage = await browser.newPage();
    await mobilePage.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true });
    await mobilePage.goto('http://localhost:4188/', { waitUntil: 'networkidle2' });

    // Mobile Top Video & 3 layers
    await mobilePage.screenshot({ path: 'scratch/mobile_layers_below_video.png' });
    console.log("Captured mobile layers below video");

    // Mobile Order Button & Storage Tip
    await mobilePage.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('অর্ডার কনফার্ম করুন'));
      if (btn) btn.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await new Promise(r => setTimeout(r, 400));
    await mobilePage.screenshot({ path: 'scratch/mobile_order_button_and_storage_tip.png' });
    console.log("Captured mobile storage tip directly below order button");

  } catch (err) {
    console.error("Test error:", err);
  } finally {
    await browser.close();
    preview.kill();
  }
}

run();
