# DoctorMX Developer Scripts

This directory contains useful scripts for development and maintenance of the DoctorMX application.

## Icon Import Checker

### Purpose

The `check-icons.js` script helps prevent errors related to missing Lucide React icon imports. It scans all React components in the project and identifies components where icons are used but not properly imported.

### Background

In React components, when using icons from the Lucide React library, each icon must be explicitly imported at the top of the file. This script helps prevent "X is not defined" errors that happen when an icon component is used without being imported.

### Usage

Run the script in check mode to identify components with missing icon imports:

```bash
node scripts/check-icons.js
```

Run with the `--fix` flag to automatically fix missing imports:

```bash
node scripts/check-icons.js --fix
```

### Example Output

```
Scanning for React components...
Found 87 React components
Checking for missing icon imports...

[src/pages/doctor/AppointmentsPage.tsx]
  Missing icons: Calendar, Mail
  Run with --fix to automatically add the missing imports

[src/pages/doctor/EnhancedTelemedicineConsultationPage.tsx]
  Missing icons: Mail
  Run with --fix to automatically add the missing imports

⚠️ Found 2 components with missing icon imports
Run with --fix to automatically fix the issues
```

### Adding to Your Workflow

For best results, consider:

1. Running this script as part of your pre-commit hook
2. Running this script in your CI/CD pipeline 
3. Running this script periodically during development

## Tips for Avoiding Icon Import Errors

1. Always import any Lucide icons you use at the top of your component:
   ```typescript
   import { Calendar, Mail, User } from 'lucide-react';
   ```

2. When adding a new icon to a component, immediately add it to the imports.

3. Use autocomplete in your IDE to help with importing icons.

4. Run the icon checker script if you encounter any "X is not defined" errors related to icons.
