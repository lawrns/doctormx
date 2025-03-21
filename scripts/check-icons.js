/**
 * Script to check for missing Lucide icon imports in React components
 * Usage: node scripts/check-icons.js [--fix]
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

// Available Lucide icons (from icon-checker.ts)
const availableLucideIcons = new Set([
  'Activity', 'AirVent', 'Airplay', 'AlarmCheck', 'AlarmClock', 'AlarmClockOff', 'AlarmMinus', 
  'Mail', 'Calendar', 'User', 'Phone', 'Video', 'MessageSquare', 'Share2', 'Camera', 'Settings', 
  'Users', 'FileText', 'Info', 'Search', 'Plus', 'ChevronLeft', 'ChevronRight', 'Filter',
  'MoreHorizontal', 'Edit', 'Trash', 'X', 'Check', 'ArrowRight',
  // ... many more icons would be here in a complete list
]);

/**
 * Extracts icon names from a component string
 */
function extractIconsFromComponent(componentCode) {
  const iconRegex = /<([A-Z][a-zA-Z0-9]*)(?:\s|\/>|>)/g;
  const matches = componentCode.match(iconRegex) || [];
  
  return matches.map(match => match.slice(1).trim().replace(/\s.*$/, ''))
    .filter(iconName => availableLucideIcons.has(iconName));
}

/**
 * Finds missing icon imports in a component
 */
function findMissingIconImports(componentCode, imports) {
  const usedIcons = extractIconsFromComponent(componentCode);
  
  // Extract imported icons
  const importedIconsRegex = /import\s+{([^}]+)}\s+from\s+['"]lucide-react['"]/g;
  const importMatches = [...imports.matchAll(importedIconsRegex)];
  
  const importedIcons = new Set();
  importMatches.forEach(match => {
    const iconsList = match[1];
    const icons = iconsList.split(',').map(icon => 
      icon.trim().replace(/\s+as\s+.+$/, '')  // Handle renamed imports
    );
    icons.forEach(icon => importedIcons.add(icon));
  });
  
  // Find missing icons
  return usedIcons.filter(icon => !importedIcons.has(icon));
}

/**
 * Checks a component file for missing icon imports
 */
function checkComponentForIcons(fileContent) {
  // Extract imports and component code
  const importSection = fileContent.match(/^(import[^;]+;[\s\n]*)+/m)?.[0] || '';
  const componentCode = fileContent.substring(importSection.length);
  
  // Find missing icons
  const missingIcons = findMissingIconImports(componentCode, importSection);
  
  // Check if there's an existing lucide-react import
  const lucideImportRegex = /import\s+{([^}]+)}\s+from\s+['"]lucide-react['"]/;
  const lucideImport = importSection.match(lucideImportRegex);
  
  let suggestedImport = '';
  
  if (missingIcons.length > 0) {
    if (lucideImport) {
      // Add to existing import
      const currentIcons = lucideImport[1].split(',').map(i => i.trim());
      const updatedIcons = [...new Set([...currentIcons, ...missingIcons])].sort();
      
      suggestedImport = importSection.replace(
        lucideImportRegex,
        `import { ${updatedIcons.join(', ')} } from 'lucide-react'`
      );
    } else {
      // Create new import
      suggestedImport = `import { ${missingIcons.join(', ')} } from 'lucide-react';\n${importSection}`;
    }
  }
  
  return {
    missingIcons,
    suggestedImport: missingIcons.length > 0 ? suggestedImport : importSection,
    hasChanges: missingIcons.length > 0
  };
}

/**
 * Helper function to check if a file is a React component
 */
function isReactComponent(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return ext === '.tsx' || ext === '.jsx';
}

/**
 * Recursively scans directories for React components
 */
async function findReactComponents(dir) {
  const files = await readdir(dir);
  const components = [];
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stats = await stat(filePath);
    
    if (stats.isDirectory()) {
      // Skip node_modules and other non-source directories
      if (file !== 'node_modules' && file !== 'dist' && file !== 'build' && !file.startsWith('.')) {
        const nestedComponents = await findReactComponents(filePath);
        components.push(...nestedComponents);
      }
    } else if (isReactComponent(filePath)) {
      components.push(filePath);
    }
  }
  
  return components;
}

/**
 * Check a component file and fix if needed
 */
async function processComponentFile(filePath, shouldFix) {
  try {
    const content = await readFile(filePath, 'utf8');
    const result = checkComponentForIcons(content);
    
    if (result.missingIcons.length > 0) {
      console.log(`\n[${filePath}]`);
      console.log(`  Missing icons: ${result.missingIcons.join(', ')}`);
      
      if (shouldFix) {
        try {
          // Replace the imports section with the suggested imports
          const updatedContent = content.replace(
            /^(import[^;]+;[\s\n]*)+/m, 
            result.suggestedImport
          );
          
          await writeFile(filePath, updatedContent, 'utf8');
          console.log(`  ✅ Fixed: Updated imports for ${filePath}`);
        } catch (writeError) {
          console.error(`  ❌ Error fixing imports in ${filePath}:`, writeError);
        }
      } else {
        console.log(`  Run with --fix to automatically add the missing imports`);
      }
      
      return true; // Has issues
    }
    
    return false; // No issues
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
}

/**
 * Main function to scan all components and check for missing icon imports
 */
async function main() {
  try {
    const shouldFix = process.argv.includes('--fix');
    const srcDir = path.join(process.cwd(), 'src');
    
    console.log('Scanning for React components...');
    const componentFiles = await findReactComponents(srcDir);
    console.log(`Found ${componentFiles.length} React components`);
    
    let issueCount = 0;
    
    console.log(shouldFix ? 'Checking and fixing missing icon imports...' : 'Checking for missing icon imports...');
    
    for (const file of componentFiles) {
      const hasIssues = await processComponentFile(file, shouldFix);
      if (hasIssues) issueCount++;
    }
    
    if (issueCount === 0) {
      console.log('\n✅ All components have proper icon imports!');
    } else {
      console.log(`\n${shouldFix ? '✅' : '⚠️'} Found ${issueCount} components with missing icon imports${shouldFix ? ' (fixed)' : ''}`);
      if (!shouldFix) {
        console.log('Run with --fix to automatically fix the issues');
      }
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
