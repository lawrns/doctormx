#!/usr/bin/env node
/**
 * ARCH-002: Enforce kebab-case for folders, PascalCase for components
 * This script renames React components to PascalCase and updates imports
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const startTime = Date.now();
let filesRenamed = 0;
let importsUpdated = 0;

// Files to rename (app-level React components that should be PascalCase)
const filesToRename = [
  // Client components
  { old: 'src/app/app/ai-consulta/ai-consulta-client.tsx', new: 'AiConsultaClient.tsx' },
  { old: 'src/app/app/consent/consent-client.tsx', new: 'ConsentClient.tsx' },
  { old: 'src/app/app/consent/new/new-consent-client.tsx', new: 'NewConsentClient.tsx' },
  { old: 'src/app/app/consent/[id]/consent-detail-client.tsx', new: 'ConsentDetailClient.tsx' },
  { old: 'src/app/app/data-rights/data-rights-client.tsx', new: 'DataRightsClient.tsx' },
  { old: 'src/app/app/data-rights/new/new-arco-request-client.tsx', new: 'NewArcoRequestClient.tsx' },
  { old: 'src/app/app/data-rights/[id]/arco-request-detail-client.tsx', new: 'ArcoRequestDetailClient.tsx' },
  { old: 'src/app/doctor/prescription/[appointmentId]/prescription-form.tsx', new: 'PrescriptionForm.tsx' },
  
  // Animation components  
  { old: 'src/components/animations/advanced-animations.tsx', new: 'AdvancedAnimations.tsx' },
  { old: 'src/components/animations/dynamic.tsx', new: 'Dynamic.tsx' },
  { old: 'src/components/animations/index-optimized.tsx', new: 'IndexOptimized.tsx' },
  { old: 'src/components/animations/lazy-motion.tsx', new: 'LazyMotion.tsx' },
  
  // SOAP components
  { old: 'src/components/soap/index.dynamic.tsx', new: 'IndexDynamic.tsx' }
];

const renameMap = {};
const dryRun = process.argv.includes('--dry-run');

console.log('=== ARCH-002: Naming Convention Enforcement ===\n');

// Phase 1: Rename files
console.log('[PHASE 1] Renaming files...');

for (const file of filesToRename) {
  const oldPath = file.old;
  const newName = file.new;
  
  if (fs.existsSync(oldPath)) {
    const dir = path.dirname(oldPath);
    const newPath = path.join(dir, newName);
    
    if (dryRun) {
      console.log(`  [DRY RUN] Would rename: ${oldPath} -> ${newName}`);
      filesRenamed++;
      
      const oldBase = path.basename(oldPath, '.tsx');
      const newBase = path.basename(newName, '.tsx');
      renameMap[oldBase] = newBase;
    } else {
      try {
        fs.renameSync(oldPath, newPath);
        console.log(`  ✓ Renamed: ${oldPath} -> ${newName}`);
        filesRenamed++;
        
        const oldBase = path.basename(oldPath, '.tsx');
        const newBase = path.basename(newName, '.tsx');
        renameMap[oldBase] = newBase;
      } catch (err) {
        console.error(`  ✗ ERROR: Failed to rename ${oldPath} - ${err.message}`);
      }
    }
  } else {
    console.log(`  ⚠ File not found: ${oldPath}`);
  }
}

// Phase 2: Update imports
if (filesRenamed > 0) {
  console.log('\n[PHASE 2] Updating imports...');
  
  function findFiles(dir, extensions, files = []) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.includes('node_modules')) {
        findFiles(fullPath, extensions, files);
      } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
    
    return files;
  }
  
  const sourceFiles = findFiles('src', ['.tsx', '.ts']);
  
  for (const sourceFile of sourceFiles) {
    let content = fs.readFileSync(sourceFile, 'utf8');
    const originalContent = content;
    let hasChanges = false;
    
    for (const [oldBase, newBase] of Object.entries(renameMap)) {
      // Update import statements
      // Match patterns like: from './oldBase' or from '../path/oldBase'
      const importRegex = new RegExp(`(from\\s+['"][^'"]*\\/)${oldBase}(['"])`, 'g');
      const dynamicImportRegex = new RegExp(`(import\\s*\\(\\s*['"][^'"]*\\/)${oldBase}(['"]\\s*\\))`, 'g');
      
      const newContent = content
        .replace(importRegex, `$1${newBase}$2`)
        .replace(dynamicImportRegex, `$1${newBase}$2`);
      
      if (newContent !== content) {
        content = newContent;
        hasChanges = true;
      }
    }
    
    if (hasChanges) {
      if (!dryRun) {
        fs.writeFileSync(sourceFile, content, 'utf8');
        console.log(`  ✓ Updated: ${sourceFile}`);
      } else {
        console.log(`  [DRY RUN] Would update: ${sourceFile}`);
      }
      importsUpdated++;
    }
  }
}

// Phase 3: Verify build (if not dry run)
if (!dryRun && filesRenamed > 0) {
  console.log('\n[PHASE 3] Verifying build...');
  console.log('  Running npm run build...');
  
  try {
    execSync('npm run build', { stdio: 'pipe', timeout: 300000 });
    console.log('  ✓ Build PASSED');
  } catch (err) {
    console.error('  ✗ Build FAILED');
    console.error(`  Error: ${err.message}`);
  }
}

// Summary
const duration = ((Date.now() - startTime) / 1000).toFixed(2);

console.log('\n=== SUMMARY ===');
console.log(`Files renamed: ${filesRenamed}`);
console.log(`Imports updated: ${importsUpdated}`);
console.log(`Time taken: ${duration}s`);

if (dryRun) {
  console.log('\nThis was a DRY RUN. Run without --dry-run to apply changes.');
}

console.log('\n=== Done ===');
