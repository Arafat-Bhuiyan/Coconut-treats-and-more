import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'https://coconuttreatsmore.com/';

async function deepDebug() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  
  const eventsFired = [];
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('BROWSER PAGEERROR:', err.message));

  await page.goto(URL, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  // Inspect the button and its event listeners
  const debugInfo = await page.evaluate(() => {
    const btn = document.getElementById('gift-card-toggle-btn');
    if (!btn) return { error: 'Button not found' };

    const rect = btn.getBoundingClientRect();
    const style = window.getComputedStyle(btn);

    // Track events on the button
    ['click', 'mousedown', 'mouseup', 'pointerdown', 'pointerup', 'touchstart', 'touchend'].forEach(evt => {
      btn.addEventListener(evt, (e) => {
        console.log(`[EVENT FIRED]: ${evt}, target=${e.target.tagName}#${e.target.id}, defaultPrevented=${e.defaultPrevented}`);
      });
    });

    return {
      rect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
      style: {
        pointerEvents: style.pointerEvents,
        cursor: style.cursor,
        display: style.display,
        visibility: style.visibility,
        opacity: style.opacity
      }
    };
  });

  console.log("Debug Info:", debugInfo);

  // Now simulate a click directly on the button using page.mouse.click
  const btn = await page.$('#gift-card-toggle-btn');
  const box = await btn.boundingBox();
  console.log("Button bounding box:", box);

  console.log("Simulating click at center of button:", box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await new Promise(r => setTimeout(r, 1000));

  const afterClick = await page.evaluate(() => {
    const input = document.getElementById('gift-message-input');
    const btn = document.getElementById('gift-card-toggle-btn');
    return {
      isOpen: !!input,
      ariaPressed: btn ? btn.getAttribute('aria-pressed') : null
    };
  });
  console.log("After Click Result:", afterClick);

  await browser.close();
}

deepDebug();
