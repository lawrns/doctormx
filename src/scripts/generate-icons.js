const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Source image path (high resolution image to use as source)
const sourceImage = path.join(__dirname, '../../public/Doctorlogo.png');

// Output directory
const outputDir = path.join(__dirname, '../../public/icons');

// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Icon sizes needed for PWA
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Generate icons for each size
async function generateIcons() {
  try {
    for (const size of iconSizes) {
      const outputFile = path.join(outputDir, `icon-${size}x${size}.png`);
      await sharp(sourceImage)
        .resize(size, size)
        .png()
        .toFile(outputFile);
      console.log(`Generated: ${outputFile}`);
    }

    // Also generate a badge for notifications
    await sharp(sourceImage)
      .resize(96, 96)
      .png()
      .toFile(path.join(outputDir, 'badge-96x96.png'));
    
    // Generate shortcut icons for symptoms and search
    // If you have specific icons for these, replace these paths with your actual icon paths
    await sharp(sourceImage)
      .resize(192, 192)
      .png()
      .toFile(path.join(outputDir, 'symptoms.png'));
    
    await sharp(sourceImage)
      .resize(192, 192)
      .png()
      .toFile(path.join(outputDir, 'search.png'));
    
    console.log('All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons();
