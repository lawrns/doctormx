# Doctor.mx PWA Installation Instructions

## Prerequisites

Make sure you have these packages installed:

```bash
npm install -D vite-plugin-pwa@latest workbox-window@latest
```

If you want to use the icon generation script, also install:

```bash
npm install -D sharp
```

## Step 1: Generate the PWA Icons

You have several options:

### Option A: Using the provided script

```bash
npm run generate-icons
```

This will create all required icon sizes in the `/public/icons/` directory.

### Option B: Using an online service

1. Visit a site like [PWA Builder](https://www.pwabuilder.com/imageGenerator)
2. Upload your `Doctorlogo.png` file
3. Download the generated icons and place them in `/public/icons/`

### Option C: Manual creation

Create the following icon sizes manually and place them in `/public/icons/`:
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png
- badge-96x96.png (for notifications)
- symptoms.png (192x192, for shortcuts)
- search.png (192x192, for shortcuts)

## Step 2: Build and Test

1. Build the application:
```bash
npm run build
```

2. Preview the build:
```bash
npm run preview
```

3. Test PWA functionality:
   - Use Chrome DevTools > Application > Service Workers to verify registration
   - Use Lighthouse to audit PWA features
   - Test offline functionality (Network tab > Offline)
   - Try installing the PWA from Chrome

## Troubleshooting

If you encounter the "virtual:pwa-register" import error:

1. Make sure `vite-plugin-pwa` is installed
2. Try updating to the latest version
3. Use the fallback registration provided in this implementation

If icons aren't showing up:

1. Verify all icon files exist in the correct location
2. Check the manifest.json to ensure paths are correct
3. Use Chrome DevTools to inspect any 404 errors

## Maintaining the PWA

- Update the service worker version when making significant changes
- Test offline functionality regularly
- Keep icon sizes consistent with the manifest.json declarations
