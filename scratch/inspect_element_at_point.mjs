import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'https://coconuttreatsmore.com/';

async function inspectElementAtPoint() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(URL, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  const result = await page.evaluate(() => {
    const box = document.getElementById('gift-card-box-container');
    if (!box) return { error: 'Box not found' };
    
    box.scrollIntoView({ behavior: 'instant', block: 'center' });
    const rect = box.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const elAtCenter = document.elementFromPoint(centerX, centerY);
    const elAtLeft = document.elementFromPoint(rect.left + 15, rect.top + 15);

    return {
      rect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
      elAtCenter: elAtCenter ? { tag: elAtCenter.tagName, id: elAtCenter.id, className: elAtCenter.className } : null,
      elAtLeft: elAtLeft ? { tag: elAtLeft.tagName, id: elAtLeft.id, className: elAtLeft.className } : null,
      isDescendantOrSelf: box.contains(elAtCenter),
      boxStyle: {
        pointerEvents: window.getComputedStyle(box).pointerEvents,
        userSelect: window.getComputedStyle(box).userSelect,
        zIndex: window.getComputedStyle(box).zIndex,
        display: window.getComputedStyle(box).display
      }
    };
  });

  console.log("PC Inspection:", JSON.stringify(result, null, 2));

  // Test Mobile
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await new Promise(r => setTimeout(r, 1000));

  const mobileResult = await page.evaluate(() => {
    const box = document.getElementById('gift-card-box-container');
    if (!box) return { error: 'Box not found' };
    
    box.scrollIntoView({ behavior: 'instant', block: 'center' });
    const rect = box.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const elAtCenter = document.elementFromPoint(centerX, centerY);
    const elAtLeft = document.elementFromPoint(rect.left + 15, rect.top + 15);

    return {
      rect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
      elAtCenter: elAtCenter ? { tag: elAtCenter.tagName, id: elAtCenter.id, className: elAtCenter.className } : null,
      elAtLeft: elAtLeft ? { tag: elAtLeft.tagName, id: elAtLeft.id, className: elAtLeft.className } : null,
      isDescendantOrSelf: box.contains(elAtCenter),
      boxStyle: {
        pointerEvents: window.getComputedStyle(box).pointerEvents,
        userSelect: window.getComputedStyle(box).userSelect,
        zIndex: window.getComputedStyle(box).zIndex,
        display: window.getComputedStyle(box).display
      }
    };
  });

  console.log("Mobile Inspection:", JSON.stringify(mobileResult, null, 2));

  await browser.close();
}

inspectElementAtPoint();
