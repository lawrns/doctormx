#!/bin/bash

# DoctorMX Cleanup Script
# This script removes all non-essential files and directories
# from the DoctorMX project, keeping only the core components.

echo "Starting DoctorMX cleanup..."

# Create a backup directory
BACKUP_DIR="./backup-$(date +%Y%m%d%H%M%S)"
mkdir -p "$BACKUP_DIR"
echo "Created backup directory: $BACKUP_DIR"

# Function to backup and remove files/directories
backup_and_remove() {
  if [ -e "$1" ]; then
    echo "Backing up and removing: $1"
    cp -r "$1" "$BACKUP_DIR/" 2>/dev/null || echo "Failed to backup $1"
    rm -rf "$1"
  fi
}

# Function to backup and remove markdown files except essential ones
cleanup_md_files() {
  ESSENTIAL_MD_FILES=("README.md")
  
  find . -name "*.md" -type f | while read -r md_file; do
    # Check if this is an essential MD file
    is_essential=false
    for essential in "${ESSENTIAL_MD_FILES[@]}"; do
      if [[ "$md_file" == "./$essential" ]]; then
        is_essential=true
        break
      fi
    done
    
    if [ "$is_essential" = false ]; then
      backup_and_remove "$md_file"
    fi
  done
}

# STEP 1: REMOVE UNUSED FEATURE DIRECTORIES
echo "Removing unused feature directories..."
backup_and_remove "src/features/ai-analysis"
backup_and_remove "src/features/ai-image-analysis" 
backup_and_remove "src/features/health"
backup_and_remove "src/features/referral"
backup_and_remove "src/features/sponsorship"

# STEP 2: REMOVE UNUSED PAGES
echo "Removing unused pages..."
backup_and_remove "src/pages/AICharacterSettingsPage.tsx"
backup_and_remove "src/pages/APIKeyConfigPage.tsx"
backup_and_remove "src/pages/LabTestingLandingPage.tsx"
backup_and_remove "src/pages/LabTestingPage.tsx"
backup_and_remove "src/pages/settings"

# STEP 3: REMOVE UNUSED COMPONENTS
echo "Removing unused component directories..."
backup_and_remove "src/components/admin"
backup_and_remove "src/components/calendar"
backup_and_remove "src/components/community"
backup_and_remove "src/components/doctor"
backup_and_remove "src/components/domain"
backup_and_remove "src/components/lab"
backup_and_remove "src/components/sintomas"
backup_and_remove "src/components/subscription"
backup_and_remove "src/components/symptoms"
backup_and_remove "src/components/Footer"
backup_and_remove "src/components/Navigation"

# STEP 4: REMOVE UNUSED SERVICES
echo "Removing unused service directories..."
backup_and_remove "src/services/calendar"
backup_and_remove "src/services/domain"
backup_and_remove "src/services/knowledge"
backup_and_remove "src/services/referral"
backup_and_remove "src/services/sponsorship"
backup_and_remove "src/services/subscription"
backup_and_remove "src/services/tts"
backup_and_remove "src/services/AnalyticsService.ts"
backup_and_remove "src/services/SymptomAnalysisService.ts"
backup_and_remove "src/services/SymptomPredictionService.ts"
backup_and_remove "src/services/SymptomsApiService.ts"
backup_and_remove "src/services/TeleconsultationService.ts"
backup_and_remove "src/services/labTestingService.ts"

# STEP 5: REMOVE UNUSED SCRIPTS AND DATA
echo "Removing unused scripts and data..."
backup_and_remove "data"
backup_and_remove "database"
backup_and_remove "scripts"
backup_and_remove "src/scripts/scrapers"
backup_and_remove "src/scripts/brave-phone-finder.ts"
backup_and_remove "src/scripts/brave-search-example.ts"
backup_and_remove "src/scripts/checkBrokenLinks.ts"
backup_and_remove "src/scripts/create-excel-from-json.ts"
backup_and_remove "src/scripts/fix-excel-dedup.ts"
backup_and_remove "src/scripts/fix-excel.ts"
backup_and_remove "src/scripts/generateDoctorSitemap.ts"
backup_and_remove "src/scripts/generateSEOFiles.ts"
backup_and_remove "src/scripts/generateSitemap.ts"
backup_and_remove "src/scripts/phone-finder.ts"

# STEP 6: CLEAN UP HELPER SCRIPTS
echo "Removing build helper scripts not needed for core functionality..."
backup_and_remove "api-test.js"
backup_and_remove "dependency-fixer.js"
backup_and_remove "deploy-pwa.sh"
backup_and_remove "fix-current-scrape.sh"
backup_and_remove "fix-hydration.js"
backup_and_remove "fix-import-paths.js"
backup_and_remove "fix-react-imports.sh"
backup_and_remove "key-test.js"
backup_and_remove "local-function-test.js"
backup_and_remove "login-test.html"
backup_and_remove "postinstall.js"
backup_and_remove "progress.md"
backup_and_remove "rename-jsx-files.js"
backup_and_remove "run-all.sh"
backup_and_remove "run-full-scrape.sh"
backup_and_remove "run-scraper.sh"
backup_and_remove "scraper-config.json"
backup_and_remove "setup-new-vite.sh"
backup_and_remove "skip-rollup-native.js"
backup_and_remove "supabase"
backup_and_remove "switch-to-original.sh"
backup_and_remove "switch-to-simple.sh"
backup_and_remove "tasks"
backup_and_remove "test-write-access.txt"
backup_and_remove "use-vite-instead.jsx"
backup_and_remove "vite-cjs-fix.js"
backup_and_remove "vite-hydration-plugin.js"

# STEP 7: CLEAN UP UNUSED ASSETS
echo "Cleaning up unused assets..."
backup_and_remove "public/doctormascot.png"
backup_and_remove "public/pitch1.png"
backup_and_remove "public/pitch2.jpg"
backup_and_remove "public/connect" # Keep only if actually used
backup_and_remove "public/placeholders"
backup_and_remove "public/partners" # These might be needed by successful builds, review
backup_and_remove "public/splash"
backup_and_remove "public/vendor"
backup_and_remove "public/shims"

# STEP 8: CLEAN UP MARKDOWN AND DOCUMENTATION FILES
echo "Cleaning up markdown files except README.md..."
cleanup_md_files

# STEP 9: CLEAN UP FIXED/SAMPLE FILES
echo "Cleaning up fixed/sample files..."
find . -name "*.fixed.*" -type f -exec bash -c 'backup_and_remove "$0"' {} \;
backup_and_remove "AIDoctor.fixed.tsx" 
backup_and_remove "AIService.fixed.ts"
backup_and_remove "ChatAssistant.fixed.tsx"
backup_and_remove "ExpandedChatAssistant.fixed.tsx"

echo "Cleanup completed. All non-essential files have been backed up to $BACKUP_DIR"
echo "The project now contains only the core components."