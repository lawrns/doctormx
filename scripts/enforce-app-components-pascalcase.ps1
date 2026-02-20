#!/usr/bin/env pwsh
# ARCH-002: Rename app-level React components to PascalCase

param(
    [switch]$DryRun = $false
)

$startTime = Get-Date
$filesRenamed = 0
$importsUpdated = 0

Write-Host "=== ARCH-002: App Components PascalCase Enforcement ===" -ForegroundColor Cyan

# Files to rename (app-level components, not UI components)
$filesToRename = @(
    # Client components
    @{ Old = "src/app/app/ai-consulta/ai-consulta-client.tsx"; New = "AiConsultaClient.tsx" },
    @{ Old = "src/app/app/consent/consent-client.tsx"; New = "ConsentClient.tsx" },
    @{ Old = "src/app/app/consent/new/new-consent-client.tsx"; New = "NewConsentClient.tsx" },
    @{ Old = "src/app/app/consent/[id]/consent-detail-client.tsx"; New = "ConsentDetailClient.tsx" },
    @{ Old = "src/app/app/data-rights/data-rights-client.tsx"; New = "DataRightsClient.tsx" },
    @{ Old = "src/app/app/data-rights/new/new-arco-request-client.tsx"; New = "NewArcoRequestClient.tsx" },
    @{ Old = "src/app/app/data-rights/[id]/arco-request-detail-client.tsx"; New = "ArcoRequestDetailClient.tsx" },
    @{ Old = "src/app/doctor/prescription/[appointmentId]/prescription-form.tsx"; New = "PrescriptionForm.tsx" },
    
    # Animation components  
    @{ Old = "src/components/animations/advanced-animations.tsx"; New = "AdvancedAnimations.tsx" },
    @{ Old = "src/components/animations/dynamic.tsx"; New = "Dynamic.tsx" },
    @{ Old = "src/components/animations/index-optimized.tsx"; New = "IndexOptimized.tsx" },
    @{ Old = "src/components/animations/lazy-motion.tsx"; New = "LazyMotion.tsx" },
    
    # SOAP components
    @{ Old = "src/components/soap/index.dynamic.tsx"; New = "IndexDynamic.tsx" }
)

$renameMap = @{}

# ============================================
# PHASE 1: RENAME FILES
# ============================================

Write-Host "`n[PHASE 1] Renaming files..." -ForegroundColor Yellow

foreach ($file in $filesToRename) {
    $oldPath = $file.Old
    $newName = $file.New
    
    if (Test-Path $oldPath) {
        $directory = [System.IO.Path]::GetDirectoryName($oldPath)
        $newPath = Join-Path $directory $newName
        
        if (-not $DryRun) {
            try {
                Rename-Item -Path $oldPath -NewName $newName -Force
                Write-Host "  Renamed: $oldPath -> $newName" -ForegroundColor Green
                $filesRenamed++
                
                # Store old base name to new base name for import updates
                $oldBase = [System.IO.Path]::GetFileNameWithoutExtension($oldPath)
                $newBase = [System.IO.Path]::GetFileNameWithoutExtension($newName)
                $renameMap[$oldBase] = $newBase
            }
            catch {
                Write-Host "  ERROR: Failed to rename $oldPath - $_" -ForegroundColor Red
            }
        } else {
            Write-Host "  [DRY RUN] Would rename: $oldPath -> $newName" -ForegroundColor Gray
            $filesRenamed++
            
            $oldBase = [System.IO.Path]::GetFileNameWithoutExtension($oldPath)
            $newBase = [System.IO.Path]::GetFileNameWithoutExtension($newName)
            $renameMap[$oldBase] = $newBase
        }
    } else {
        Write-Host "  WARNING: File not found: $oldPath" -ForegroundColor Yellow
    }
}

# ============================================
# PHASE 2: UPDATE IMPORTS
# ============================================

if ($filesRenamed -gt 0) {
    Write-Host "`n[PHASE 2] Updating imports..." -ForegroundColor Yellow
    
    if (-not $DryRun) {
        $allSourceFiles = Get-ChildItem -Path src -Include "*.tsx","*.ts" -Recurse -File
        
        foreach ($sourceFile in $allSourceFiles) {
            $content = Get-Content -Path $sourceFile.FullName -Raw -ErrorAction SilentlyContinue
            if (-not $content) { continue }
            
            $originalContent = $content
            $hasChanges = $false
            
            foreach ($oldBase in $renameMap.Keys) {
                $newBase = $renameMap[$oldBase]
                
                # Update various import patterns
                $patterns = @(
                    # from './oldBase' or from '../path/oldBase'
                    "(from\s+['""][^'""]*\/)$oldBase(['""])",
                    # dynamic imports
                    "(import\s*\(\s*['""][^'""]*\/)$oldBase(['""]\s*\))"
                )
                
                foreach ($pattern in $patterns) {
                    $newContent = $content -replace $pattern, "`$1$newBase`$2"
                    if ($newContent -ne $content) {
                        $content = $newContent
                        $hasChanges = $true
                    }
                }
            }
            
            if ($hasChanges) {
                Set-Content -Path $sourceFile.FullName -Value $content -NoNewline
                $relativeFile = $sourceFile.FullName.Replace($PWD.Path + '\', '')
                Write-Host "  Updated: $relativeFile" -ForegroundColor Green
                $importsUpdated++
            }
        }
    } else {
        Write-Host "  [DRY RUN] Would update imports in files referencing renamed components" -ForegroundColor Gray
    }
}

# ============================================
# PHASE 3: VERIFY BUILD (if not dry run)
# ============================================

if (-not $DryRun -and $filesRenamed -gt 0) {
    Write-Host "`n[PHASE 3] Verifying build..." -ForegroundColor Yellow
    Write-Host "  Running build check..." -ForegroundColor Gray
    
    try {
        $buildOutput = & npm run build 2>&1 | Select-Object -Last 20
        $buildExitCode = $LASTEXITCODE
        
        if ($buildExitCode -eq 0) {
            Write-Host "  Build PASSED" -ForegroundColor Green
        } else {
            Write-Host "  Build FAILED (exit code: $buildExitCode)" -ForegroundColor Red
            Write-Host "  Build output:" -ForegroundColor Gray
            $buildOutput | ForEach-Object { Write-Host "    $_" -ForegroundColor Gray }
        }
    }
    catch {
        Write-Host "  Build check error: $_" -ForegroundColor Red
    }
}

# ============================================
# SUMMARY
# ============================================

$endTime = Get-Date
$duration = $endTime - $startTime

Write-Host "`n=== SUMMARY ===" -ForegroundColor Cyan
Write-Host "Files renamed: $filesRenamed" -ForegroundColor Green
Write-Host "Imports updated: $importsUpdated" -ForegroundColor Green
Write-Host "Time taken: $($duration.TotalSeconds.ToString('F2'))s" -ForegroundColor Gray

if ($DryRun) {
    Write-Host "`nThis was a DRY RUN. Run without -DryRun to apply changes." -ForegroundColor Magenta
}

Write-Host "`n=== Done ===" -ForegroundColor Cyan
