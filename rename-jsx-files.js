/**
 * This script automatically renames JS files containing JSX to JSX files
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Function to check if a file contains JSX
function fileContainsJSX(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Look for common JSX patterns like <Component>, <div>, etc.
    const jsxPattern = /<[a-zA-Z][a-zA-Z0-9]*(\s+[a-zA-Z][a-zA-Z0-9]*=".*?")*\s*\/?>|<\/[a-zA-Z][a-zA-Z0-9]*>/;
    return jsxPattern.test(content) && content.includes('import React');
  } catch (err) {
    console.error(`Error reading file ${filePath}:`, err);
    return false;
  }
}

// Function to recursively find all JS files
function findJSFiles(dir) {
  let results = [];
  
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && file !== 'node_modules' && file !== 'dist' && file !== '.git') {
      // Recursively search directories
      results = results.concat(findJSFiles(filePath));
    } else if (
      stat.isFile() && 
      file.endsWith('.js') && 
      !file.endsWith('.jsx') && 
      !file.endsWith('.test.js') &&
      !file.endsWith('.config.js')
    ) {
      // Check if JS file (not already JSX) contains JSX
      if (fileContainsJSX(filePath)) {
        results.push(filePath);
      }
    }
  });
  
  return results;
}

// Find all JS files with JSX
console.log('Searching for JS files containing JSX...');
const srcDir = path.join(__dirname, 'src');
const jsxFiles = findJSFiles(srcDir);

if (jsxFiles.length === 0) {
  console.log('No JS files with JSX found.');
  process.exit(0);
}

console.log(`Found ${jsxFiles.length} JS files containing JSX.`);

// Rename files
jsxFiles.forEach(filePath => {
  const newPath = filePath.replace('.js', '.jsx');
  fs.renameSync(filePath, newPath);
  console.log(`Renamed: ${filePath} -> ${newPath}`);
});

console.log('All files renamed successfully.');
