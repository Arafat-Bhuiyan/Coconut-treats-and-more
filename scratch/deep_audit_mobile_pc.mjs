import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\Gigabyte\\.gemini\\antigravity\\brain\\148d27dc-4029-49b4-87e6-34bc45710faa';
const URL = 'https://coconuttreatsmore.com/';

function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function runDeepAudit() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const errors = [];
  const warnings = [];

  try {
    const page = await browser.newPage();

    page.on('console', (msg) => {
      const type = msg.type();
      const text = msg.text();
      if (type === 'error') {
        console.error(`[BROWSER ERROR]: ${text}`);
        errors.push(text);
      } else if (type === 'warning') {
        console.warn(`[BROWSER WARN]: ${text}`);
        warnings.push(text);
      } else {
        console.log(`[BROWSER LOG]: ${text}`);
      }
    });

    page.on('pageerror', (err) => {
      console.error(`[PAGE UNCAUGHT ERROR]: ${err.message}`);
      errors.push(err.message);
    });

    page.on('requestfailed', (req) => {
      // Ignore facebook pixel or analytics blocks if adblock is present
      const url = req.url();
      if (!url.includes('facebook') && !url.includes('google-analytics')) {
        console.error(`[REQUEST FAILED]: ${url} - ${req.failure()?.errorText}`);
      }
    });

    // 1. MOBILE AUDIT
    console.log("=== 1. STARTING MOBILE AUDIT (390x844) ===");
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.goto(URL, { waitUntil: 'networkidle2' });
    await delay(2000);

    // Check for Horizontal Overflow (common mobile layout bug)
    const overflowCheck = await page.evaluate(() => {
      const docWidth = document.documentElement.offsetWidth;
      const scrollWidth = document.documentElement.scrollWidth;
      const elementsWithOverflow = [];
      document.querySelectorAll('*').forEach((el) => {
        if (el.scrollWidth > docWidth + 2) {
          elementsWithOverflow.push({
            tag: el.tagName,
            className: el.className,
            id: el.id,
            scrollWidth: el.scrollWidth,
            docWidth: docWidth
          });
        }
      });
      return { docWidth, scrollWidth, hasOverflow: scrollWidth > docWidth, elementsWithOverflow };
    });
    console.log("Mobile Horizontal Overflow Check:", overflowCheck);

    // Test Quick Order Scroll
    console.log("Testing Quick Order button click...");
    const quickOrderBtn = await page.$('a[href="#order-form-details"]');
    if (quickOrderBtn) {
      await quickOrderBtn.click();
      await delay(1000);
    }

    // Test Quantity Buttons (+ and -)
    console.log("Testing Quantity + and - buttons...");
    const initialQty = await page.evaluate(() => {
      const qtyEl = document.querySelector('button[aria-label="Increase quantity"]')?.previousElementSibling;
      return qtyEl ? qtyEl.innerText.trim() : null;
    });
    console.log("Initial Quantity:", initialQty);

    // Click +
    const plusBtn = await page.$('button[aria-label="Increase quantity"]');
    if (plusBtn) {
      await plusBtn.click();
      await delay(500);
    }
    const qtyAfterPlus = await page.evaluate(() => {
      const qtyEl = document.querySelector('button[aria-label="Increase quantity"]')?.previousElementSibling;
      return qtyEl ? qtyEl.innerText.trim() : null;
    });
    console.log("Quantity after +:", qtyAfterPlus);

    // Click -
    const minusBtn = await page.$('button[aria-label="Decrease quantity"]');
    if (minusBtn) {
      await minusBtn.click();
      await delay(500);
    }
    const qtyAfterMinus = await page.evaluate(() => {
      const qtyEl = document.querySelector('button[aria-label="Decrease quantity"]')?.nextElementSibling;
      return qtyEl ? qtyEl.innerText.trim() : null;
    });
    console.log("Quantity after -:", qtyAfterMinus);

    // Test Gift Card Toggle
    console.log("Testing Gift Card Click...");
    await page.evaluate(() => {
      const checkbox = document.getElementById('gift-option-checkbox');
      if (checkbox) checkbox.parentElement.parentElement.click();
    });
    await delay(500);

    const isGiftOpen = await page.evaluate(() => {
      const msgInput = document.getElementById('gift-message-input');
      return !!msgInput;
    });
    console.log("Gift input open:", isGiftOpen);

    // Test Quick Wish preset buttons
    if (isGiftOpen) {
      console.log("Testing Quick Wish Presets...");
      await page.evaluate(() => {
        const presetBtn = document.querySelector('button:has-text("শুভ জন্মদিন! 🎂"), button');
        const allBtns = Array.from(document.querySelectorAll('button'));
        const birthdayBtn = allBtns.find(b => b.innerText.includes('শুভ জন্মদিন'));
        if (birthdayBtn) birthdayBtn.click();
      });
      await delay(300);
      const giftVal = await page.evaluate(() => {
        const input = document.getElementById('gift-message-input');
        return input ? input.value : '';
      });
      console.log("Gift message value after preset click:", giftVal);
    }

    // Test Payment Method switch (COD vs bKash)
    console.log("Testing Payment Method switch to bKash...");
    await page.evaluate(() => {
      const bkashOpt = document.getElementById('payment-method-bkash');
      if (bkashOpt) bkashOpt.click();
    });
    await delay(500);

    const isBkashOpen = await page.evaluate(() => {
      const trxInput = document.getElementById('bkash-trx');
      return !!trxInput;
    });
    console.log("bKash section open:", isBkashOpen);

    // Test bKash copy button
    if (isBkashOpen) {
      console.log("Testing bKash Copy Button...");
      await page.evaluate(() => {
        const copyBtns = Array.from(document.querySelectorAll('button'));
        const copyBtn = copyBtns.find(b => b.innerText.includes('কপি'));
        if (copyBtn) copyBtn.click();
      });
      await delay(300);
    }

    // Switch back to COD
    await page.evaluate(() => {
      const codOpt = document.getElementById('payment-method-cod');
      if (codOpt) codOpt.click();
    });
    await delay(300);

    // Test Form Inputs validation
    console.log("Testing Form Input validations...");
    await page.type('#customer-name', 'Audit Test Name');
    await page.type('#customer-phone', '01811223344');
    await page.type('#customer-address', 'Audit Address Test');

    const phoneValidation = await page.evaluate(() => {
      const phoneValidBadge = document.body.innerText.includes('সঠিক নম্বর');
      return { phoneValidBadge };
    });
    console.log("Phone Validation status:", phoneValidation);

    // Check sticky bar position and visibility
    const stickyBarStatus = await page.evaluate(() => {
      const bar = document.querySelector('.fixed.bottom-0');
      if (!bar) return { present: false };
      const rect = bar.getBoundingClientRect();
      const style = window.getComputedStyle(bar);
      return {
        present: true,
        display: style.display,
        visibility: style.visibility,
        opacity: style.opacity,
        transform: style.transform,
        bottom: rect.bottom,
        top: rect.top,
        height: rect.height,
        zIndex: style.zIndex
      };
    });
    console.log("Sticky Mobile Bar Status:", stickyBarStatus);

    // Check WhatsApp button position and visibility
    const waStatus = await page.evaluate(() => {
      const wa = document.querySelector('button[aria-label="Chat on WhatsApp"]');
      if (!wa) return { present: false };
      const rect = wa.getBoundingClientRect();
      const style = window.getComputedStyle(wa);
      return {
        present: true,
        bottom: rect.bottom,
        left: rect.left,
        top: rect.top,
        zIndex: style.zIndex,
        width: rect.width,
        height: rect.height
      };
    });
    console.log("WhatsApp button status:", waStatus);

    // Capture mobile full page screenshot
    const mobileAuditScreen = path.join(ARTIFACT_DIR, 'mobile_deep_audit.png');
    await page.screenshot({ path: mobileAuditScreen, fullPage: true });
    console.log("Saved full mobile audit screenshot:", mobileAuditScreen);

    // 2. DESKTOP / PC AUDIT
    console.log("=== 2. STARTING DESKTOP AUDIT (1366x800) ===");
    await page.setViewport({ width: 1366, height: 800 });
    await page.goto(URL, { waitUntil: 'networkidle2' });
    await delay(1500);

    // Test navigation link clicks
    const navLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('nav a, header a')).map(a => ({
        text: a.innerText.trim(),
        href: a.getAttribute('href')
      }));
      return links;
    });
    console.log("Nav links found:", navLinks);

    // Test video element
    const videoStatus = await page.evaluate(() => {
      const video = document.querySelector('video');
      if (!video) return { present: false };
      return {
        present: true,
        paused: video.paused,
        currentTime: video.currentTime,
        duration: video.duration,
        readyState: video.readyState,
        muted: video.muted,
        src: video.currentSrc
      };
    });
    console.log("Desktop Video Status:", videoStatus);

    // Capture desktop screenshot
    const pcAuditScreen = path.join(ARTIFACT_DIR, 'pc_deep_audit.png');
    await page.screenshot({ path: pcAuditScreen, fullPage: true });
    console.log("Saved full PC audit screenshot:", pcAuditScreen);

    console.log("\n=== AUDIT SUMMARY ===");
    console.log("Total Console Errors:", errors.length);
    console.log("Total Console Warnings:", warnings.length);

  } finally {
    await browser.close();
  }
}

runDeepAudit().catch(err => {
  console.error("Deep audit crashed:", err);
  process.exit(1);
});
