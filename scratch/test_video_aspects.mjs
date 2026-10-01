import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

async function testVideoAspects() {
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="bg-gray-100 p-8">
    <div class="grid grid-cols-3 gap-6 max-w-6xl mx-auto">
      <!-- Option A: aspect-[4/5] object-contain bg-black/90 -->
      <div class="bg-white p-4 rounded-3xl shadow">
        <h3 class="font-bold text-sm mb-2">A: aspect-[4/5] object-contain (bg-emerald-950/5)</h3>
        <div class="w-full aspect-[4/5] rounded-2xl overflow-hidden bg-[#2D4526] flex items-center justify-center">
          <video src="../public/hero-video.mp4" class="w-full h-full object-contain" autoplay loop muted></video>
        </div>
      </div>

      <!-- Option B: aspect-[4/5] object-cover -->
      <div class="bg-white p-4 rounded-3xl shadow">
        <h3 class="font-bold text-sm mb-2">B: aspect-[4/5] object-cover</h3>
        <div class="w-full aspect-[4/5] rounded-2xl overflow-hidden bg-black/5 flex items-center justify-center">
          <video src="../public/hero-video.mp4" class="w-full h-full object-cover" autoplay loop muted></video>
        </div>
      </div>

      <!-- Option C: aspect-[9/16] max-h-[460px] mx-auto -->
      <div class="bg-white p-4 rounded-3xl shadow">
        <h3 class="font-bold text-sm mb-2">C: aspect-[9/16] max-h-[460px] mx-auto</h3>
        <div class="w-full max-w-[280px] aspect-[9/16] mx-auto rounded-2xl overflow-hidden bg-black/5 flex items-center justify-center shadow-md">
          <video src="../public/hero-video.mp4" class="w-full h-full object-cover" autoplay loop muted></video>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;
  fs.writeFileSync('scratch/test_video_aspects.html', html);

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--allow-file-access-from-files']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });
  await page.goto('file:///' + path.resolve('scratch/test_video_aspects.html').replace(/\\/g, '/'));
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'scratch/video_aspect_options.png' });
  await browser.close();
}
testVideoAspects();
