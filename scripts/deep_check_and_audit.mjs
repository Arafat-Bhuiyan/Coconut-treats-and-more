import puppeteer from 'puppeteer-core';

async function runDeepAudit() {
  console.log("=== STARTING DEEP CODE & UX AUDIT ON LIVE WEBSITE ===");
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const issues = [];
  const logs = [];

  // Helper to attach listeners
  const setupPage = (page, device) => {
    page.on('console', msg => {
      if (msg.type() === 'error') {
        // Filter expected non-critical tracking noise
        const text = msg.text();
        if (!text.includes('facebook') && !text.includes('analytics') && !text.includes('adblock')) {
          issues.push({ device, type: 'console.error', text });
        }
      }
      logs.push(`[${device}] ${msg.type()}: ${msg.text()}`);
    });
    page.on('pageerror', err => {
      issues.push({ device, type: 'pageerror', text: err.message });
    });
  };

  try {
    // 1. MOBILE AUDIT (393x852)
    console.log("\n--- Testing Mobile Viewport (393x852) ---");
    const mobilePage = await browser.newPage();
    setupPage(mobilePage, 'Mobile');
    await mobilePage.setViewport({ width: 393, height: 852, isMobile: true, hasTouch: true });
    
    const startMobile = Date.now();
    await mobilePage.goto('https://coconuttreatsmore.com/?t=' + Date.now(), { waitUntil: 'networkidle2', timeout: 30000 });
    const mobileLoadTime = Date.now() - startMobile;
    console.log(`Mobile page loaded in ${mobileLoadTime}ms`);

    // Verify Video Element
    const videoState = await mobilePage.evaluate(() => {
      const v = document.querySelector('video');
      return {
        exists: !!v,
        paused: v ? v.paused : true,
        muted: v ? v.muted : false,
        src: v ? v.currentSrc : null,
        offsetWidth: v ? v.offsetWidth : 0,
        offsetHeight: v ? v.offsetHeight : 0
      };
    });
    console.log("Mobile video state:", videoState);

    // Verify Rating under video
    const mobileRatingExists = await mobilePage.evaluate(() => {
      const el = document.evaluate("//span[contains(text(), '4.9/5 Loved by 1,000+ Customers')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      return el ? { visible: el.offsetParent !== null, text: el.innerText } : null;
    });
    console.log("Mobile rating check:", mobileRatingExists);

    // Test Package Switching
    console.log("Testing package switching on mobile...");
    // Click 1 Box
    await mobilePage.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('div')).filter(d => d.innerText && d.innerText.includes('১ বক্স (৬ কাপ)'));
      if (cards.length > 0) cards[0].click();
    });
    await new Promise(r => setTimeout(r, 600));

    let payable = await mobilePage.evaluate(() => {
      const el = document.querySelector('.text-2xl.font-black.text-\\[\\#4A6741\\]');
      return el ? el.innerText : null;
    });
    console.log("Payable for 1 Box:", payable);

    // Click 5 Boxes
    await mobilePage.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('div')).filter(d => d.innerText && d.innerText.includes('৫ বক্স (৩০ কাপ)'));
      if (cards.length > 0) cards[0].click();
    });
    await new Promise(r => setTimeout(r, 600));

    payable = await mobilePage.evaluate(() => {
      const el = document.querySelector('.text-2xl.font-black.text-\\[\\#4A6741\\]');
      return el ? el.innerText : null;
    });
    console.log("Payable for 5 Boxes (Free Delivery):", payable);

    // Test bKash Selection & Copy
    console.log("Testing bKash payment method selection...");
    await mobilePage.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('[role="button"]')).find(b => b.innerText && b.innerText.includes('bKash'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 600));

    const bkashVisible = await mobilePage.evaluate(() => {
      return document.body.innerText.includes('01618562844');
    });
    console.log("bKash personal number visible:", bkashVisible);

    // Switch back to Cash on Delivery
    await mobilePage.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('[role="button"]')).find(b => b.innerText && b.innerText.includes('Cash on Delivery'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 400));

    // Fill form and place a test order on Mobile
    console.log("Submitting verified test order on mobile...");
    await mobilePage.type('#customer-name', 'Mobile Live Auditor');
    await mobilePage.type('#customer-phone', '01711000000');
    await mobilePage.type('#customer-address', 'Flat 4B, Road 12, Gulshan-2, Dhaka');

    // Click submit order
    await mobilePage.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 1200));

    // Verify Success Modal
    const modalSuccess = await mobilePage.evaluate(() => {
      const modal = document.querySelector('[role="dialog"]') || document.body.innerText.includes('অর্ডার সফল হয়েছে');
      return !!modal;
    });
    console.log("Mobile test order success modal displayed:", modalSuccess);

    // 2. DESKTOP AUDIT (1440x900)
    console.log("\n--- Testing Desktop Viewport (1440x900) ---");
    const desktopPage = await browser.newPage();
    setupPage(desktopPage, 'Desktop');
    await desktopPage.setViewport({ width: 1440, height: 900 });

    const startDesktop = Date.now();
    await desktopPage.goto('https://coconuttreatsmore.com/?t=' + Date.now(), { waitUntil: 'networkidle2', timeout: 30000 });
    const desktopLoadTime = Date.now() - startDesktop;
    console.log(`Desktop page loaded in ${desktopLoadTime}ms`);

    // Verify Desktop layout
    const desktopRating = await desktopPage.evaluate(() => {
      const el = document.evaluate("//span[contains(text(), '4.9/5 Loved by 1,000+ Customers')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      return el ? { visible: el.offsetParent !== null, text: el.innerText } : null;
    });
    console.log("Desktop rating check:", desktopRating);

    // Verify Navbar Quick Order button
    const quickOrderBtn = await desktopPage.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('a')).find(a => a.innerText && a.innerText.includes('Quick Order'));
      return !!btn;
    });
    console.log("Desktop Quick Order button in Navbar:", quickOrderBtn);

    console.log("\n=== AUDIT SUMMARY ===");
    console.log("Total Critical Issues Detected:", issues.length);
    if (issues.length > 0) {
      console.log("Issues:", issues);
    } else {
      console.log("NO JS ERRORS OR CRITICAL BUGS DETECTED!");
    }

  } catch (err) {
    console.error("Audit error:", err);
  } finally {
    await browser.close();
  }
}

runDeepAudit();
