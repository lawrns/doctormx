#!/usr/bin/env node
/**
 * Quality Report Generator
 * Generates comprehensive quality metrics for the codebase
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, silent = true) {
  try {
    const output = execSync(command, { 
      encoding: 'utf8',
      stdio: silent ? 'pipe' : 'inherit',
      cwd: process.cwd()
    });
    return { success: true, output: output.trim() };
  } catch (error) {
    return { success: false, output: error.stdout?.trim() || error.message };
  }
}

async function getTypeScriptErrors() {
  log('\n🔍 Checking TypeScript...', 'blue');
  const result = runCommand('npx tsc --noEmit --strict 2>&1');
  
  if (result.success) {
    return { count: 0, errors: [] };
  }
  
  const errorLines = result.output.split('\n').filter(line => line.includes('error TS'));
  return { 
    count: errorLines.length,
    errors: errorLines.slice(0, 10) // First 10 errors
  };
}

async function getESLintErrors() {
  log('🔍 Checking ESLint...', 'blue');
  const result = runCommand('npx eslint . --ext .ts,.tsx --format json 2>&1');
  
  try {
    const reports = JSON.parse(result.output);
    let errorCount = 0;
    let warningCount = 0;
    
    reports.forEach(file => {
      errorCount += file.errorCount;
      warningCount += file.warningCount;
    });
    
    return { errors: errorCount, warnings: warningCount };
  } catch {
    return { errors: 0, warnings: 0 };
  }
}

async function getTestCoverage() {
  log('🔍 Checking test coverage...', 'blue');
  
  // Check if coverage report exists
  const coveragePath = path.join(process.cwd(), 'coverage', 'coverage-summary.json');
  
  if (fs.existsSync(coveragePath)) {
    const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
    return {
      lines: coverage.total?.lines?.pct || 0,
      statements: coverage.total?.statements?.pct || 0,
      functions: coverage.total?.functions?.pct || 0,
      branches: coverage.total?.branches?.pct || 0
    };
  }
  
  return { lines: 0, statements: 0, functions: 0, branches: 0 };
}

async function getSecurityVulnerabilities() {
  log('🔍 Checking security vulnerabilities...', 'blue');
  const result = runCommand('npm audit --json 2>&1', true);
  
  try {
    const audit = JSON.parse(result.output);
    const vulnerabilities = audit.vulnerabilities || {};
    
    let critical = 0;
    let high = 0;
    let moderate = 0;
    let low = 0;
    
    Object.values(vulnerabilities).forEach((vuln) => {
      const severity = vuln.severity || 'low';
      if (severity === 'critical') critical++;
      else if (severity === 'high') high++;
      else if (severity === 'moderate') moderate++;
      else low++;
    });
    
    return { critical, high, moderate, low };
  } catch {
    return { critical: 0, high: 0, moderate: 0, low: 0 };
  }
}

function calculateOverallScore(metrics) {
  // Calculate dimension scores (0-100)
  const typescriptScore = Math.max(0, 100 - (metrics.typescript.count * 2));
  const eslintScore = Math.max(0, 100 - ((metrics.eslint.errors * 3) + metrics.eslint.warnings));
  const coverageScore = metrics.coverage.lines;
  const securityScore = Math.max(0, 100 - ((metrics.security.critical * 20) + (metrics.security.high * 10)));
  
  // Weighted average
  const overall = Math.round(
    (typescriptScore * 0.25) +
    (eslintScore * 0.20) +
    (coverageScore * 0.25) +
    (securityScore * 0.30)
  );
  
  return {
    overall,
    typescript: typescriptScore,
    eslint: eslintScore,
    coverage: coverageScore,
    security: securityScore
  };
}

function generateMarkdownReport(report) {
  const { timestamp, metrics, scores } = report;
  
  return `# Quality Report
Generated: ${timestamp}

## Overall Score: ${scores.overall}/100

| Dimension | Score | Status |
|-----------|-------|--------|
| TypeScript | ${scores.typescript}/100 | ${scores.typescript >= 90 ? '✅' : scores.typescript >= 70 ? '⚠️' : '❌'} |
| ESLint | ${scores.eslint}/100 | ${scores.eslint >= 90 ? '✅' : scores.eslint >= 70 ? '⚠️' : '❌'} |
| Test Coverage | ${scores.coverage.toFixed(1)}% | ${scores.coverage >= 80 ? '✅' : scores.coverage >= 60 ? '⚠️' : '❌'} |
| Security | ${scores.security}/100 | ${scores.security >= 90 ? '✅' : scores.security >= 70 ? '⚠️' : '❌'} |

## Detailed Metrics

### TypeScript
- Errors: ${metrics.typescript.count}
${metrics.typescript.errors.length > 0 ? '- First errors:\n' + metrics.typescript.errors.map(e => `  - ${e}`).join('\n') : '- No errors'}

### ESLint
- Errors: ${metrics.eslint.errors}
- Warnings: ${metrics.eslint.warnings}

### Test Coverage
- Lines: ${metrics.coverage.lines.toFixed(1)}%
- Statements: ${metrics.coverage.statements.toFixed(1)}%
- Functions: ${metrics.coverage.functions.toFixed(1)}%
- Branches: ${metrics.coverage.branches.toFixed(1)}%

### Security
- Critical: ${metrics.security.critical}
- High: ${metrics.security.high}
- Moderate: ${metrics.security.moderate}
- Low: ${metrics.security.low}

## Quality Gates
${scores.overall >= 80 ? '✅ All quality gates passed' : '❌ Quality gates failed'}

${scores.overall < 80 ? '### Required Actions\n' + [
  scores.typescript < 90 ? '- [ ] Fix TypeScript errors' : '',
  scores.eslint < 90 ? '- [ ] Fix ESLint errors/warnings' : '',
  scores.coverage < 80 ? '- [ ] Increase test coverage to 80%' : '',
  scores.security < 90 ? '- [ ] Fix security vulnerabilities' : ''
].filter(Boolean).join('\n') : ''}
`;
}

async function main() {
  log(`${colors.bold}📊 Generating Quality Report...${colors.reset}\n`, 'bold');
  
  const report = {
    timestamp: new Date().toISOString(),
    metrics: {
      typescript: await getTypeScriptErrors(),
      eslint: await getESLintErrors(),
      coverage: await getTestCoverage(),
      security: await getSecurityVulnerabilities()
    }
  };
  
  report.scores = calculateOverallScore(report.metrics);
  
  // Print summary
  log(`\n${colors.bold}=== QUALITY SCORE ===${colors.reset}`, 'bold');
  log(`Overall: ${report.scores.overall}/100`, report.scores.overall >= 80 ? 'green' : report.scores.overall >= 60 ? 'yellow' : 'red');
  log(`TypeScript: ${report.scores.typescript}/100`);
  log(`ESLint: ${report.scores.eslint}/100`);
  log(`Coverage: ${report.scores.coverage.toFixed(1)}%`);
  log(`Security: ${report.scores.security}/100`);
  
  // Save report
  const mdReport = generateMarkdownReport(report);
  fs.writeFileSync('quality-report.md', mdReport);
  
  // Save JSON for tracking
  fs.writeFileSync('quality-metrics.json', JSON.stringify(report, null, 2));
  
  log(`\n✅ Reports saved:`, 'green');
  log('  - quality-report.md');
  log('  - quality-metrics.json');
  
  // Exit with error if score < 80
  if (report.scores.overall < 80) {
    log(`\n❌ Quality score ${report.scores.overall} is below threshold (80)`, 'red');
    process.exit(1);
  }
  
  log(`\n✅ Quality gates passed!`, 'green');
}

main().catch(error => {
  console.error('Error generating report:', error);
  process.exit(1);
});
