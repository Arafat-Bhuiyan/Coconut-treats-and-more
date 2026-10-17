import puppeteer from 'puppeteer-core';

async function testOrder() {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 393, height: 852, isMobile: true });

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.toString()));

  console.log('Navigating to live site...');
  await page.goto('https://coconuttreatsmore.com/?t=' + Date.now(), { waitUntil: 'networkidle2', timeout: 35000 });

  console.log('Filling form inputs...');
  await page.type('#customer-name', 'সরাসরি ব্রাউজার টেস্ট অর্ডার');
  await page.type('#customer-phone', '01719998822');
  await page.type('#customer-address', 'ফ্ল্যাট ৪বি, বাড়ি ১৫, ধানমন্ডি, ঢাকা');
  await page.type('#customer-note', 'Browser Live Verification');

  console.log('Submitting order form...');
  await page.evaluate(() => {
    const btn = document.querySelector('button[type="submit"]');
    if (btn) btn.click();
  });

  await new Promise(r => setTimeout(r, 4000));

  const successShown = await page.evaluate(() => {
    return document.body.innerText.includes('আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে') ||
           document.body.innerText.includes('Order Confirmed');
  });

  console.log('Order Success Status:', successShown);
  console.log('Console Errors:', errors);

  await browser.close();
}

testOrder().catch(console.error);
