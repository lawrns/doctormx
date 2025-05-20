# Manual PWA Implementation Guide for Doctor.mx

This guide provides instructions for implementing and testing the Progressive Web App (PWA) features in Doctor.mx without relying on the `vite-plugin-pwa` package.

## Overview

Instead of using the Vite PWA plugin, we've implemented a manual approach that registers a service worker directly. This avoids the issue with the virtual module imports.

## Key Files

1. **`/public/sw.js`**: The service worker script that manages caching and offline functionality
2. **`/public/manifest.json`**: The Web App Manifest file that defines app metadata
3. **`/src/pwa/registerSW.ts`**: The service worker registration module
4. **`/public/offline.html`**: Fallback page shown when offline
5. **`/public/icons/`**: Directory containing PWA icons

## How It Works

1. When the app loads, it calls `registerServiceWorker()` from `src/pwa/registerSW.ts`
2. This function registers the service worker at `/public/sw.js`
3. The service worker caches essential files and handles offline functionality
4. When updates are available, it shows a notification to the user

## Setting Up Icons

First, you need to generate all the icon sizes required by the PWA. You can run:

```bash
npm run generate-icons
```

This will create all the needed icon sizes in `/public/icons/`.

## Testing the PWA

1. **Build the app**:
   ```bash
   npm run build
   ```

2. **Serve the built app** (required for service workers):
   ```bash
   npm run preview
   ```

3. **Check service worker registration**:
   - Open Chrome DevTools (F12)
   - Go to Application > Service Workers
   - Verify that the service worker is registered and active

4. **Test offline functionality**:
   - In Chrome DevTools, go to Network tab
   - Check "Offline" checkbox
   - Reload the page
   - You should see the offline fallback page or cached content

5. **Test installation**:
   - In Chrome, click the install icon in the address bar
   - Or go to menu > Install Doctor.mx...

## Troubleshooting

### Service Worker Not Registering

1. Make sure you're using HTTPS or localhost (service workers require secure origins)
2. Check browser console for errors
3. Verify that `sw.js` is accessible at the root path

### Icons Not Showing

1. Verify that all icon files exist in `/public/icons/`
2. Check that manifest.json correctly references these icon paths
3. Use Chrome Lighthouse to audit PWA features

### PWA Not Installable

PWA installation requires:
1. Valid manifest.json
2. Registered service worker
3. HTTPS
4. At least one 192x192 icon
5. A display mode other than "browser"

## Manual Updates

If you need to force users to get the latest version:

1. Change the `CACHE_NAME` in `sw.js`
2. This will trigger cache cleaning on next activation

## References

- [MDN: Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Chrome DevTools for PWA](https://developers.google.com/web/tools/chrome-devtools/progressive-web-apps)
