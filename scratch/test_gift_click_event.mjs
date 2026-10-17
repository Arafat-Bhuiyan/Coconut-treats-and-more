import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'https://coconuttreatsmore.com/';

async function testClick() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  await page.goto(URL, { waitUntil: 'networkidle2' });

  const result = await page.evaluate(async () => {
    const cb = document.getElementById('gift-option-checkbox');
    const label = cb.closest('label');
    const logs = [];

    cb.addEventListener('click', (e) => logs.push(`cb click, checked=${cb.checked}`));
    cb.addEventListener('change', (e) => logs.push(`cb change, checked=${cb.checked}`));
    label.addEventListener('click', (e) => logs.push(`label click, target=${e.target.tagName}`));

    // Simulate real user click on checkbox
    cb.click();
    const afterCbClick = cb.checked;

    // Simulate real user click on label
    label.click();
    const afterLabelClick = cb.checked;

    return { logs, afterCbClick, afterLabelClick };
  });

  console.log("Result:", result);
  await browser.close();
}

testClick();
