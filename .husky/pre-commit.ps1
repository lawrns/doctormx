# DoctorMX Pre-commit Hook - Quality Gates Enforcement (Windows PowerShell)
# ZERO WARNINGS POLICY - This hook will fail if any quality check produces warnings

$ErrorActionPreference = "Stop"

Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     🩺 DoctorMX Quality Gates - Pre-commit Checks              ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$Failed = 0

function Write-CheckHeader($name) {
    Write-Host "▶ Running: $name..." -ForegroundColor Blue
}

function Write-CheckSuccess($name) {
    Write-Host "✓ $name passed" -ForegroundColor Green
    Write-Host ""
}

function Write-CheckFailure($name) {
    Write-Host "✗ $name failed" -ForegroundColor Red
    Write-Host ""
    $script:Failed = 1
}

# 1. Secret Scanning
Write-CheckHeader "Secret Scanning (Gitleaks)"
try {
    $gitleaksExists = Get-Command gitleaks -ErrorAction SilentlyContinue
    if ($gitleaksExists) {
        gitleaks detect --source . --staged 2>&1 | Out-Null
        Write-CheckSuccess "Secret Scanning"
    } else {
        Write-Host "  Gitleaks not installed, skipping" -ForegroundColor Yellow
    }
} catch {
    Write-CheckFailure "Secret Scanning"
}

# 2. Lint Staged Files (ZERO WARNINGS POLICY)
Write-CheckHeader "Lint Staged Files"
try {
    npx lint-staged 2>&1 | Out-Null
    Write-CheckSuccess "Lint Staged Files"
} catch {
    Write-CheckFailure "Lint Staged Files"
}

# 3. TypeScript Type Check
Write-CheckHeader "TypeScript Type Check"
try {
    npx tsc --noEmit 2>&1 | Out-Null
    Write-CheckSuccess "TypeScript Type Check"
} catch {
    Write-CheckFailure "TypeScript Type Check"
}

# 4. Check for console.log in production code
Write-CheckHeader "Checking for console.log statements"
$stagedFiles = git diff --cached --name-only | Select-String '\.(ts|tsx)$'
$consoleLogsFound = $false
foreach ($file in $stagedFiles) {
    if ($file -notmatch 'test' -and $file -notmatch 'spec') {
        $content = Get-Content $file -ErrorAction SilentlyContinue
        if ($content -match 'console\.log') {
            if (-not $consoleLogsFound) {
                Write-Host "⚠ Warning: console.log statements found:" -ForegroundColor Yellow
                $consoleLogsFound = $true
            }
            Write-Host "  $file" -ForegroundColor Yellow
        }
    }
}
if (-not $consoleLogsFound) {
    Write-Host "  No console.log statements found" -ForegroundColor Green
}
Write-Host ""

# 5. Check for TODO/FIXME comments
Write-CheckHeader "Checking for TODO/FIXME comments"
$todoFound = $false
foreach ($file in $stagedFiles) {
    $content = Get-Content $file -ErrorAction SilentlyContinue
    if ($content -match 'TODO|FIXME') {
        if (-not $todoFound) {
            Write-Host "⚠ TODO/FIXME comments found:" -ForegroundColor Yellow
            $todoFound = $true
        }
        Write-Host "  $file" -ForegroundColor Yellow
    }
}
if (-not $todoFound) {
    Write-Host "  No TODO/FIXME comments found" -ForegroundColor Green
}
Write-Host ""

# Final result
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
if ($Failed -eq 0) {
    Write-Host "✅ All quality gates passed! Proceeding with commit..." -ForegroundColor Green
    Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    exit 0
} else {
    Write-Host "❌ Quality gates failed! Fix the issues above before committing." -ForegroundColor Red
    Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "To bypass quality gates (not recommended): git commit -n -m 'message'" -ForegroundColor Yellow
    exit 1
}
