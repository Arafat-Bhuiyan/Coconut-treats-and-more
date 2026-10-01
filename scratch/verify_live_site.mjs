import puppeteer from 'puppeteer-core';

async function run() {
  console.log("Waiting 15 seconds for Vercel deployment...");
  await new Promise(r => setTimeout(r, 15000));

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    // 1. Desktop Check (1440x1350)
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 1350 });
    await page.goto('https://coconuttreatsmore.com/?v=' + Date.now(), { waitUntil: 'networkidle2' });

    await page.screenshot({ path: 'scratch/live_desktop_unified_final.png' });
    console.log("Captured live desktop final");

    // 2. Mobile Check (412x915)
    const mobilePage = await browser.newPage();
    await mobilePage.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true });
    await mobilePage.goto('https://coconuttreatsmore.com/?v=' + Date.now(), { waitUntil: 'networkidle2' });

    // Scroll slightly to capture bundle + form
    await mobilePage.evaluate(() => {
      const el = document.querySelector('input[name="name"]');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await new Promise(r => setTimeout(r, 400));
    await mobilePage.screenshot({ path: 'scratch/live_mobile_unified_final.png' });
    console.log("Captured live mobile final");

  } finally {
    await browser.close();
    process.exit(0);
  }
}

run().catch(err => {
  console.error("Live test failed:", err);
  process.exit(1);
});
