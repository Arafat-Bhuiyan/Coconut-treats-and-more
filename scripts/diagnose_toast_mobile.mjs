import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const LIVE_URL = 'https://coconuttreatsmore.com/';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto(LIVE_URL, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 5000));

  const info = await page.evaluate(() => {
    const el = document.querySelector('[role="status"]');
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const children = Array.from(el.querySelectorAll('*')).map(c => {
      const cr = c.getBoundingClientRect();
      return {
        tag: c.tagName,
        className: typeof c.className === 'string' ? c.className : '',
        top: cr.top,
        bottom: cr.bottom,
        height: cr.height,
        width: cr.width
      };
    });
    return {
      top: r.top,
      bottom: r.bottom,
      height: r.height,
      children
    };
  });

  console.log('Parent Top:', info.top, 'Bottom:', info.bottom, 'Height:', info.height);
  console.log('Children taller than 100px:');
  console.log(info.children.filter(x => x.height > 100));
  await browser.close();
}

run();
