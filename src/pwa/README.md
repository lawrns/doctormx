# Doctor.mx PWA Implementation

This document describes the Progressive Web App (PWA) implementation for Doctor.mx.

## Overview

The Doctor.mx PWA is implemented using:

- **Vite PWA Plugin**: For service worker generation and registration
- **Workbox**: For caching strategies and offline support
- **React Context**: For PWA state management and user interface components

## Key Files

- **`/src/pwa/sw.js`**: Service worker implementation using Workbox
- **`/src/pwa/registerSW.ts`**: Service worker registration and update handling
- **`/src/pwa/PwaContext.tsx`**: React context for PWA state management
- **`/src/pwa/components/`**: UI components for PWA features
- **`/public/manifest.json`**: Web app manifest file
- **`/public/offline.html`**: Offline fallback page
- **`/public/icons/`**: PWA icons in various sizes

## Features

- **Offline Support**: Works without an internet connection
- **Installable**: Can be installed on desktop and mobile devices
- **Caching Strategies**:
  - Static assets (CSS, JS, images): Cache first with network fallback
  - API calls: Stale-while-revalidate for freshness
  - HTML navigation: Network first with cache fallback
- **Background Sync**: Form submissions work offline and sync when online
- **Update Flow**: Detects new versions and prompts the user to update
- **Offline UI**: Shows indicators when offline and provides fallbacks

## Usage in Components

To access PWA features in your components:

```jsx
import { usePwa } from '../../pwa/PwaContext';

function MyComponent() {
  const { isOnline, isStandalone, promptInstall } = usePwa();
  
  return (
    <div>
      {!isOnline && <p>You are currently offline</p>}
      {!isStandalone && (
        <button onClick={promptInstall}>
          Install App
        </button>
      )}
    </div>
  );
}
```

## Testing PWA Features

1. **Offline Testing**: Use Chrome DevTools > Network > Offline
2. **Installation**: Chrome > Settings > Install app
3. **Updates**: Make a change, build, and observe the update flow

## Troubleshooting

- **Service Worker Not Registering**: Check the console for errors
- **Updates Not Appearing**: May need to clear caches in DevTools
- **Icons Not Showing**: Ensure all icon sizes exist in `/public/icons/`

## Caching Configuration

The service worker uses these caching strategies:

- **Precache**: Critical assets needed for the app shell
- **Runtime Caching**:
  - Google Fonts: Cache-first (1 year)
  - Images: Cache-first (30 days)
  - API Data: Stale-while-revalidate (2 hours)
  - Navigation: Network-first with timeout

## Further Improvements

- Add analytics for PWA usage/installations
- Improve offline data synchronization
- Add periodic background sync for fresh data
- Implement push notifications with FCM
