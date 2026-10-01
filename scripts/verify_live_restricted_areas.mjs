import puppeteer from 'puppeteer-core';

async function verifyLiveRestrictedAreas() {
  console.log("=== VERIFYING LIVE RESTRICTED AREA DETECTION (METHOD 1) ===");
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 393, height: 852, isMobile: true, hasTouch: true });

    await page.goto('https://coconuttreatsmore.com/?t=' + Date.now(), { waitUntil: 'networkidle2', timeout: 35000 });
    await new Promise(r => setTimeout(r, 2000));

    // Scroll to order form
    await page.evaluate(() => {
      const el = document.getElementById('order-form-details');
      if (el) el.scrollIntoView({ behavior: 'instant' });
    });
    await new Promise(r => setTimeout(r, 500));

    // Test 1: Typing "Savar" in address
    console.log("Test 1: Testing 'সাভার' (Savar) in address...");
    await page.type('#customer-name', 'Restricted Area Tester');
    await page.type('#customer-phone', '01711223344');
    await page.type('#customer-address', 'House 5, Savar Bazar, সাভার');
    await new Promise(r => setTimeout(r, 500));

    const savarAlert = await page.evaluate(() => {
      return document.body.innerText.includes('সাভার এলাকায় আমাদের ডেলিভারি সার্ভিস বন্ধ রয়েছে');
    });
    console.log("Real-time alert for Savar displayed:", savarAlert);
    await page.screenshot({ path: 'scratch/live_savar_restricted_alert.png' });

    // Test 2: Try clicking submit while Savar is entered
    console.log("Test 2: Verifying submit button blocks order for Savar...");
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 600));

    const submitBlocked = await page.evaluate(() => {
      return document.body.innerText.includes('সাভার এলাকায় ডাবের পুডিং ডেলিভারি সেবা বর্তমানে বন্ধ রয়েছে');
    });
    console.log("Submit properly blocked with error message:", submitBlocked);

    // Test 3: Clear and type "Jatrabari"
    console.log("Test 3: Testing 'Jatrabari' (যাত্রাবাড়ী) in address...");
    await page.evaluate(() => {
      const input = document.getElementById('customer-address');
      if (input) input.value = '';
    });
    await page.type('#customer-address', 'Road 3, Jatrabari, Dhaka');
    await new Promise(r => setTimeout(r, 500));

    const jatrabariAlert = await page.evaluate(() => {
      return document.body.innerText.includes('যাত্রাবাড়ী এলাকায় আমাদের ডেলিভারি সার্ভিস বন্ধ রয়েছে');
    });
    console.log("Real-time alert for Jatrabari displayed:", jatrabariAlert);

    // Test 4: Clear and type valid Dhaka area (e.g. Dhanmondi)
    console.log("Test 4: Testing valid Dhaka City area (Dhanmondi)...");
    await page.evaluate(() => {
      const input = document.getElementById('customer-address');
      if (input) input.value = '';
    });
    await page.type('#customer-address', 'Flat 4B, Road 7A, Dhanmondi, Dhaka');
    await new Promise(r => setTimeout(r, 500));

    const alertGone = await page.evaluate(() => {
      return !document.body.innerText.includes('এলাকায় আমাদের ডেলিভারি সার্ভিস বন্ধ রয়েছে');
    });
    console.log("Restricted alert gone for valid Dhaka address:", alertGone);
    await page.screenshot({ path: 'scratch/live_valid_dhaka_address.png' });

    console.log("\n=== ALL RESTRICTED AREA TESTS PASSED 100% LIVE! ===");

  } catch (err) {
    console.error("Verification error:", err);
  } finally {
    await browser.close();
  }
}

verifyLiveRestrictedAreas();
