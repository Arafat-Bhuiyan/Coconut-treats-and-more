import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

async function testBundleDesigns() {
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      body { font-family: system-ui, -apple-system, sans-serif; }
    </style>
  </head>
  <body class="bg-[#F6F8F5] p-4 text-[#1F291E]">
    <div class="max-w-md mx-auto space-y-3">
      <div class="flex items-center justify-between pb-1">
        <span class="text-xs font-black uppercase tracking-wider text-[#4A6741] flex items-center gap-1.5">
          <span>🏷️</span> প্যাকেজ বেছে নিন (SELECT BUNDLE):
        </span>
        <span class="text-xs font-black text-[#4A6741] bg-white px-2.5 py-0.5 rounded-full border border-[#4A6741]/25 shadow-xs">
          🚚 Delivery: ৳100
        </span>
      </div>

      <!-- 1 BOX -->
      <div class="border-2 border-gray-200 bg-white rounded-2xl p-3 sm:p-3.5 flex items-center justify-between cursor-pointer shadow-xs hover:border-[#4A6741]/60 transition-all select-none">
        <div class="flex items-center gap-3">
          <span class="w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center flex-shrink-0"></span>
          <div>
            <div class="flex items-center gap-1.5">
              <span class="font-black text-sm text-[#1F291E]">১ বক্স (৬ কাপ)</span>
              <span class="text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">1 Box</span>
            </div>
            <span class="text-[11px] text-gray-500 font-bold block mt-0.5">+ ৳১০০ ডেলিভারি চার্জ</span>
          </div>
        </div>
        <div class="text-right">
          <span class="text-lg font-black text-[#1F291E] leading-none">৳৭৫০</span>
        </div>
      </div>

      <!-- 2 BOXES (MOST POPULAR) -->
      <div class="border-2 border-[#4A6741] bg-emerald-50/90 rounded-2xl p-3 sm:p-3.5 flex items-center justify-between cursor-pointer shadow-md ring-2 ring-[#4A6741]/20 relative select-none mt-3.5 transition-all">
        <span class="absolute -top-2.5 right-3 bg-[#4A6741] text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow">
          🔥 MOST POPULAR • ১০০ টাকা ছাড়
        </span>
        <div class="flex items-center gap-3">
          <span class="w-5 h-5 rounded-full border-2 border-[#4A6741] bg-[#4A6741] flex items-center justify-center flex-shrink-0">
            <span class="w-2 h-2 rounded-full bg-white"></span>
          </span>
          <div>
            <div class="flex items-center gap-1.5">
              <span class="font-black text-sm text-[#1F291E]">২ বক্স (১২ কাপ)</span>
              <span class="text-[10px] font-black text-[#4A6741] bg-white px-2 py-0.5 rounded-md border border-[#4A6741]/30">৳৭০০/বক্স</span>
            </div>
            <span class="text-[11px] text-[#4A6741] font-bold block mt-0.5">+ ৳১০০ ডেলিভারি চার্জ</span>
          </div>
        </div>
        <div class="text-right">
          <span class="text-xs text-gray-400 line-through block font-bold leading-none mb-0.5">৳১,৫০০</span>
          <span class="text-xl font-black text-[#4A6741] leading-none">৳১,৪০০</span>
        </div>
      </div>

      <!-- 5 BOXES (BEST VALUE / FREE DELIVERY) -->
      <div class="border-2 border-gray-200 hover:border-[#4A6741]/60 bg-white rounded-2xl p-3 sm:p-3.5 flex items-center justify-between cursor-pointer shadow-xs relative select-none mt-3.5 transition-all">
        <span class="absolute -top-2.5 right-3 bg-emerald-700 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow">
          🎉 BEST VALUE • ফ্রি ডেলিভারি
        </span>
        <div class="flex items-center gap-3">
          <span class="w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center flex-shrink-0"></span>
          <div>
            <div class="flex items-center gap-1.5">
              <span class="font-black text-sm text-[#1F291E]">৫ বক্স (৩০ কাপ)</span>
              <span class="text-[10px] font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-300">৳৬৮০/বক্স</span>
            </div>
            <span class="text-[11px] font-black text-emerald-700 block mt-0.5">🚚 ফ্রি ডেলিভারি (৳০)</span>
          </div>
        </div>
        <div class="text-right">
          <span class="text-xs text-gray-400 line-through block font-bold leading-none mb-0.5">৳৩,৭৫০</span>
          <span class="text-xl font-black text-[#1F291E] leading-none">৳৩,৪০০</span>
        </div>
      </div>

      <!-- CUSTOM QUANTITY ROW -->
      <div class="border border-[#4A6741]/20 bg-white/90 rounded-2xl p-2.5 sm:p-3 flex items-center justify-between shadow-xs">
        <div>
          <span class="text-xs font-black text-[#1F291E] block">কাস্টম বক্স (Custom Quantity):</span>
          <span class="text-[10px] text-gray-500 font-semibold block">৫ বা তার বেশি বক্সে ফ্রি ডেলিভারি</span>
        </div>
        <div class="flex items-center gap-1.5 bg-[#F4F7F2] border border-gray-300 rounded-xl p-1">
          <button class="w-8 h-8 rounded-lg bg-white border border-gray-300 text-gray-700 font-black flex items-center justify-center text-lg active:scale-90 shadow-xs">-</button>
          <span class="w-14 text-center font-black text-xs text-[#1F291E]">2 Boxes</span>
          <button class="w-8 h-8 rounded-lg bg-[#4A6741] text-white font-black flex items-center justify-center text-lg active:scale-90 shadow-xs">+</button>
        </div>
      </div>

    </div>
  </body>
  </html>
  `;
  fs.writeFileSync('scratch/test_bundle_designs.html', html);

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--allow-file-access-from-files']
  });
  
  // Mobile test screenshot
  const page = await browser.newPage();
  await page.setViewport({ width: 393, height: 550 });
  await page.goto('file:///' + path.resolve('scratch/test_bundle_designs.html').replace(/\\/g, '/'));
  await page.screenshot({ path: 'scratch/mobile_bundle_preview.png' });

  // Desktop test screenshot
  await page.setViewport({ width: 600, height: 550 });
  await page.screenshot({ path: 'scratch/desktop_bundle_preview.png' });

  await browser.close();
  console.log("Mockups generated successfully.");
}
testBundleDesigns();
