/**
 * This script fixes import paths after renaming .js files to .jsx
 */
const fs = require('fs');
const path = require('path');

// Map of files that have been renamed from .js to .jsx
const renamedFiles = new Map();

function scanRenamedFiles(dir) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  items.forEach(item => {
    if (item.isDirectory() && item.name !== 'node_modules' && item.name !== 'dist' && item.name !== '.git') {
      // Process subdirectory
      scanRenamedFiles(path.join(dir, item.name));
    } else if (item.isFile() && item.name.endsWith('.jsx')) {
      // Check if there's evidence this was renamed from .js
      const jsPath = path.join(dir, item.name.replace('.jsx', '.js'));
      const jsxPath = path.join(dir, item.name);
      
      // If the .js version doesn't exist, assume it was renamed
      if (!fs.existsSync(jsPath)) {
        const relativePath = path.relative(process.cwd(), jsxPath);
        const oldRelativePath = relativePath.replace('.jsx', '.js');
        renamedFiles.set(oldRelativePath, relativePath);
      }
    }
  });
}

function fixImportPaths(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;
    
    renamedFiles.forEach((newPath, oldPath) => {
      // Handle various import patterns
      const patterns = [
        // import X from './path/file.js'
        new RegExp(`import\\s+[^'"]+'${escapeRegExp(oldPath)}'`, 'g'),
        new RegExp(`import\\s+[^"]+\\"${escapeRegExp(oldPath)}\\"`, 'g'),
        // import { X } from './path/file.js'
        new RegExp(`import\\s+{[^}]+}\\s+from\\s+'${escapeRegExp(oldPath)}'`, 'g'),
        new RegExp(`import\\s+{[^}]+}\\s+from\\s+\\"${escapeRegExp(oldPath)}\\"`, 'g'),
        // import('./path/file.js')
        new RegExp(`import\\(['"]${escapeRegExp(oldPath)}['"]\\)`, 'g'),
        // require('./path/file.js')
        new RegExp(`require\\(['"]${escapeRegExp(oldPath)}['"]\\)`, 'g')
      ];
      
      for (const pattern of patterns) {
        const match = content.match(pattern);
        if (match) {
          // Get the old import string and create the new one
          const oldImportStr = match[0];
          const newImportStr = oldImportStr.replace(oldPath, newPath);
          
          // Replace in content
          content = content.replace(oldImportStr, newImportStr);
          updated = true;
        }
      }
    });
    
    // Also fix relative paths using the directory name
    for (const [oldPath, newPath] of renamedFiles.entries()) {
      // Get just the directory and filename
      const oldDirAndFile = path.dirname(oldPath) + '/' + path.basename(oldPath);
      const newDirAndFile = path.dirname(newPath) + '/' + path.basename(newPath);
      
      // Look for imports that use the extension directly
      const importRegex = new RegExp(`import[^;]+['"]([^'"]*${escapeRegExp(oldDirAndFile)})['"]`, 'g');
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        const fullImport = match[0];
        const importPath = match[1];
        const newImport = fullImport.replace(importPath, importPath.replace(oldDirAndFile, newDirAndFile));
        content = content.replace(fullImport, newImport);
        updated = true;
      }
    }
    
    if (updated) {
      // Write the updated content back to the file
      fs.writeFileSync(filePath, content);
      console.log(`Updated imports in: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (err) {
    console.error(`Error processing file ${filePath}:`, err);
    return false;
  }
}

// Helper to escape special regex characters
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function processAllFiles(dir) {
  let fixedFiles = 0;
  
  const processRecursively = (currentDir) => {
    const items = fs.readdirSync(currentDir, { withFileTypes: true });
    
    items.forEach(item => {
      const itemPath = path.join(currentDir, item.name);
      
      if (item.isDirectory() && 
          item.name !== 'node_modules' && 
          item.name !== 'dist' && 
          item.name !== '.git') {
        // Process subdirectories recursively
        processRecursively(itemPath);
      } else if (item.isFile() && 
                (itemPath.endsWith('.ts') || 
                 itemPath.endsWith('.tsx') || 
                 itemPath.endsWith('.js') || 
                 itemPath.endsWith('.jsx'))) {
        // Fix import paths in files
        if (fixImportPaths(itemPath)) {
          fixedFiles++;
        }
      }
    });
  };
  
  processRecursively(dir);
  return fixedFiles;
}

console.log('Scanning for renamed files...');
scanRenamedFiles(path.join(__dirname, 'src'));
console.log(`Found ${renamedFiles.size} renamed files.`);

console.log('Fixing import paths...');
const fixedFilesCount = processAllFiles(path.join(__dirname, 'src'));
console.log(`Fixed imports in ${fixedFilesCount} files.`);
