#!/bin/bash

# Doctor.mx - Quick Fix Script
# Adds Layout wrapper to all components that need it

echo "🔧 Doctor.mx Layout Fix Script"
echo "================================"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Files to fix
declare -a FILES=(
  "src/components/HealthCommunity.jsx"
  "src/components/HealthMarketplace.jsx"
  "src/components/GamificationDashboard.jsx"
  "src/components/AIReferralSystem.jsx"
  "src/components/EnhancedDoctorPanel.jsx"
  "src/components/QABoard.jsx"
  "src/components/FAQ.jsx"
  "src/components/HealthBlog.jsx"
  "src/components/ExpertQA.jsx"
  "src/components/DoctorDashboard.jsx"
  "src/components/AffiliateDashboard.jsx"
  "src/components/SubscriptionPlans.jsx"
)

# Backup directory
BACKUP_DIR="backups/layout-fix-$(date +%Y%m%d-%H%M%S)"

echo "Creating backup directory: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

# Counter for statistics
FIXED=0
SKIPPED=0
ERRORS=0

# Function to add Layout wrapper to a component
fix_component() {
  local file=$1
  local filename=$(basename "$file")
  
  echo -n "Processing $filename... "
  
  # Check if file exists
  if [ ! -f "$file" ]; then
    echo -e "${RED}NOT FOUND${NC}"
    ((ERRORS++))
    return 1
  fi
  
  # Check if already has Layout import
  if grep -q "import Layout from" "$file"; then
    echo -e "${YELLOW}SKIP (already has Layout)${NC}"
    ((SKIPPED++))
    return 0
  fi
  
  # Create backup
  cp "$file" "$BACKUP_DIR/$filename"
  
  # Create temporary file
  TEMP_FILE=$(mktemp)
  
  # Add Layout import after other imports
  awk '
    BEGIN { import_added = 0; in_imports = 0; }
    
    # Detect import section
    /^import / { in_imports = 1; print; next; }
    
    # After imports end, add Layout import
    in_imports == 1 && !/^import / && import_added == 0 {
      print "import Layout from \"./Layout\";\n";
      import_added = 1;
      in_imports = 0;
    }
    
    # Print all other lines
    { print; }
  ' "$file" > "$TEMP_FILE"
  
  # Now wrap the return statement
  # This is a simplified version - may need manual adjustment for complex returns
  sed -i.bak '/^export default function/,/^}$/ {
    /return ($/,/^  );$/ {
      /return ($/ {
        a\    <Layout>
      }
      /^  );$/ {
        i\    </Layout>
      }
    }
  }' "$TEMP_FILE"
  
  # Move temp file to original
  mv "$TEMP_FILE" "$file"
  rm -f "$TEMP_FILE.bak"
  
  echo -e "${GREEN}FIXED${NC}"
  ((FIXED++))
}

# Process all files
echo ""
echo "Processing files..."
echo "-------------------"

for file in "${FILES[@]}"; do
  fix_component "$file"
done

# Summary
echo ""
echo "================================"
echo "📊 Summary"
echo "================================"
echo -e "${GREEN}Fixed:${NC} $FIXED"
echo -e "${YELLOW}Skipped:${NC} $SKIPPED"
echo -e "${RED}Errors:${NC} $ERRORS"
echo ""
echo "Backups saved to: $BACKUP_DIR"
echo ""

if [ $FIXED -gt 0 ]; then
  echo -e "${GREEN}✅ Success!${NC} Layout wrapper added to $FIXED components."
  echo ""
  echo "⚠️  IMPORTANT: Please review the changes manually!"
  echo "Some components may need manual adjustment if they have"
  echo "complex return statements or multiple return paths."
  echo ""
  echo "Next steps:"
  echo "1. Review the changes with: git diff"
  echo "2. Test each route in your browser"
  echo "3. If issues found, restore from backup: $BACKUP_DIR"
  echo "4. Commit changes when satisfied"
fi

if [ $ERRORS -gt 0 ]; then
  echo -e "${RED}⚠️  Warning:${NC} $ERRORS files had errors."
  echo "Please check the output above and fix manually."
fi

echo ""
echo "🔍 To verify the fix, test these routes in your browser:"
echo "   /community"
echo "   /marketplace"
echo "   /gamification"
echo "   /ai-referrals"
echo "   /doctor-panel"
echo "   /blog"
echo "   /faq"
echo "   /expert-qa"
echo ""
echo "Each should now display the navigation bar at the top."
echo ""
