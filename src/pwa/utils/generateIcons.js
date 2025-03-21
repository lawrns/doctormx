const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Array of icon generation commands
const commands = [
  'npm run generate-icons',
  'npm run generate-splash-screens'
];

// Check if we have the Doctorlogo.png file
const logoPath = path.join(__dirname, '../../../public/Doctorlogo.png');
if (!fs.existsSync(logoPath)) {
  console.log('⚠️ Logo file not found at', logoPath);
  console.log('Creating a placeholder logo...');
  
  // Create the public directory if it doesn't exist
  const publicDir = path.join(__dirname, '../../../public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  // Copy the placeholder logo
  const placeholderPath = path.join(__dirname, '../assets/placeholder-logo.png');
  if (fs.existsSync(placeholderPath)) {
    fs.copyFileSync(placeholderPath, logoPath);
    console.log('✅ Placeholder logo created');
  } else {
    console.error('❌ Placeholder logo not found at', placeholderPath);
    process.exit(1);
  }
}

// Execute each command
commands.forEach(command => {
  try {
    console.log(`🔄 Executing: ${command}`);
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ Command completed successfully: ${command}`);
  } catch (error) {
    console.error(`❌ Error executing command: ${command}`);
    console.error(error.message);
  }
});

console.log('✅ PWA icons generation completed');
