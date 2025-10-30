#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const components = [
  'HealthCommunity.jsx',
  'HealthMarketplace.jsx',
  'GamificationDashboard.jsx',
  'AIReferralSystem.jsx',
  'EnhancedDoctorPanel.jsx',
  'HealthBlog.jsx',
  'FAQ.jsx',
  'ExpertQA.jsx',
  'QABoard.jsx',
  'AffiliateDashboard.jsx',
  'SubscriptionPlans.jsx'
];

components.forEach(component => {
  const filePath = path.join(__dirname, 'src/components', component);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  ${component} not found`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Check if already has Layout import
  if (content.includes("import Layout from './Layout'")) {
    console.log(`✅ ${component} already has Layout import`);
    return;
  }

  // Add Layout import after other imports
  const importRegex = /^(import\s+.*?;)\n/m;
  const lastImportMatch = content.match(/^import\s+.*?;$/gm);
  
  if (lastImportMatch) {
    const lastImport = lastImportMatch[lastImportMatch.length - 1];
    content = content.replace(lastImport, lastImport + "\nimport Layout from './Layout';");
  }

  // Find the main return statement and wrap it
  // Match: return (\n<div or <motion.div or similar
  const returnRegex = /(\n\s+return\s+\(\s*\n\s+)(<[A-Za-z])/;
  
  if (returnRegex.test(content)) {
    content = content.replace(returnRegex, '$1<Layout>\n      $2');
    
    // Find the closing of the return and add </Layout>
    // Match the last closing tag before );
    const closeRegex = /(\s+<\/[A-Za-z]+>\s+)\);(\s+\})/;
    content = content.replace(closeRegex, '$1\n    </Layout>\n  );$2');
  }

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`✅ Fixed ${component}`);
});

console.log('\n✨ All components fixed!');
