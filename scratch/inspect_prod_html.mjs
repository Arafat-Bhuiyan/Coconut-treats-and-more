import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'https://coconuttreatsmore.com/';

async function inspectProductionCode() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  await page.goto(URL, { waitUntil: 'networkidle2' });

  const html = await page.evaluate(() => {
    const el = document.getElementById('gift-card-box-container');
    return el ? el.outerHTML : 'NOT FOUND';
  });

  console.log("Production HTML of gift card container:");
  console.log(html);

  await browser.close();
}

inspectProductionCode();
