/**
 * This script fixes React imports across the codebase
 * to avoid the "Identifier 'React' has already been declared" error
 */
const fs = require('fs');
const path = require('path');

function fixReactImports(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Check if the file has multiple React imports
    const importMatches = content.match(/import\s+(?:React|\*\s+as\s+React)\s+from\s+['"]react['"];?/g) || [];
    
    if (importMatches.length > 1) {
      // Keep only the first React import
      const firstImport = importMatches[0];
      importMatches.slice(1).forEach(duplicate => {
        content = content.replace(duplicate, '// Removed duplicate: ' + duplicate);
      });
      modified = true;
    }
    
    // Check if the file has a star import
    if (content.includes('import * as React from')) {
      // Replace with the standard import
      content = content.replace(
        /import \* as React from ['"]react['"];?/g, 
        'import React from "react";'
      );
      modified = true;
    }
    
    // For TypeScript/JSX files, ensure there's exactly one React import
    if ((filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) && 
        !content.includes('import React from')) {
      // Add React import at the top
      content = 'import React from "react";\n' + content;
      modified = true;
    }
    
    // Write back if modified
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`Fixed React imports in: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (err) {
    console.error(`Error processing file ${filePath}:`, err);
    return false;
  }
}

function processDirectory(dir) {
  let fixedFiles = 0;
  
  const processRecursively = (currentDir) => {
    const items = fs.readdirSync(currentDir);
    
    items.forEach(item => {
      const itemPath = path.join(currentDir, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory() && 
          item !== 'node_modules' && 
          item !== 'dist' && 
          item !== '.git') {
        // Process subdirectories recursively
        processRecursively(itemPath);
      } else if (stats.isFile() && 
                (itemPath.endsWith('.tsx') || 
                 itemPath.endsWith('.jsx') || 
                 itemPath.endsWith('.ts') || 
                 itemPath.endsWith('.js'))) {
        // Fix React imports in files
        if (fixReactImports(itemPath)) {
          fixedFiles++;
        }
      }
    });
  };
  
  processRecursively(dir);
  return fixedFiles;
}

console.log('Starting to fix React imports...');
const srcDir = path.join(__dirname, 'src');
const fixedFilesCount = processDirectory(srcDir);
console.log(`Fixed React imports in ${fixedFilesCount} files.`);
