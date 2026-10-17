import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\Gigabyte\\.gemini\\antigravity\\brain\\148d27dc-4029-49b4-87e6-34bc45710faa';
const URL = 'https://coconuttreatsmore.com/';

async function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function verifyUpdates() {
  console.log('Waiting 28 seconds for Vercel deployment of commit c774664...');
  await delay(28000);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 393, height: 852, isMobile: true, hasTouch: true });

    await page.evaluateOnNewDocument(() => {
      sessionStorage.setItem('hasShownPromo', 'true');
    });

    console.log('Loading live mobile site...');
    await page.goto(`${URL}?_bold=${Date.now()}`, { waitUntil: 'networkidle2', timeout: 40000 });
    await delay(2000);

    // Scroll to order form
    await page.evaluate(() => {
      const el = document.getElementById('customer-email');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await delay(1000);

    const boldLabelsPath = path.join(ARTIFACT_DIR, 'bold_email_note_labels.png');
    await page.screenshot({ path: boldLabelsPath });
    console.log('Saved bold labels screenshot:', boldLabelsPath);

    await page.close();
  } catch (err) {
    console.error('Test error:', err);
  } finally {
    await browser.close();
  }
}

verifyUpdates();
