import puppeteer from 'puppeteer-core';
import path from 'path';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runAudit() {
  console.log('====================================================');
  console.log('=== STARTING DEEP PERFORMANCE & BUG AUDIT ON LIVE SITE ===');
  console.log('====================================================');

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const artifactsDir = 'C:\\Users\\Gigabyte\\.gemini\\antigravity\\brain\\148d27dc-4029-49b4-87e6-34bc45710faa';
  const liveUrl = 'https://coconuttreatsmore.com/?audit=' + Date.now();

  const auditReport = {
    consoleErrors: [],
    failedRequests: [],
    desktopMetrics: {},
    mobileMetrics: {},
    desktopOrder: false,
    mobileOrder: false,
    bugsFound: []
  };

  // --- 1. DESKTOP AUDIT ---
  console.log('\n>>> [1/2] Auditing Desktop...');
  const desktopPage = await browser.newPage();
  await desktopPage.setViewport({ width: 1280, height: 900 });

  desktopPage.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.log('[Desktop Console Error]:', msg.text());
      auditReport.consoleErrors.push({ platform: 'desktop', text: msg.text() });
    }
  });

  desktopPage.on('requestfailed', (req) => {
    // Ignore cancelled analytics or prefetch if any
    const failure = req.failure();
    const url = req.url();
    if (!url.includes('facebook') && !url.includes('analytics')) {
      console.log('[Desktop Request Failed]:', url, failure ? failure.errorText : '');
      auditReport.failedRequests.push({ platform: 'desktop', url, error: failure?.errorText });
    }
  });

  const desktopStart = Date.now();
  await desktopPage.goto(liveUrl, { waitUntil: 'networkidle2', timeout: 45000 });
  const desktopLoadTime = Date.now() - desktopStart;

  // Extract Performance Metrics
  const desktopPerf = await desktopPage.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    const paint = performance.getEntriesByType('paint');
    const fcp = paint.find(p => p.name === 'first-contentful-paint');
    return {
      domContentLoaded: nav ? Math.round(nav.domContentLoadedEventEnd - nav.startTime) : null,
      loadEvent: nav ? Math.round(nav.loadEventEnd - nav.startTime) : null,
      fcp: fcp ? Math.round(fcp.startTime) : null
    };
  });
  desktopPerf.totalNavigationTime = desktopLoadTime;
  auditReport.desktopMetrics = desktopPerf;
  console.log('Desktop Performance Metrics:', desktopPerf);

  // Take screenshot of desktop hero
  const desktopHeroPath = path.join(artifactsDir, 'audit_desktop_hero.png');
  await desktopPage.screenshot({ path: desktopHeroPath });

  // Test live order submission on Desktop
  console.log('Testing live order submission on Desktop...');
  await desktopPage.type('input[name="name"]', 'Audit User Desktop', { delay: 10 });
  await desktopPage.type('input[name="phone"]', '01700000001', { delay: 10 });
  await desktopPage.type('textarea[name="address"]', 'রোড ১০, বাড়ি ১৫, ধানমন্ডি, ঢাকা', { delay: 10 });
  await desktopPage.type('input[name="note"]', '[System Performance Audit Order - Ignore]', { delay: 10 });

  // Intercept the API submission
  let desktopApiSuccess = false;
  desktopPage.on('response', async (res) => {
    if (res.url().includes('/api/submit-order')) {
      console.log('Desktop API response status:', res.status());
      try {
        const json = await res.json();
        console.log('Desktop API response JSON:', json);
        if (json.success || res.status() === 200) {
          desktopApiSuccess = true;
        }
      } catch (e) {
        if (res.status() === 200) desktopApiSuccess = true;
      }
    }
  });

  const submitBtn = await desktopPage.$('button[type="submit"]');
  if (submitBtn) {
    await submitBtn.click();
    try {
      await desktopPage.waitForSelector('div.fixed.inset-0.z-\\[100\\]', { visible: true, timeout: 8000 });
      console.log('✓ Desktop Success Modal popped up!');
      auditReport.desktopOrder = true;
      const desktopSuccessPath = path.join(artifactsDir, 'audit_desktop_success.png');
      await desktopPage.screenshot({ path: desktopSuccessPath });
    } catch (e) {
      console.error('Failed to see modal on desktop:', e.message);
    }
  }

  // --- 2. MOBILE AUDIT ---
  console.log('\n>>> [2/2] Auditing Mobile...');
  const mobilePage = await browser.newPage();
  await mobilePage.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

  mobilePage.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.log('[Mobile Console Error]:', msg.text());
      auditReport.consoleErrors.push({ platform: 'mobile', text: msg.text() });
    }
  });

  mobilePage.on('requestfailed', (req) => {
    const failure = req.failure();
    const url = req.url();
    if (!url.includes('facebook') && !url.includes('analytics')) {
      console.log('[Mobile Request Failed]:', url, failure ? failure.errorText : '');
      auditReport.failedRequests.push({ platform: 'mobile', url, error: failure?.errorText });
    }
  });

  const mobileStart = Date.now();
  await mobilePage.goto(liveUrl, { waitUntil: 'networkidle2', timeout: 45000 });
  const mobileLoadTime = Date.now() - mobileStart;

  const mobilePerf = await mobilePage.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    const paint = performance.getEntriesByType('paint');
    const fcp = paint.find(p => p.name === 'first-contentful-paint');
    return {
      domContentLoaded: nav ? Math.round(nav.domContentLoadedEventEnd - nav.startTime) : null,
      loadEvent: nav ? Math.round(nav.loadEventEnd - nav.startTime) : null,
      fcp: fcp ? Math.round(fcp.startTime) : null
    };
  });
  mobilePerf.totalNavigationTime = mobileLoadTime;
  auditReport.mobileMetrics = mobilePerf;
  console.log('Mobile Performance Metrics:', mobilePerf);

  // Take screenshot of mobile hero
  const mobileHeroPath = path.join(artifactsDir, 'audit_mobile_hero.png');
  await mobilePage.screenshot({ path: mobileHeroPath });

  // Test live order submission on Mobile
  console.log('Testing live order submission on Mobile...');
  // Scroll to form
  await mobilePage.evaluate(() => {
    const el = document.getElementById('order-form-details');
    if (el) el.scrollIntoView();
  });
  await sleep(1000);

  // Dismiss any promo if open
  await mobilePage.evaluate(() => {
    const closeBtn = document.querySelector('button[aria-label="Close promotion dialog"]');
    if (closeBtn) closeBtn.click();
  });
  await sleep(500);

  // Clear name and phone if filled
  await mobilePage.evaluate(() => {
    const name = document.querySelector('input[name="name"]');
    const phone = document.querySelector('input[name="phone"]');
    const addr = document.querySelector('textarea[name="address"]');
    const note = document.querySelector('input[name="note"]');
    if (name) name.value = '';
    if (phone) phone.value = '';
    if (addr) addr.value = '';
    if (note) note.value = '';
  });

  await mobilePage.type('input[name="name"]', 'Audit User Mobile', { delay: 10 });
  await mobilePage.type('input[name="phone"]', '01800000002', { delay: 10 });
  await mobilePage.type('textarea[name="address"]', 'রোড ৪, বাড়ি ১২, বনানী, ঢাকা', { delay: 10 });
  await mobilePage.type('input[name="note"]', '[System Performance Audit Order Mobile - Ignore]', { delay: 10 });

  let mobileApiSuccess = false;
  mobilePage.on('response', async (res) => {
    if (res.url().includes('/api/submit-order')) {
      console.log('Mobile API response status:', res.status());
      try {
        const json = await res.json();
        console.log('Mobile API response JSON:', json);
        if (json.success || res.status() === 200) {
          mobileApiSuccess = true;
        }
      } catch (e) {
        if (res.status() === 200) mobileApiSuccess = true;
      }
    }
  });

  const mobileSubmitBtn = await mobilePage.$('button[type="submit"]');
  if (mobileSubmitBtn) {
    await mobileSubmitBtn.click();
    try {
      await mobilePage.waitForSelector('div.fixed.inset-0.z-\\[100\\]', { visible: true, timeout: 8000 });
      console.log('✓ Mobile Success Modal popped up!');
      auditReport.mobileOrder = true;
      const mobileSuccessPath = path.join(artifactsDir, 'audit_mobile_success.png');
      await mobilePage.screenshot({ path: mobileSuccessPath });
    } catch (e) {
      console.error('Failed to see modal on mobile:', e.message);
    }
  }

  await sleep(1500);
  await browser.close();

  console.log('\n====================================================');
  console.log('=== AUDIT COMPLETE ===');
  console.log('Console Errors Count:', auditReport.consoleErrors.length);
  console.log('Failed Requests Count:', auditReport.failedRequests.length);
  console.log('Desktop FCP:', auditReport.desktopMetrics.fcp, 'ms');
  console.log('Mobile FCP:', auditReport.mobileMetrics.fcp, 'ms');
  console.log('Desktop Live Order:', auditReport.desktopOrder ? 'PASSED' : 'FAILED');
  console.log('Mobile Live Order:', auditReport.mobileOrder ? 'PASSED' : 'FAILED');
  console.log('====================================================');

  return auditReport;
}

runAudit().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
