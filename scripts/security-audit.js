#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Running Security Audit...\n');

// Patterns to search for
const sensitivePatterns = [
  // API Keys
  { pattern: /sk-[a-zA-Z0-9]{20,}/, name: 'OpenAI API Key' },
  { pattern: /AIza[0-9A-Za-z\\-_]{35}/, name: 'Google API Key' },
  { pattern: /[0-9a-f]{32}-us[0-9]{1,2}/, name: 'Mailchimp API Key' },
  
  // Credentials
  { pattern: /password\s*[:=]\s*["'][^"']{8,}["']/, name: 'Hardcoded Password' },
  { pattern: /secret\s*[:=]\s*["'][^"']{8,}["']/, name: 'Hardcoded Secret' },
  
  // Database URLs
  { pattern: /postgres:\/\/[^:]+:[^@]+@[^/]+\/\w+/, name: 'PostgreSQL Connection String' },
  { pattern: /mongodb(\+srv)?:\/\/[^:]+:[^@]+@[^/]+/, name: 'MongoDB Connection String' },
  
  // JWT/Supabase
  { pattern: /eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/, name: 'JWT Token' },
  
  // Known exposed keys
  { 
    pattern: /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/, 
    name: 'EXPOSED OpenAI Key (Compromised!)' 
  }
];

// Files to skip
const skipPatterns = [
  /node_modules/,
  /\.git/,
  /dist/,
  /build/,
  /\.env\.example$/,
  /security-audit\.js$/,
  /env-validation\.ts$/
];

// File extensions to check
const checkExtensions = ['.js', '.jsx', '.ts', '.tsx', '.json', '.env'];

let issuesFound = 0;
const issues = [];

function shouldSkipFile(filePath) {
  return skipPatterns.some(pattern => pattern.test(filePath));
}

function scanFile(filePath) {
  if (shouldSkipFile(filePath)) return;
  
  const ext = path.extname(filePath);
  if (!checkExtensions.includes(ext) && !filePath.endsWith('.env')) return;
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      sensitivePatterns.forEach(({ pattern, name }) => {
        if (pattern.test(line)) {
          issuesFound++;
          issues.push({
            file: filePath,
            line: index + 1,
            type: name,
            preview: line.trim().substring(0, 100) + '...'
          });
        }
      });
    });
  } catch (error) {
    // Skip files that can't be read
  }
}

function scanDirectory(dir) {
  try {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        scanDirectory(filePath);
      } else {
        scanFile(filePath);
      }
    });
  } catch (error) {
    // Skip directories that can't be read
  }
}

// Start scanning from project root
const projectRoot = path.join(__dirname, '..');
scanDirectory(projectRoot);

// Report results
console.log('Security Audit Complete\n');
console.log('=' .repeat(80));

if (issuesFound === 0) {
  console.log('✅ No security issues found!');
} else {
  console.log(`⚠️  Found ${issuesFound} potential security issues:\n`);
  
  issues.forEach((issue, index) => {
    console.log(`${index + 1}. ${issue.type}`);
    console.log(`   File: ${issue.file}:${issue.line}`);
    console.log(`   Preview: ${issue.preview}`);
    console.log('');
  });
  
  console.log('\n🔐 Security Recommendations:');
  console.log('1. Move all sensitive values to environment variables');
  console.log('2. Never commit .env files to version control');
  console.log('3. Use a secrets management service for production');
  console.log('4. Rotate any exposed credentials immediately');
  
  process.exit(1);
}

console.log('\n💡 Additional Security Tips:');
console.log('- Run this audit regularly, especially before commits');
console.log('- Set up pre-commit hooks to prevent accidental credential commits');
console.log('- Use tools like git-secrets or gitleaks for automated scanning');