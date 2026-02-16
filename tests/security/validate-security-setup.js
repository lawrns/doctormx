/**
 * Security Setup Validation Script
 * Verifies that all security infrastructure is properly configured
 */

const fs = require('fs');
const path = require('path');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
};

function check(exists, message) {
  if (exists) {
    console.log(`${colors.green}✓${colors.reset} ${message}`);
    return true;
  } else {
    console.log(`${colors.red}✗${colors.reset} ${message}`);
    return false;
  }
}

function section(title) {
  console.log(`\n${colors.yellow}=== ${title} ===${colors.reset}`);
}

let passed = 0;
let total = 0;

function assert(condition, message) {
  total++;
  if (check(condition, message)) passed++;
}

console.log(`${colors.yellow}
╔══════════════════════════════════════════════════════════════╗
║        DoctorMX Security Infrastructure Validation           ║
╚══════════════════════════════════════════════════════════════╝
${colors.reset}`);

// Feature Flags
section('Feature Flag Infrastructure');
assert(
  fs.existsSync('src/lib/feature-flags.ts'),
  'src/lib/feature-flags.ts exists'
);
assert(
  fs.existsSync('src/lib/feature-flags/flags.ts'),
  'src/lib/feature-flags/flags.ts exists'
);
assert(
  fs.existsSync('src/lib/feature-flags/index.ts'),
  'src/lib/feature-flags/index.ts exists'
);

// Security Headers
section('Security Headers Middleware');
assert(
  fs.existsSync('src/middleware.ts'),
  'src/middleware.ts exists'
);

const middlewareContent = fs.readFileSync('src/middleware.ts', 'utf8');
assert(
  middlewareContent.includes('Content-Security-Policy'),
  'CSP header configured'
);
assert(
  middlewareContent.includes('Strict-Transport-Security'),
  'HSTS header configured'
);
assert(
  middlewareContent.includes('X-Frame-Options'),
  'X-Frame-Options header configured'
);
assert(
  middlewareContent.includes('X-Content-Type-Options'),
  'X-Content-Type-Options header configured'
);
assert(
  middlewareContent.includes('Referrer-Policy'),
  'Referrer-Policy header configured'
);
assert(
  middlewareContent.includes('Permissions-Policy'),
  'Permissions-Policy header configured'
);
assert(
  middlewareContent.includes('max-age=63072000'),
  'HSTS max-age is 2 years'
);
assert(
  middlewareContent.includes("'DENY'"),
  'X-Frame-Options is DENY'
);
assert(
  middlewareContent.includes('nosniff'),
  'X-Content-Type-Options is nosniff'
);
assert(
  middlewareContent.includes('suspicious'),
  'Suspicious request detection implemented'
);
assert(
  middlewareContent.includes('sqlmap'),
  'SQLMap detection configured'
);

// Audit Logging
section('Audit Logging Tables');
assert(
  fs.existsSync('supabase/migrations/audit-logging.sql'),
  'audit-logging.sql migration exists'
);

const auditContent = fs.readFileSync('supabase/migrations/audit-logging.sql', 'utf8');
assert(
  auditContent.includes('CREATE TABLE IF NOT EXISTS audit_logs'),
  'audit_logs table defined'
);
assert(
  auditContent.includes('CREATE TABLE IF NOT EXISTS security_audit'),
  'security_audit table defined'
);
assert(
  auditContent.includes('CREATE TABLE IF NOT EXISTS feature_flag_audit'),
  'feature_flag_audit table defined'
);
assert(
  auditContent.includes('CREATE TABLE IF NOT EXISTS auth_audit'),
  'auth_audit table defined'
);
assert(
  auditContent.includes('CREATE TABLE IF NOT EXISTS data_access_audit'),
  'data_access_audit table defined'
);
assert(
  auditContent.includes('audit_trigger_func()'),
  'Audit trigger function defined'
);
assert(
  auditContent.includes('ENABLE ROW LEVEL SECURITY'),
  'RLS enabled on audit tables'
);
assert(
  auditContent.includes('CREATE INDEX'),
  'Performance indexes defined'
);

// Security Event Logger
section('Security Event Logging');
assert(
  fs.existsSync('src/lib/security/audit-logger.ts'),
  'audit-logger.ts exists'
);

const loggerContent = fs.readFileSync('src/lib/security/audit-logger.ts', 'utf8');
assert(
  loggerContent.includes('logSecurityEvent'),
  'logSecurityEvent function defined'
);
assert(
  loggerContent.includes('logAuthEvent'),
  'logAuthEvent function defined'
);
assert(
  loggerContent.includes('logDataAccess'),
  'logDataAccess function defined'
);
assert(
  loggerContent.includes('detectSuspiciousActivity'),
  'Suspicious activity detection implemented'
);
assert(
  loggerContent.includes('brute_force'),
  'Brute force detection configured'
);
assert(
  loggerContent.includes('scraping'),
  'Scraping detection configured'
);

// Documentation
section('Documentation Files');
assert(
  fs.existsSync('security-config/feature-flags.md'),
  'feature-flags.md documentation exists'
);
assert(
  fs.existsSync('security-config/headers-config.md'),
  'headers-config.md documentation exists'
);
assert(
  fs.existsSync('security-config/audit-schema.sql'),
  'audit-schema.sql reference exists'
);
assert(
  fs.existsSync('security-setup-report.md'),
  'security-setup-report.md exists'
);

// Tests
section('Test Files');
assert(
  fs.existsSync('tests/security/headers.test.ts'),
  'Security headers test exists'
);
assert(
  fs.existsSync('tests/security/validate-security-setup.js'),
  'Validation script exists'
);

// Summary
section('Summary');
const percentage = Math.round((passed / total) * 100);
console.log(`\n${colors.yellow}Results:${colors.reset} ${passed}/${total} checks passed (${percentage}%)`);

if (passed === total) {
  console.log(`\n${colors.green}✓ All security infrastructure components are properly configured!${colors.reset}`);
  process.exit(0);
} else {
  console.log(`\n${colors.red}✗ Some components are missing or misconfigured.${colors.reset}`);
  process.exit(1);
}
