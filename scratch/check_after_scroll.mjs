import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'https://coconuttreatsmore.com/';

async function checkAfterScroll() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  page.on('console', msg => console.log('CONSOLE:', msg.text()));

  await page.goto(URL, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  // Scroll into view
  await page.evaluate(() => {
    const btn = document.getElementById('gift-card-toggle-btn');
    btn.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await new Promise(r => setTimeout(r, 1000));

  // Check what element is at the center of the button NOW
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

  console.log("Element Info after scroll:", JSON.stringify(elementInfo, null, 2));

  // Now click using page.click (which automatically scrolls and clicks)
  console.log("Now clicking with page.click('#gift-card-toggle-btn')...");
  await page.click('#gift-card-toggle-btn');
  await new Promise(r => setTimeout(r, 1000));

  const state = await page.evaluate(() => {
    const btn = document.getElementById('gift-card-toggle-btn');
    const input = document.getElementById('gift-message-input');
    return {
      isOpen: !!input,
      ariaPressed: btn ? btn.getAttribute('aria-pressed') : null
    };
  });
  console.log("State after page.click:", state);

  await browser.close();
}

checkAfterScroll();
