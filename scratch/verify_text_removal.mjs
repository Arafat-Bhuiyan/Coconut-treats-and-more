import puppeteer from 'puppeteer-core';

async function verifyRemoval() {
  console.log("Verifying removal of static delivery area text line on live site...");
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

    // Scroll to address input
    await page.evaluate(() => {
      const el = document.getElementById('customer-address');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await new Promise(r => setTimeout(r, 800));

    await page.screenshot({ path: 'scratch/live_static_text_removed.png' });
    console.log("Screenshot saved.");

    const hasStaticText = await page.evaluate(() => {
      return document.body.innerText.includes('সাভার, আশুলিয়া, কেরানীগঞ্জ, নারায়ণগঞ্জ, মুন্সীগঞ্জ ও যাত্রাবাড়ী বাদে');
    });
    console.log("Static text still present when address is empty?:", hasStaticText);

  } catch (err) {
    console.error("Verification error:", err);
  } finally {
    await browser.close();
  }
}

verifyRemoval();
