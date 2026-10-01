import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

async function test() {
  const htmlPath = path.resolve('scratch/test_video.html');
  fs.writeFileSync(htmlPath, '<!DOCTYPE html><html><body><video id="vid" src="../public/hero-video.mp4" controls></video></body></html>');
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--allow-file-access-from-files']
  });
  const page = await browser.newPage();
  await page.goto('file:///' + htmlPath.replace(/\\/g, '/'));
  await new Promise(r => setTimeout(r, 2000));
  const res = await page.evaluate(() => {
    const v = document.getElementById('vid');
    return { videoWidth: v.videoWidth, videoHeight: v.videoHeight };
  });
  console.log('Video Dimensions:', JSON.stringify(res));
  await browser.close();
}
test();
