import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'https://coconuttreatsmore.com/';

function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function verifyAfterOverlayFix() {
  console.log("Waiting 15 seconds for Vercel deployment of commit d5a8af0...");
  await delay(15000);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  await page.evaluateOnNewDocument(() => {
    sessionStorage.setItem('hasShownPromo', 'true');
  });

  await page.goto(URL, { waitUntil: 'networkidle2' });
  await delay(2000);

  // Scroll button into view
  await page.evaluate(() => {
    const btn = document.getElementById('gift-card-toggle-btn');
    if (btn) btn.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await delay(1000);

  // Check element at center of button
  const elementInfo = await page.evaluate(() => {
    const btn = document.getElementById('gift-card-toggle-btn');
    const rect = btn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const topEl = document.elementFromPoint(cx, cy);

    return {
      rect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
      cx, cy,
      topEl: topEl ? { tag: topEl.tagName, id: topEl.id, class: topEl.className } : null,
      isBtnOrInside: btn.contains(topEl) || btn === topEl
    };
  });

  console.log("=== ELEMENT AT CLICK POINT ===");
  console.log(JSON.stringify(elementInfo, null, 2));

  // Now click
  console.log("Simulating click on #gift-card-toggle-btn...");
  await page.click('#gift-card-toggle-btn');
  await delay(1000);

  const state = await page.evaluate(() => {
    const btn = document.getElementById('gift-card-toggle-btn');
    const input = document.getElementById('gift-message-input');
    return {
      isOpen: !!input,
      ariaPressed: btn ? btn.getAttribute('aria-pressed') : null,
      badgeText: btn ? btn.innerText.includes('✓ সিলেক্ট করা হয়েছে') : false
    };
  });
  console.log("=== STATE AFTER CLICK ===");
  console.log(JSON.stringify(state, null, 2));

  await browser.close();
}

verifyAfterOverlayFix();
