/**
 * Responsive utility functions for doctormx
 */

/**
 * Detects if the current device is a mobile device based on screen size and user agent
 * @returns {boolean} True if the device is mobile
 */
export const isMobileDevice = (): boolean => {
  const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
  const isMobileWidth = window.innerWidth < 768;
  
  return isMobileUserAgent || isMobileWidth;
};

/**
 * Detects if the current device is low-end (limited resources)
 * @returns {boolean} True if the device is considered low-end
 */
export const isLowEndDevice = (): boolean => {
  // Check memory (if available in browser)
  const hasLowMemory = navigator.deviceMemory ? navigator.deviceMemory < 4 : false;
  
  // Check CPU cores (if available)
  const hasLowCPU = navigator.hardwareConcurrency ? navigator.hardwareConcurrency < 4 : false;
  
  // Check if the device is mobile
  const isMobile = isMobileDevice();
  
  // On mobile, we'll be more strict about what we consider "low-end"
  if (isMobile) {
    return hasLowMemory || hasLowCPU || window.innerWidth < 375;
  }
  
  // For desktops, only if both memory and CPU are low
  return hasLowMemory && hasLowCPU;
};

/**
 * Checks if 3D/WebGL is supported in the current browser
 * @returns {boolean} True if WebGL is supported
 */
export const isWebGLSupported = (): boolean => {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch (e) {
    return false;
  }
};

/**
 * Determines if advanced UI should be used based on device capabilities
 * @returns {boolean} True if advanced UI should be used
 */
export const shouldUseAdvancedUI = (): boolean => {
  // Don't use advanced UI on mobile or low-end devices
  if (isMobileDevice() || isLowEndDevice()) {
    return false;
  }
  
  // Check if 3D is supported for advanced UI features
  return isWebGLSupported();
};

/**
 * Gets appropriate font size class based on screen size
 * @returns {string} CSS class for font sizing
 */
export const getResponsiveFontClass = (): string => {
  if (window.innerWidth < 375) {
    return 'xs-screen-adjust'; // Very small screens
  } else if (window.innerWidth < 640) {
    return 'text-sm'; // Small mobile
  } else {
    return ''; // Default size
  }
};

/**
 * Adds a window resize listener with debounce
 * @param callback Function to call on resize
 * @param delay Debounce delay in ms
 * @returns Cleanup function
 */
export const addResizeListener = (
  callback: () => void,
  delay: number = 250
): () => void => {
  let timeoutId: number;
  
  const handleResize = () => {
    clearTimeout(timeoutId);
    timeoutId = window.setTimeout(callback, delay);
  };
  
  window.addEventListener('resize', handleResize);
  
  // Return cleanup function
  return () => {
    clearTimeout(timeoutId);
    window.removeEventListener('resize', handleResize);
  };
};

/**
 * Gets appropriate SVG scale for body visualization based on screen size
 * @returns {number} Scale factor for SVG
 */
export const getBodyVisualizationScale = (): number => {
  if (window.innerWidth < 375) {
    return 0.8; // Very small screens
  } else if (window.innerWidth < 640) {
    return 0.9; // Small mobile
  } else {
    return 1; // Default scale
  }
};
