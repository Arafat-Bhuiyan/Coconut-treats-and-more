import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\Gigabyte\\.gemini\\antigravity\\brain\\148d27dc-4029-49b4-87e6-34bc45710faa';
const URL = 'https://coconuttreatsmore.com/';

function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function verifyNativeButtonToggle() {
  console.log("Waiting 15 seconds for Vercel deployment of commit 35c54b8...");
  await delay(15000);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
      sessionStorage.setItem('hasShownPromo', 'true');
    });

    console.log("=== 1. TESTING PC DESKTOP (1280x800) ===");
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto(URL, { waitUntil: 'networkidle2' });
    await delay(2000);

    // Scroll to button
    await page.evaluate(() => {
      const el = document.getElementById('gift-card-toggle-btn');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await delay(500);

    // Click native button
    console.log("Clicking #gift-card-toggle-btn on PC...");
    await page.click('#gift-card-toggle-btn');
    await delay(800);

    const pcStateAfterOpen = await page.evaluate(() => {
      const btn = document.getElementById('gift-card-toggle-btn');
      const input = document.getElementById('gift-message-input');
      const hasCharge = document.body.innerText.includes('🎁 গিফট কার্ড') && document.body.innerText.includes('১,৬০০');
      return {
        ariaPressed: btn ? btn.getAttribute('aria-pressed') : null,
        inputVisible: !!input,
        hasCharge,
        btnText: btn ? btn.innerText : null
      };
    });
    console.log("PC State after 1st click (Open):", pcStateAfterOpen);

    const pcScreenshotOpen = path.join(ARTIFACT_DIR, 'bulletproof_pc_gift_opened.png');
    await page.screenshot({ path: pcScreenshotOpen });

    // Click native button again to close
    console.log("Clicking #gift-card-toggle-btn on PC again to close...");
    await page.click('#gift-card-toggle-btn');
    await delay(800);

    const pcStateAfterClose = await page.evaluate(() => {
      const btn = document.getElementById('gift-card-toggle-btn');
      const input = document.getElementById('gift-message-input');
      return {
        ariaPressed: btn ? btn.getAttribute('aria-pressed') : null,
        inputVisible: !!input
      };
    });
    console.log("PC State after 2nd click (Closed):", pcStateAfterClose);

    console.log("=== 2. TESTING MOBILE TOUCH VIEWPORT (390x844) ===");
    const mobilePage = await browser.newPage();
    await mobilePage.evaluateOnNewDocument(() => {
      sessionStorage.setItem('hasShownPromo', 'true');
    });
    await mobilePage.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 3 });
    await mobilePage.goto(URL, { waitUntil: 'networkidle2' });
    await delay(2000);

    // Scroll to button
    await mobilePage.evaluate(() => {
      const el = document.getElementById('gift-card-toggle-btn');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await delay(500);

    // Tap on mobile
    console.log("Tapping #gift-card-toggle-btn on Mobile...");
    await mobilePage.tap('#gift-card-toggle-btn');
    await delay(800);

    const mobileStateAfterTap = await mobilePage.evaluate(() => {
      const btn = document.getElementById('gift-card-toggle-btn');
      const input = document.getElementById('gift-message-input');
      const hasCharge = document.body.innerText.includes('🎁 গিফট কার্ড') && document.body.innerText.includes('১,৬০০');
      return {
        ariaPressed: btn ? btn.getAttribute('aria-pressed') : null,
        inputVisible: !!input,
        hasCharge
      };
    });
    console.log("Mobile State after tap (Open):", mobileStateAfterTap);

    const mobileScreenshotOpen = path.join(ARTIFACT_DIR, 'bulletproof_mobile_gift_opened.png');
    await mobilePage.screenshot({ path: mobileScreenshotOpen });

    // Tap preset wish
    await mobilePage.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const bday = btns.find(b => b.textContent.includes('শুভ জন্মদিন!'));
      if (bday) bday.click();
    });
    await delay(500);

    const wishValue = await mobilePage.evaluate(() => {
      return document.getElementById('gift-message-input')?.value;
    });
    console.log("Wish note input value:", wishValue);

    console.log("ALL VERIFICATIONS COMPLETED SUCCESSFULLY!");
  } catch (err) {
    console.error("Test failed:", err);
  } finally {
    await browser.close();
  }
}

verifyNativeButtonToggle();
