import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'https://coconuttreatsmore.com/';

async function measureSpeed() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox']
  });

  try {
    // 1. Mobile Performance Measurement
    const mobilePage = await browser.newPage();
    await mobilePage.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

    const startMobile = Date.now();
    await mobilePage.goto(URL, { waitUntil: 'networkidle2' });
    const mobileLoadTime = Date.now() - startMobile;

    const mobileMetrics = await mobilePage.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');
      const fcp = paint.find(p => p.name === 'first-contentful-paint');

      return {
        dnsLookup: Math.round(nav ? nav.domainLookupEnd - nav.domainLookupStart : 0),
        tcpConnect: Math.round(nav ? nav.connectEnd - nav.connectStart : 0),
        ttfb: Math.round(nav ? nav.responseStart - nav.requestStart : 0),
        domContentLoaded: Math.round(nav ? nav.domContentLoadedEventEnd - nav.fetchStart : 0),
        completeLoad: Math.round(nav ? nav.loadEventEnd - nav.fetchStart : 0),
        fcp: Math.round(fcp ? fcp.startTime : 0)
      };
    });

    console.log("=== MOBILE PERFORMANCE METRICS ===");
    console.log("Network Idle Load Time:", mobileLoadTime, "ms");
    console.log(JSON.stringify(mobileMetrics, null, 2));

    // 2. Desktop PC Performance Measurement
    const pcPage = await browser.newPage();
    await pcPage.setViewport({ width: 1280, height: 800 });

    const startPC = Date.now();
    await pcPage.goto(URL, { waitUntil: 'networkidle2' });
    const pcLoadTime = Date.now() - startPC;

    const pcMetrics = await pcPage.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');
      const fcp = paint.find(p => p.name === 'first-contentful-paint');

      return {
        dnsLookup: Math.round(nav ? nav.domainLookupEnd - nav.domainLookupStart : 0),
        tcpConnect: Math.round(nav ? nav.connectEnd - nav.connectStart : 0),
        ttfb: Math.round(nav ? nav.responseStart - nav.requestStart : 0),
        domContentLoaded: Math.round(nav ? nav.domContentLoadedEventEnd - nav.fetchStart : 0),
        completeLoad: Math.round(nav ? nav.loadEventEnd - nav.fetchStart : 0),
        fcp: Math.round(fcp ? fcp.startTime : 0)
      };
    });

    console.log("=== PC DESKTOP PERFORMANCE METRICS ===");
    console.log("Network Idle Load Time:", pcLoadTime, "ms");
    console.log(JSON.stringify(pcMetrics, null, 2));

  } finally {
    await browser.close();
  }
}

measureSpeed();
