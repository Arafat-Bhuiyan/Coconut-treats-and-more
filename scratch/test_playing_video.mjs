import puppeteer from 'puppeteer-core';
import { spawn } from 'child_process';

async function testPlayingVideo() {
  const preview = spawn('cmd.exe', ['/c', 'npm.cmd', 'run', 'preview', '--', '--port', '4218'], {
    cwd: 'c:\\Users\\Gigabyte\\Documents\\website\\Coconut-treats-and-more',
    shell: true,
  });

  await new Promise(r => setTimeout(r, 3000));

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--autoplay-policy=no-user-gesture-required']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 1100 });
    await page.goto('http://localhost:4218/', { waitUntil: 'networkidle2' });
    
    // Play video explicitly
    await page.evaluate(() => {
      const v = document.querySelector('video');
      if (v) {
        v.muted = true;
        v.play();
      }
    });

    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: 'scratch/desktop_playing_video_verified.png' });
    console.log("Playing video captured successfully");
  } finally {
    await browser.close();
    preview.kill();
  }
}

testPlayingVideo();
