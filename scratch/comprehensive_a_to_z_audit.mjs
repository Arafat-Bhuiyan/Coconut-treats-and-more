import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\Gigabyte\\.gemini\\antigravity\\brain\\148d27dc-4029-49b4-87e6-34bc45710faa';
const URL = 'https://coconuttreatsmore.com/';

async function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function runComprehensiveAudit() {
  console.log('Waiting 28 seconds for Vercel to finish building & deploying commit d8784a9...');
  await delay(28000);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const auditReport = {
    mobile: { errors: [], warnings: [], overflow: false, orderPayload: null, successPopup: false },
    desktop: { errors: [], warnings: [], overflow: false, orderPayload: null, successPopup: false }
  };

  try {
    // ==========================================
    // 1. MOBILE A-TO-Z AUDIT & LIVE ORDER TEST
    // ==========================================
    console.log('\n--- STARTING MOBILE A-TO-Z AUDIT ---');
    const mobilePage = await browser.newPage();
    await mobilePage.setViewport({ width: 393, height: 852, isMobile: true, hasTouch: true });

    mobilePage.on('console', (msg) => {
      const type = msg.type();
      const text = msg.text();
      if (type === 'error') auditReport.mobile.errors.push(text);
      else if (type === 'warn' && !text.includes('FB Purchase')) auditReport.mobile.warnings.push(text);
    });

    mobilePage.on('pageerror', (err) => {
      auditReport.mobile.errors.push(err.toString());
    });

    mobilePage.on('request', (req) => {
      if (req.url().includes('/api/submit-order') && req.method() === 'POST') {
        try {
          auditReport.mobile.orderPayload = JSON.parse(req.postData());
        } catch (e) {
          console.log('Mobile payload parse error');
        }
      }
    });

    await mobilePage.evaluateOnNewDocument(() => {
      sessionStorage.setItem('hasShownPromo', 'true');
    });

    await mobilePage.goto(`${URL}?_m_audit=${Date.now()}`, { waitUntil: 'networkidle2', timeout: 40000 });
    await delay(2000);

    // Check Mobile Horizontal Overflow
    const mobileOverflow = await mobilePage.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    auditReport.mobile.overflow = mobileOverflow;
    console.log(`Mobile Horizontal Overflow Bug: ${mobileOverflow ? 'YES (BUG DETECTED)' : 'NO (CLEAN & PERFECT)'}`);

    // Check Video Element status
    const videoPlaying = await mobilePage.evaluate(() => {
      const vid = document.querySelector('video');
      return vid ? !vid.paused : false;
    });
    console.log(`Mobile Video Playing: ${videoPlaying ? 'YES' : 'READY/MUTED'}`);

    // Scroll to Order Form
    await mobilePage.evaluate(() => {
      const el = document.getElementById('order-form-details');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await delay(1000);

    // Test Quantity adjustment (+1 to make 3 boxes)
    console.log('Testing mobile quantity button (+1)...');
    await mobilePage.evaluate(() => {
      const increaseBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === '+');
      if (increaseBtn) increaseBtn.click();
    });
    await delay(500);

    // Verify Gift Option Click and Preset
    console.log('Testing mobile Gift Option toggle and preset selection...');
    await mobilePage.evaluate(() => {
      const cb = document.getElementById('gift-option-checkbox');
      if (cb && cb.parentElement) cb.parentElement.click();
    });
    await delay(600);

    await mobilePage.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('শুভ জন্মদিন'));
      if (btn) btn.click();
    });
    await delay(600);

    // Fill form
    await mobilePage.type('#customer-name', 'তানভীর আহমেদ (মোবাইল অডিট)', { delay: 10 });
    await mobilePage.type('#customer-phone', '01715566778', { delay: 10 });
    await mobilePage.type('#customer-address', 'ফ্ল্যাট ৪এ, বাড়ি ৭, রোড ১১, গুলশান ২, ঢাকা', { delay: 10 });
    await mobilePage.type('#customer-note', 'অডিট টেস্ট নোট', { delay: 10 });

    // Mobile Screenshot before submit
    const mobileFormPath = path.join(ARTIFACT_DIR, 'mobile_audit_form.png');
    await mobilePage.screenshot({ path: mobileFormPath });
    console.log('Saved Mobile Audit Form screenshot to:', mobileFormPath);

    // Submit Mobile Order
    console.log('Submitting Mobile live test order...');
    await mobilePage.evaluate(() => {
      const btn = document.querySelector('button[type="submit"]');
      if (btn) btn.click();
    });
    await delay(4500);

    // Check Success Modal
    const mobileSuccessModal = await mobilePage.evaluate(() => {
      return !!document.querySelector('.fixed.inset-0.z-\\[100\\]');
    });
    auditReport.mobile.successPopup = mobileSuccessModal;
    console.log(`Mobile Success Popup Rendered: ${mobileSuccessModal ? 'YES' : 'NO'}`);

    const mobileSuccessPath = path.join(ARTIFACT_DIR, 'mobile_audit_success.png');
    await mobilePage.screenshot({ path: mobileSuccessPath });
    console.log('Saved Mobile Audit Success screenshot to:', mobileSuccessPath);

    await mobilePage.close();


    // ==========================================
    // 2. DESKTOP / PC A-TO-Z AUDIT & LIVE ORDER TEST
    // ==========================================
    console.log('\n--- STARTING DESKTOP / PC A-TO-Z AUDIT ---');
    const pcPage = await browser.newPage();
    await pcPage.setViewport({ width: 1280, height: 900 });

    pcPage.on('console', (msg) => {
      const type = msg.type();
      const text = msg.text();
      if (type === 'error') auditReport.desktop.errors.push(text);
      else if (type === 'warn' && !text.includes('FB Purchase')) auditReport.desktop.warnings.push(text);
    });

    pcPage.on('pageerror', (err) => {
      auditReport.desktop.errors.push(err.toString());
    });

    pcPage.on('request', (req) => {
      if (req.url().includes('/api/submit-order') && req.method() === 'POST') {
        try {
          auditReport.desktop.orderPayload = JSON.parse(req.postData());
        } catch (e) {
          console.log('Desktop payload parse error');
        }
      }
    });

    await pcPage.evaluateOnNewDocument(() => {
      sessionStorage.setItem('hasShownPromo', 'true');
    });

    await pcPage.goto(`${URL}?_pc_audit=${Date.now()}`, { waitUntil: 'networkidle2', timeout: 40000 });
    await delay(2000);

    // Check Desktop Horizontal Overflow
    const desktopOverflow = await pcPage.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    auditReport.desktop.overflow = desktopOverflow;
    console.log(`Desktop Horizontal Overflow Bug: ${desktopOverflow ? 'YES (BUG DETECTED)' : 'NO (CLEAN & PERFECT)'}`);

    // Test Quick Order Navbar Scroll
    console.log('Testing Desktop Quick Order Navbar button click & smooth scroll...');
    await pcPage.evaluate(() => {
      const navBtn = Array.from(document.querySelectorAll('a')).find(a => a.innerText && a.innerText.includes('Quick Order'));
      if (navBtn) navBtn.click();
    });
    await delay(1000);

    // Verify Gift Option Toggle and Preset
    console.log('Testing Desktop Gift Option toggle and preset selection...');
    await pcPage.evaluate(() => {
      const cb = document.getElementById('gift-option-checkbox');
      if (cb && cb.parentElement) cb.parentElement.click();
    });
    await delay(600);

    await pcPage.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('দ্রুত সুস্থ হয়ে উঠুন'));
      if (btn) btn.click();
    });
    await delay(600);

    // Fill form on Desktop
    await pcPage.type('#customer-name', 'মাহমুদুর রহমান (পিসি অডিট)', { delay: 10 });
    await pcPage.type('#customer-phone', '01712233445', { delay: 10 });
    await pcPage.type('#customer-address', 'বাড়ি ১২, রোড ৫, বনানী, ঢাকা', { delay: 10 });
    await pcPage.type('#customer-note', 'পিসি অডিট টেস্ট অর্ডার', { delay: 10 });

    // Desktop Screenshot before submit
    const pcFormPath = path.join(ARTIFACT_DIR, 'pc_audit_form.png');
    await pcPage.screenshot({ path: pcFormPath });
    console.log('Saved PC Audit Form screenshot to:', pcFormPath);

    // Submit Desktop Order
    console.log('Submitting Desktop live test order...');
    await pcPage.evaluate(() => {
      const btn = document.querySelector('button[type="submit"]');
      if (btn) btn.click();
    });
    await delay(4500);

    // Check Success Modal on Desktop
    const pcSuccessModal = await pcPage.evaluate(() => {
      return !!document.querySelector('.fixed.inset-0.z-\\[100\\]');
    });
    auditReport.desktop.successPopup = pcSuccessModal;
    console.log(`Desktop Success Popup Rendered: ${pcSuccessModal ? 'YES' : 'NO'}`);

    const pcSuccessPath = path.join(ARTIFACT_DIR, 'pc_audit_success.png');
    await pcPage.screenshot({ path: pcSuccessPath });
    console.log('Saved PC Audit Success screenshot to:', pcSuccessPath);

    await pcPage.close();

    console.log('\n==========================================');
    console.log('COMPREHENSIVE AUDIT REPORT SUMMARY:');
    console.log('Mobile Errors:', auditReport.mobile.errors.length === 0 ? 'None (0 errors)' : auditReport.mobile.errors);
    console.log('Mobile Payload:', JSON.stringify(auditReport.mobile.orderPayload, null, 2));
    console.log('Desktop Errors:', auditReport.desktop.errors.length === 0 ? 'None (0 errors)' : auditReport.desktop.errors);
    console.log('Desktop Payload:', JSON.stringify(auditReport.desktop.orderPayload, null, 2));
    console.log('==========================================');

  } catch (err) {
    console.error('Audit execution error:', err);
  } finally {
    await browser.close();
  }
}

runComprehensiveAudit();
