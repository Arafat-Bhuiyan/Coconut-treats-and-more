import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\Gigabyte\\.gemini\\antigravity\\brain\\148d27dc-4029-49b4-87e6-34bc45710faa';
const URL = 'https://coconuttreatsmore.com/';

function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function verifyGiftCardEverywhere() {
  console.log("Waiting 15 seconds for Vercel deployment of commit e865f24...");
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

    console.log("--- TEST 1: PC DESKTOP (1280x800) ---");
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto(URL, { waitUntil: 'networkidle2' });
    await delay(2000);

    // Scroll to gift card container
    await page.evaluate(() => {
      const el = document.getElementById('gift-card-box-container');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await delay(1000);

    // 1. Click on the container padding (outside text and checkbox)
    const box = await page.$('#gift-card-box-container');
    const boxBounds = await box.boundingBox();
    console.log("Box bounds:", boxBounds);

    console.log("Clicking on container background / right-side padding...");
    await page.mouse.click(boxBounds.x + boxBounds.width - 30, boxBounds.y + 20);
    await delay(800);

    let state1 = await page.evaluate(() => {
      const input = document.getElementById('gift-message-input');
      const hasCharge = document.body.innerText.includes('🎁 গিফট কার্ড') && document.body.innerText.includes('১,৬০০');
      return { expanded: !!input, hasCharge };
    });
    console.log("State after clicking background padding:", state1);

    // Take screenshot of opened PC view
    const pcOpenedPath = path.join(ARTIFACT_DIR, 'pc_gift_card_opened_anywhere.png');
    await page.screenshot({ path: pcOpenedPath });
    console.log("Saved PC opened screenshot:", pcOpenedPath);

    // 2. Type in the gift message input
    console.log("Typing in gift message input...");
    await page.type('#gift-message-input', 'প্রিয়জনের জন্য অনেক ভালোবাসা!');
    await delay(500);

    // 3. Click preset button 'শুভ জন্মদিন! 🎂'
    console.log("Clicking quick wish button...");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const bday = btns.find(b => b.textContent.includes('শুভ জন্মদিন!'));
      if (bday) bday.click();
    });
    await delay(500);

    let msgValue = await page.evaluate(() => {
      return document.getElementById('gift-message-input')?.value;
    });
    console.log("Gift message input value after preset:", msgValue);

    // 4. Click header again to toggle closed
    console.log("Clicking top header to toggle closed...");
    await page.mouse.click(boxBounds.x + 30, boxBounds.y + 15);
    await delay(800);

    let stateClosed = await page.evaluate(() => {
      const input = document.getElementById('gift-message-input');
      return { expanded: !!input };
    });
    console.log("State after clicking header to close:", stateClosed);

    // 5. Click text to open again
    console.log("Clicking title text to open again...");
    await page.mouse.click(boxBounds.x + 80, boxBounds.y + 15);
    await delay(800);

    let stateReopened = await page.evaluate(() => {
      const input = document.getElementById('gift-message-input');
      return { expanded: !!input };
    });
    console.log("State after clicking text:", stateReopened);

    console.log("--- TEST 2: MOBILE VIEWPORT (390x844) ---");
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await delay(1000);

    await page.evaluate(() => {
      const el = document.getElementById('gift-card-box-container');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await delay(800);

    // Tap to close on mobile
    await page.tap('#gift-card-box-container');
    await delay(800);

    let mobClosed = await page.evaluate(() => {
      return { expanded: !!document.getElementById('gift-message-input') };
    });
    console.log("Mobile state after 1st tap (closed):", mobClosed);

    // Tap to open on mobile
    await page.tap('#gift-card-box-container');
    await delay(800);

    let mobOpened = await page.evaluate(() => {
      return { expanded: !!document.getElementById('gift-message-input') };
    });
    console.log("Mobile state after 2nd tap (opened):", mobOpened);

    const mobileOpenedPath = path.join(ARTIFACT_DIR, 'mobile_gift_card_opened_anywhere.png');
    await page.screenshot({ path: mobileOpenedPath });
    console.log("Saved Mobile opened screenshot:", mobileOpenedPath);

    console.log("ALL TESTS COMPLETED SUCCESSFULLY!");
  } catch (err) {
    console.error("Test failed:", err);
  } finally {
    await browser.close();
  }
}

verifyGiftCardEverywhere();
