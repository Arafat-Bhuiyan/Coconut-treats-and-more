import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'https://coconuttreatsmore.com/';

function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function testRealCoordinatesClick() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(URL, { waitUntil: 'networkidle2' });
  await delay(2000);

  // Scroll to checkout
  await page.evaluate(() => {
    const el = document.getElementById('gift-option-checkbox');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await delay(1000);

  // Checkbox bounding box
  const cb = await page.$('#gift-option-checkbox');
  const cbBox = await cb.boundingBox();
  console.log("Checkbox bounding box:", cbBox);

  // TEST A: Mouse click directly on checkbox center
  console.log("TEST A: Mouse click at X/Y of checkbox:", cbBox.x + cbBox.width / 2, cbBox.y + cbBox.height / 2);
  await page.mouse.click(cbBox.x + cbBox.width / 2, cbBox.y + cbBox.height / 2);
  await delay(500);

  let stateA = await page.evaluate(() => {
    const c = document.getElementById('gift-option-checkbox');
    const msg = document.getElementById('gift-message-input');
    return { checked: c?.checked, hasMsgInput: !!msg };
  });
  console.log("State after click A (on checkbox):", stateA);

  // Click again to turn off
  await page.mouse.click(cbBox.x + cbBox.width / 2, cbBox.y + cbBox.height / 2);
  await delay(500);

  // TEST B: Mouse click on the TITLE text
  const label = await page.$('label[for="gift-option-checkbox"]');
  const labelBox = await label.boundingBox();
  console.log("Label bounding box:", labelBox);
  
  // Click on title text (roughly 50px right of checkbox)
  console.log("TEST B: Mouse click on title text:", cbBox.x + 80, cbBox.y + cbBox.height / 2);
  await page.mouse.click(cbBox.x + 80, cbBox.y + cbBox.height / 2);
  await delay(500);

  let stateB = await page.evaluate(() => {
    const c = document.getElementById('gift-option-checkbox');
    const msg = document.getElementById('gift-message-input');
    return { checked: c?.checked, hasMsgInput: !!msg };
  });
  console.log("State after click B (on title):", stateB);

  // Click to turn off
  await page.mouse.click(cbBox.x + 80, cbBox.y + cbBox.height / 2);
  await delay(500);

  // TEST C: Mouse click on padding/background of the container
  const container = await page.evaluateHandle(() => {
    return document.getElementById('gift-option-checkbox').closest('.rounded-2xl');
  });
  const containerBox = await container.boundingBox();
  console.log("Container bounding box:", containerBox);

  // Click on the right padding of container (e.g. x + width - 20, y + 20)
  console.log("TEST C: Mouse click on right side padding of container:", containerBox.x + containerBox.width - 20, containerBox.y + 20);
  await page.mouse.click(containerBox.x + containerBox.width - 20, containerBox.y + 20);
  await delay(500);

  let stateC = await page.evaluate(() => {
    const c = document.getElementById('gift-option-checkbox');
    const msg = document.getElementById('gift-message-input');
    return { checked: c?.checked, hasMsgInput: !!msg };
  });
  console.log("State after click C (on container padding):", stateC);

  await browser.close();
}

testRealCoordinatesClick();
