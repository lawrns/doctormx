#!/usr/bin/env pwsh
# ARCH-002: Enforce kebab-case for folders, PascalCase for components
# This script identifies and fixes naming convention violations

param(
    [switch]$DryRun = $false,
    [switch]$Verbose = $false
)

$startTime = Get-Date
$filesRenamed = 0
$foldersRenamed = 0
$importsUpdated = 0
$errors = @()

Write-Host "=== ARCH-002: Naming Convention Enforcement ===" -ForegroundColor Cyan
Write-Host "Started at: $startTime" -ForegroundColor Gray

# ============================================
# CONFIGURATION
# ============================================

# Special Next.js files that are exempt (should stay lowercase)
$exemptFiles = @(
    "page.tsx", "page.ts",
    "layout.tsx", "layout.ts",
    "loading.tsx", "loading.ts",
    "error.tsx", "error.ts",
    "not-found.tsx", "not-found.ts",
    "route.ts", "route.tsx",
    "template.tsx", "template.ts",
    "default.tsx", "default.ts",
    "sitemap.ts", "sitemap.tsx",
    "middleware.ts", "middleware.tsx"
)

# UI components (shadcn/ui convention - kebab-case is OK)
$uiExemptPaths = @(
    "src/components/ui",
    "src/components/ui/*",
    "src/components/ui/**/*"
)

# Library/config files - kebab-case is OK for non-components
$libPaths = @(
    "src/lib",
    "src/utils",
    "src/constants",
    "src/config",
    "src/hooks",
    "src/types",
    "src/services",
    "src/i18n"
)

# ============================================
# FUNCTIONS
# ============================================

function ConvertTo-PascalCase {
    param([string]$name)
    
    # Remove .tsx or .ts extension for conversion
    $extension = ""
    if ($name -match "\.tsx$") { $extension = ".tsx"; $name = $name -replace "\.tsx$", "" }
    elseif ($name -match "\.ts$") { $extension = ".ts"; $name = $name -replace "\.ts$", "" }
    
    # Handle hyphenated names
    $parts = $name -split "[-_]"
    $pascalParts = $parts | ForEach-Object { 
        if ($_.Length -gt 0) { 
            $_.Substring(0,1).ToUpper() + $_.Substring(1)
        } else { 
            "" 
        }
    }
    $result = $pascalParts -join ""
    
    # Add extension back
    if ($extension) { $result += $extension }
    
    return $result
}

function Test-IsExemptFile {
    param([string]$fileName)
    return $exemptFiles -contains $fileName
}

function Test-IsUIComponent {
    param([string]$filePath)
    return $filePath -like "*/components/ui/*"
}

function Test-IsLibFile {
    param([string]$filePath)
    foreach ($libPath in $libPaths) {
        if ($filePath -like "*/$libPath/*" -or $filePath -like "*/$libPath") {
            return $true
        }
    }
    return $false
}

function Test-IsTestFile {
    param([string]$fileName)
    return $fileName -match "\.test\.(tsx|ts)$"
}

function Test-IsHookFile {
    param([string]$fileName)
    return $fileName -match "^use[A-Z].*\.ts$"
}

function Test-IsConfigFile {
    param([string]$fileName)
    return $fileName -match "\.config\.(ts|js)$" -or $fileName -eq "i18n.ts" -or $fileName -eq "sentry.config.ts"
}

function Test-IsRouteHandler {
    param([string]$filePath, [string]$fileName)
    return $filePath -like "*/api/*" -and $fileName -eq "route.ts"
}

# ============================================
# PHASE 1: AUDIT - FIND REACT COMPONENTS
# ============================================

Write-Host "`n[PHASE 1] Auditing React components..." -ForegroundColor Yellow

# Only look at .tsx files (React components), not .ts files
$allTsxFiles = Get-ChildItem -Path src -Filter "*.tsx" -Recurse -File

$violations = @()

foreach ($file in $allTsxFiles) {
    $fileName = $file.Name
    $fullPath = $file.FullName
    $relativePath = $fullPath.Replace($PWD.Path + "\", "")
    
    # Skip exempt Next.js files
    if (Test-IsExemptFile -fileName $fileName) { continue }
    
    # Skip UI components (shadcn/ui convention)
    if (Test-IsUIComponent -filePath $relativePath) { continue }
    
    # Skip test files
    if (Test-IsTestFile -fileName $fileName) { continue }
    
    # Skip index files
    if ($fileName -match "^index\.(tsx|ts)$") { continue }
    
    # Check if starts with lowercase (not PascalCase)
    if ($fileName -cmatch "^[a-z]" -and $fileName -match "\.tsx$") {
        # Skip files in test directories
        if ($relativePath -like "*/__tests__/*") { continue }
        
        $violations += [PSCustomObject]@{
            Path = $relativePath
            Directory = [System.IO.Path]::GetDirectoryName($relativePath)
            CurrentName = $fileName
            SuggestedName = ConvertTo-PascalCase -name $fileName
            Type = "Component"
        }
    }
}

Write-Host "Found $($violations.Count) React components needing PascalCase" -ForegroundColor Green

if ($Verbose -and $violations.Count -gt 0) {
    $violations | Format-Table -AutoSize
}

# ============================================
# PHASE 2: RENAME FILES (if not dry run)
# ============================================

if (-not $DryRun -and $violations.Count -gt 0) {
    Write-Host "`n[PHASE 2] Renaming files..." -ForegroundColor Yellow
    
    foreach ($violation in $violations) {
        $oldPath = $violation.Path
        $newName = $violation.SuggestedName
        $directory = $violation.Directory
        $newPath = Join-Path $directory $newName
        
        try {
            if (Test-Path $oldPath) {
                Rename-Item -Path $oldPath -NewName $newName -Force
                Write-Host "  Renamed: $oldPath -> $newName" -ForegroundColor Green
                $filesRenamed++
            }
        }
        catch {
            $errors += "Failed to rename $oldPath : $_"
            Write-Host "  ERROR: Failed to rename $oldPath" -ForegroundColor Red
        }
    }
} elseif ($DryRun) {
    Write-Host "`n[DRY RUN] Would rename $($violations.Count) files" -ForegroundColor Magenta
    foreach ($violation in $violations) {
        Write-Host "  $($violation.CurrentName) -> $($violation.SuggestedName)" -ForegroundColor Gray
    }
}

# ============================================
# PHASE 3: UPDATE IMPORTS
# ============================================

if (-not $DryRun -and $filesRenamed -gt 0) {
    Write-Host "`n[PHASE 3] Updating imports..." -ForegroundColor Yellow
    
    # Build a map of old names to new names
    $importMap = @{}
    foreach ($violation in $violations) {
        $oldBase = $violation.CurrentName -replace "\.tsx$", ""
        $newBase = $violation.SuggestedName -replace "\.tsx$", ""
        $importMap[$oldBase] = $newBase
    }
    
    # Find all files that might have imports
    $allSourceFiles = Get-ChildItem -Path src -Include "*.tsx","*.ts","*.js","*.jsx" -Recurse -File
    
    foreach ($file in $allSourceFiles) {
        $content = Get-Content -Path $file.FullName -Raw -ErrorAction SilentlyContinue
        if (-not $content) { continue }
        
        $originalContent = $content
        $hasChanges = $false
        
        foreach ($oldName in $importMap.Keys) {
            $newName = $importMap[$oldName]
            
            # Update relative imports: from './oldName' to './newName'
            $patterns = @(
                "(from\s+['""][\.\/][^'""]*\/)$oldName(['""])",
                "(from\s+['""][\.\/])$oldName(['""])",
                "(import\s*\(\s*['""][\.\/][^'""]*\/)$oldName(['""]\s*\))",
                "(import\s*\(\s*['""][\.\/])$oldName(['""]\s*\))"
            )
            
            foreach ($pattern in $patterns) {
                $newContent = $content -replace $pattern, "`$1$newName`$2"
                if ($newContent -ne $content) {
                    $content = $newContent
                    $hasChanges = $true
                }
            }
        }
        
        if ($hasChanges) {
            Set-Content -Path $file.FullName -Value $content -NoNewline
            $relativeFile = $file.FullName.Replace($PWD.Path + '\', '')
            Write-Host "  Updated imports in: $relativeFile" -ForegroundColor Green
            $importsUpdated++
        }
    }
} elseif ($DryRun) {
    Write-Host "`n[DRY RUN] Would update imports in files referencing renamed components" -ForegroundColor Magenta
}

# ============================================
# PHASE 4: VERIFY BUILD
# ============================================

if (-not $DryRun -and $filesRenamed -gt 0) {
    Write-Host "`n[PHASE 4] Verifying build..." -ForegroundColor Yellow
    Write-Host "  Running 'npm run build'..." -ForegroundColor Gray
    
    try {
        $buildOutput = & npm run build 2>&1
        $buildExitCode = $LASTEXITCODE
        
        if ($buildExitCode -eq 0) {
            Write-Host "  Build PASSED" -ForegroundColor Green
        } else {
            Write-Host "  Build FAILED with exit code $buildExitCode" -ForegroundColor Red
            $errors += "Build failed after renaming files"
        }
    }
    catch {
        Write-Host "  Build check error: $_" -ForegroundColor Red
        $errors += "Build verification error: $_"
    }
}

# ============================================
# SUMMARY
# ============================================

$endTime = Get-Date
$duration = $endTime - $startTime

Write-Host "`n=== SUMMARY ===" -ForegroundColor Cyan
Write-Host "React components renamed: $filesRenamed" -ForegroundColor Green
Write-Host "Imports updated: $importsUpdated" -ForegroundColor Green
Write-Host "Time taken: $($duration.TotalSeconds.ToString('F2'))s" -ForegroundColor Gray

if ($errors.Count -gt 0) {
    Write-Host "`nErrors encountered:" -ForegroundColor Red
    $errors | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
}

if ($DryRun) {
    Write-Host "`nThis was a DRY RUN. No changes were made." -ForegroundColor Magenta
    Write-Host "Run without -DryRun to apply changes." -ForegroundColor Magenta
}

Write-Host "`n=== Done ===" -ForegroundColor Cyan
