import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\Gigabyte\\.gemini\\antigravity\\brain\\148d27dc-4029-49b4-87e6-34bc45710faa';
const URL = 'https://coconuttreatsmore.com/';

function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function testSubmit() {
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

    await page.setViewport({ width: 1366, height: 850 });
    await page.goto(URL, { waitUntil: 'networkidle2' });
    await delay(1500);

    // Fill form
    await page.type('#customer-name', 'টেস্ট কাস্টমার (লেআউট চেক)');
    await page.type('#customer-phone', '01711998877');
    await page.type('#customer-address', 'রোড ১২, বাড়ি ৪৪, ফ্ল্যাট ৩বি, ধানমন্ডি, ঢাকা');
    await page.type('#customer-email', 'testcustomer@gmail.com');
    await page.type('#customer-note', 'অর্ডার ফর্মের নতুন পজিশন ভেরিফিকেশন টেস্ট');

    // Click gift option
    await page.evaluate(() => {
      const checkbox = document.getElementById('gift-option-checkbox');
      if (checkbox) checkbox.parentElement.parentElement.click();
    });
    await delay(500);

    // Enter custom wish
    await page.type('#gift-message-input', 'অনেক ভালোবাসা ও শুভকামনা! 🌸');
    await delay(500);

    // Submit order
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) {
      await submitBtn.click();
    }
    await delay(3500);

    const successPath = path.join(ARTIFACT_DIR, 'new_layout_live_order_submitted.png');
    await page.screenshot({ path: successPath });
    console.log("Success screenshot saved:", successPath);
  } finally {
    await browser.close();
  }
}

testSubmit().catch((e) => {
  console.error("Submit test failed:", e);
  process.exit(1);
});
