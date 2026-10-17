import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\Gigabyte\\.gemini\\antigravity\\brain\\148d27dc-4029-49b4-87e6-34bc45710faa';
const URL = 'https://coconuttreatsmore.com/';

function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function testGiftCardClickability() {
  console.log("Waiting 15 seconds for Vercel deployment of commit b840f35...");
  await delay(15000);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
      sessionStorage.setItem('hasShownPromo', 'true');
    });

    console.log("Testing on Mobile viewport (390x844)...");
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.goto(URL, { waitUntil: 'networkidle2' });
    await delay(2000);

    // Scroll to gift card
    await page.evaluate(() => {
      const el = document.getElementById('gift-option-checkbox');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await delay(1000);

    // TEST 1: Direct Click on the Checkbox Element
    console.log("TEST 1: Direct click on checkbox element #gift-option-checkbox...");
    const checkbox = await page.$('#gift-option-checkbox');
    await checkbox.click();
    await delay(800);

    const isChecked1 = await page.evaluate(() => {
      const cb = document.getElementById('gift-option-checkbox');
      const input = document.getElementById('gift-message-input');
      const hasSummaryCharge = document.body.innerText.includes('🎁 গিফট কার্ড') || document.body.innerText.includes('১,৬০০');
      return { checked: cb?.checked, inputVisible: !!input, hasSummaryCharge };
    });
    console.log("Result after direct checkbox click:", isChecked1);

    const screenshotChecked = path.join(ARTIFACT_DIR, 'gift_card_direct_checkbox_clicked.png');
    await page.screenshot({ path: screenshotChecked });
    console.log("Saved screenshot:", screenshotChecked);

    // TEST 2: Direct Click on the Label Text to toggle OFF
    console.log("TEST 2: Direct click on label text to toggle OFF...");
    await page.evaluate(() => {
      const label = document.querySelector('label[for="gift-option-checkbox"]');
      if (label) label.click();
    });
    await delay(800);

    const isChecked2 = await page.evaluate(() => {
      const cb = document.getElementById('gift-option-checkbox');
      const input = document.getElementById('gift-message-input');
      return { checked: cb?.checked, inputVisible: !!input };
    });
    console.log("Result after label click (toggled off):", isChecked2);

    // TEST 3: Click on Title to toggle ON again
    console.log("TEST 3: Direct click on Title to toggle ON again...");
    await page.evaluate(() => {
      const title = Array.from(document.querySelectorAll('span')).find(s => s.innerText.includes('প্রিয়জনকে গিফট কার্ড পাঠাতে চান'));
      if (title) title.click();
    });
    await delay(800);

    const isChecked3 = await page.evaluate(() => {
      const cb = document.getElementById('gift-option-checkbox');
      const input = document.getElementById('gift-message-input');
      return { checked: cb?.checked, inputVisible: !!input };
    });
    console.log("Result after title text click (toggled on):", isChecked3);

    // TEST 4: Click on Preset Wish Button
    console.log("TEST 4: Clicking preset wish 'শুভ জন্মদিন! 🎂'...");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const bday = btns.find(b => b.innerText.includes('শুভ জন্মদিন'));
      if (bday) bday.click();
    });
    await delay(500);

    const giftMessageVal = await page.evaluate(() => {
      const input = document.getElementById('gift-message-input');
      return input ? input.value : '';
    });
    console.log("Gift Message Value after preset click:", giftMessageVal);

    const screenshotPreset = path.join(ARTIFACT_DIR, 'gift_card_preset_selected.png');
    await page.screenshot({ path: screenshotPreset });
    console.log("Saved preset screenshot:", screenshotPreset);

    // Final assertion
    if (isChecked1.checked && isChecked1.inputVisible && !isChecked2.checked && isChecked3.checked && giftMessageVal.includes('শুভ জন্মদিন')) {
      console.log("\n>>> ALL GIFT CARD CLICKABILITY TESTS PASSED 100% SUCCESSFULLY! <<<");
    } else {
      throw new Error("Gift card clickability test failed!");
    }

  } finally {
    await browser.close();
  }
}

testGiftCardClickability().catch((e) => {
  console.error("Test error:", e);
  process.exit(1);
});
