// PWA type definitions for Doctor.mx
// Used to define extended window properties

// Define the window interface extension for service worker registration
interface Window {
  __SW_REGISTRATION?: ServiceWorkerRegistration;
  gtag?: (event: string, action: string, params?: any) => void;
}
