const { chromium } = require('playwright');
const AxeBuilder = require('@axe-core/playwright').default;

const pages = [
  { path: '/', name: 'Landing Page' },
  { path: '/auth/login', name: 'Login Page' },
  { path: '/auth/register', name: 'Register Page' },
  { path: '/doctors', name: 'Doctors Directory' },
  { path: '/specialties', name: 'Specialties Page' },
  { path: '/pricing', name: 'Pricing Page' },
  { path: '/help', name: 'Help Center' },
  { path: '/terms', name: 'Terms of Service' },
  { path: '/privacy', name: 'Privacy Policy' },
];

async function runAudit() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const allViolations = [];
  
  for (const { path, name } of pages) {
    try {
      console.log(`\n🔍 Auditing: ${name} (${path})`);
      await page.goto(`http://localhost:3000${path}`, { timeout: 10000 });
      await page.waitForLoadState('networkidle', { timeout: 10000 });
      
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .exclude('.ignored-for-a11y')
        .analyze();
      
      if (results.violations.length > 0) {
        console.log(`  ❌ Found ${results.violations.length} violation(s)`);
        results.violations.forEach(v => {
          console.log(`    - ${v.id}: ${v.description} (${v.impact})`);
          console.log(`      Nodes: ${v.nodes.length}`);
          v.nodes.slice(0, 3).forEach((node, i) => {
            console.log(`      [${i+1}] ${node.html.substring(0, 100)}...`);
          });
          allViolations.push({
            page: name,
            path,
            id: v.id,
            impact: v.impact,
            description: v.description,
            help: v.help,
            nodes: v.nodes.map(n => ({ html: n.html, target: n.target }))
          });
        });
      } else {
        console.log('  ✅ No violations found');
      }
    } catch (e) {
      console.log(`  ⚠️ Error: ${e.message}`);
    }
  }
  
  await browser.close();
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  
  if (allViolations.length === 0) {
    console.log('✅ No WCAG violations found!');
  } else {
    const byId = {};
    allViolations.forEach(v => {
      if (!byId[v.id]) {
        byId[v.id] = { count: 0, pages: [], impact: v.impact, description: v.description };
      }
      byId[v.id].count++;
      if (!byId[v.id].pages.includes(v.page)) {
        byId[v.id].pages.push(v.page);
      }
    });
    
    console.log(`\nFound ${allViolations.length} total violations across ${Object.keys(byId).length} types:\n`);
    Object.entries(byId).forEach(([id, data]) => {
      console.log(`${id} (${data.impact}): ${data.description}`);
      console.log(`  Affected pages: ${data.pages.join(', ')}`);
      console.log(`  Occurrences: ${data.count}`);
      console.log('');
    });
  }
  
  // Save detailed report
  const fs = require('fs');
  fs.writeFileSync('axe-audit-results.json', JSON.stringify(allViolations, null, 2));
  console.log('📄 Detailed report saved to axe-audit-results.json');
  
  process.exit(allViolations.length > 0 ? 1 : 0);
}

runAudit().catch(e => {
  console.error('Audit failed:', e);
  process.exit(1);
});
