const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Source logo image path
const logoPath = path.join(__dirname, '../../public/Doctorlogo.png');

// Output directory
const outputDir = path.join(__dirname, '../../public/splash');

// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Background color for splash screens
const backgroundColor = '#ffffff'; // White background

// iOS device sizes for splash screens
const splashScreens = [
  { width: 1125, height: 2436, name: 'apple-splash-1125x2436.png' }, // iPhone X/XS
  { width: 828, height: 1792, name: 'apple-splash-828x1792.png' },   // iPhone XR
  { width: 1242, height: 2688, name: 'apple-splash-1242x2688.png' }, // iPhone XS Max
  { width: 750, height: 1334, name: 'apple-splash-750x1334.png' },   // iPhone 8, 7, 6s, 6
  { width: 1242, height: 2208, name: 'apple-splash-1242x2208.png' }, // iPhone 8 Plus, 7 Plus, 6s Plus, 6 Plus
  { width: 640, height: 1136, name: 'apple-splash-640x1136.png' },   // iPhone SE, 5S
  { width: 1536, height: 2048, name: 'apple-splash-1536x2048.png' }, // iPad Mini, Air (portrait)
  { width: 2048, height: 1536, name: 'apple-splash-2048x1536.png' }, // iPad Mini, Air (landscape)
  { width: 1668, height: 2224, name: 'apple-splash-1668x2224.png' }, // iPad Pro 10.5" (portrait)
  { width: 2224, height: 1668, name: 'apple-splash-2224x1668.png' }, // iPad Pro 10.5" (landscape)
  { width: 2048, height: 2732, name: 'apple-splash-2048x2732.png' }, // iPad Pro 12.9" (portrait)
  { width: 2732, height: 2048, name: 'apple-splash-2732x2048.png' }, // iPad Pro 12.9" (landscape)
];

async function generateSplashScreens() {
  try {
    // Check if logo file exists
    if (!fs.existsSync(logoPath)) {
      console.error(`Logo file not found at ${logoPath}. Using a fallback method.`);
      
      // Generate a simple placeholder as logo
      await createPlaceholderLogo();
    }

    // Read the logo file
    const logoBuffer = await sharp(logoPath).toBuffer();
    
    // Calculate the logo size (50% of the shortest dimension or max 512px)
    const logoMetadata = await sharp(logoBuffer).metadata();
    
    // Process each splash screen size
    for (const screen of splashScreens) {
      const smallestDimension = Math.min(screen.width, screen.height);
      const logoSize = Math.min(Math.round(smallestDimension * 0.5), 512);
      
      // Resize the logo
      const resizedLogo = await sharp(logoBuffer)
        .resize(logoSize, logoSize, { 
          fit: 'contain', 
          background: { r: 255, g: 255, b: 255, alpha: 0 } 
        })
        .toBuffer();
      
      // Create a blank canvas with the background color
      const splashImage = await sharp({
        create: {
          width: screen.width,
          height: screen.height,
          channels: 4,
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        }
      }).toBuffer();
      
      // Calculate the center position
      const left = Math.floor((screen.width - logoSize) / 2);
      const top = Math.floor((screen.height - logoSize) / 2);
      
      // Composite the logo onto the center of the background
      await sharp(splashImage)
        .composite([
          {
            input: resizedLogo,
            top: top,
            left: left
          }
        ])
        .png()
        .toFile(path.join(outputDir, screen.name));
      
      console.log(`Generated: ${screen.name} (${screen.width}x${screen.height})`);
    }
    
    console.log('All splash screens generated successfully!');
  } catch (error) {
    console.error('Error generating splash screens:', error);
  }
}

// Create a placeholder logo if the original logo isn't found
async function createPlaceholderLogo() {
  try {
    const placeholderLogo = await sharp({
      create: {
        width: 512,
        height: 512,
        channels: 4,
        background: { r: 0, g: 102, b: 204, alpha: 1 } // #0066cc
      }
    })
    .composite([
      {
        input: Buffer.from(
          `<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
            <text x="50%" y="50%" font-family="Arial" font-size="72" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">Doctor.mx</text>
          </svg>`
        ),
        top: 0,
        left: 0
      }
    ])
    .toBuffer();
    
    // Save the placeholder logo
    await sharp(placeholderLogo)
      .toFile(logoPath);
    
    console.log('Created placeholder logo');
  } catch (error) {
    console.error('Error creating placeholder logo:', error);
  }
}

generateSplashScreens();
