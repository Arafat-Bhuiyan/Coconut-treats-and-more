const fs = require('fs');
const path = require('path');

async function convertToWebP() {
  try {
    const sharp = require('sharp');
    const inputPath = path.join(__dirname, 'src/assets/images/coconuts-treats-more-hero.jpeg');
    const outputPath = path.join(__dirname, 'src/assets/images/coconuts-treats-more-hero.webp');
    
    await sharp(inputPath)
      .resize(1200, null, { withoutEnlargement: true }) // cap width at 1200px
      .webp({ quality: 75, effort: 6 })
      .toFile(outputPath);
    
    const inputSize = fs.statSync(inputPath).size;
    const outputSize = fs.statSync(outputPath).size;
    console.log('SUCCESS');
    console.log('Input: ' + Math.round(inputSize/1024) + 'KB');
    console.log('Output: ' + Math.round(outputSize/1024) + 'KB');
    console.log('Saved: ' + Math.round((1 - outputSize/inputSize)*100) + '%');
  } catch(e) {
    console.log('ERROR: ' + e.message);
  }
}

convertToWebP();
