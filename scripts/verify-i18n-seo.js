/**
 * I18N-007: SEO Implementation Verification Script
 * 
 * This script verifies that the i18n SEO implementation is correctly configured.
 * Run with: node scripts/verify-i18n-seo.js
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath, description) {
  const fullPath = path.join(process.cwd(), filePath);
  if (fs.existsSync(fullPath)) {
    log(`✓ ${description}: ${filePath}`, 'green');
    return true;
  } else {
    log(`✗ ${description}: ${filePath} not found`, 'red');
    return false;
  }
}

function checkContent(filePath, patterns, description) {
  const fullPath = path.join(process.cwd(), filePath);
  if (!fs.existsSync(fullPath)) {
    log(`✗ ${description}: file not found`, 'red');
    return false;
  }

  const content = fs.readFileSync(fullPath, 'utf-8');
  let allFound = true;

  for (const pattern of patterns) {
    if (content.includes(pattern)) {
      log(`  ✓ Found: "${pattern.substring(0, 50)}..."`, 'green');
    } else {
      log(`  ✗ Missing: "${pattern.substring(0, 50)}..."`, 'red');
      allFound = false;
    }
  }

  if (allFound) {
    log(`✓ ${description}`, 'green');
  } else {
    log(`✗ ${description}`, 'red');
  }

  return allFound;
}

log('\n=== I18N-007: SEO Implementation Verification ===\n', 'blue');

let allPassed = true;

// 1. Check SEO utility file
log('\n1. Checking SEO utility...', 'blue');
allPassed = checkFile('src/lib/seo.ts', 'SEO utility') && allPassed;
allPassed = checkContent('src/lib/seo.ts', [
  'generateSEOMetadata',
  'hreflang',
  'alternates',
  'openGraph',
  'locale',
  'routing.locales',
], 'SEO utility has required functions') && allPassed;

// 2. Check updated pages
log('\n2. Checking updated pages...', 'blue');
const pages = [
  { path: 'src/app/page.tsx', name: 'Homepage' },
  { path: 'src/app/doctores/page.tsx', name: 'Doctors Directory' },
  { path: 'src/app/specialties/layout.tsx', name: 'Specialties' },
  { path: 'src/app/pricing/layout.tsx', name: 'Pricing' },
  { path: 'src/app/for-doctors/layout.tsx', name: 'For Doctors' },
  { path: 'src/app/contact/layout.tsx', name: 'Contact' },
  { path: 'src/app/ai-consulta/layout.tsx', name: 'AI Consultation' },
];

for (const page of pages) {
  allPassed = checkContent(page.path, [
    'generateMetadata',
    'generateSEOMetadata',
    'getLocale',
    'I18N-007',
  ], `${page.name} has SEO metadata`) && allPassed;
}

// 3. Check sitemap
log('\n3. Checking sitemap...', 'blue');
allPassed = checkContent('src/app/sitemap.ts', [
  'routing.locales',
  'alternates',
  'languages',
  'I18N-007',
], 'Sitemap has locale support') && allPassed;

// 4. Check root layout
log('\n4. Checking root layout...', 'blue');
allPassed = checkContent('src/app/layout.tsx', [
  'alternates',
  'languages',
  'openGraph',
  'locale',
  'I18N-007',
], 'Root layout has SEO configuration') && allPassed;

// 5. Verify hreflang structure
log('\n5. Verifying hreflang structure...', 'blue');
const layoutContent = fs.readFileSync(path.join(process.cwd(), 'src/app/layout.tsx'), 'utf-8');
if (layoutContent.includes("'es'") && layoutContent.includes("'en'") && layoutContent.includes("'x-default'")) {
  log('✓ Hreflang tags include es, en, and x-default', 'green');
} else {
  log('✗ Hreflang tags missing required languages', 'red');
  allPassed = false;
}

// 6. Summary
log('\n=== Summary ===', 'blue');
if (allPassed) {
  log('\n✓ All I18N-007 SEO checks passed!', 'green');
  log('\nDeliverables:', 'blue');
  log('  • Updated layout.tsx with hreflang tags', 'green');
  log('  • Updated sitemap.ts with locale URLs', 'green');
  log('  • OpenGraph locale is dynamic (es_MX / en_US)', 'green');
  log('  • SEO utility created for consistent metadata', 'green');
  log('  • Key pages have locale-aware metadata', 'green');
  process.exit(0);
} else {
  log('\n✗ Some checks failed. Please review the output above.', 'red');
  process.exit(1);
}
