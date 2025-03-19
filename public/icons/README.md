# PWA Icons

This directory should contain the following icon files for the Doctor.mx PWA:

- icon-72x72.png (already exists)
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png
- badge-96x96.png (for notifications)
- symptoms.png (for shortcuts)
- search.png (for shortcuts)

## How to Generate Icons

You can generate these icons from your source logo using:

1. The script in `src/scripts/generate-icons.js` 
2. Or tools like:
   - [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)
   - [RealFaviconGenerator](https://realfavicongenerator.net/)
   - [Maskable.app](https://maskable.app/)

Make sure all icons match the sizes specified in the manifest.json and vite.config.ts files.
