/**
 * Image blur placeholder utilities for LCP optimization
 * 
 * This module provides blur data URLs for images to improve LCP (Largest Contentful Paint)
 * by showing a placeholder while the actual image loads.
 */

// Blur data URL for the Dr. Simeon avatar (generated from simeon.png)
// This is a 20x20 pixel base64 encoded PNG blur placeholder
export const SIMEON_BLUR_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABCSURBVHgBZczBCQAxDERRx5VbN9mE/VdmE5ZgC+EnJDP5T+T9ZkaqCjvXNdV1Q8wwM1RVVBXujojAzBARiAhmhoiw992/cg0OZyW5JsQAAAAASUVORK5CYII=';

// Generic blur placeholder for doctor avatars (light blue gradient)
export const DOCTOR_AVATAR_BLUR_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAA0SURBVHgBjcoxDQAgCERR71/s5Gzs7F7jAyEkJ5CZ/K/p+rYhIoi5qCpmhpkhIoh5c3cQEcy8AS6vBA+hX1QaAAAAAElFTkSuQmCC';

// Alternative smaller blur placeholder (10x10)
export const SMALL_BLUR_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAZSURBVHgBxcoxDQAAAIPR/qM0VHbQ0NmLA4yxC6eEnbGqAAAAAElFTkSuQmCC';

/**
 * Generates a blur data URL for an image path
 * For static imports, Next.js automatically handles this
 * For dynamic images, use the pre-defined blur data URLs above
 */
export function getBlurDataURL(
  type: 'simeon' | 'doctor-avatar' | 'default' = 'default'
): string {
  switch (type) {
    case 'simeon':
      return SIMEON_BLUR_DATA_URL;
    case 'doctor-avatar':
      return DOCTOR_AVATAR_BLUR_DATA_URL;
    default:
      return SMALL_BLUR_DATA_URL;
  }
}

/**
 * Common image sizes for doctor avatars to optimize LCP
 */
export const DOCTOR_AVATAR_SIZES = {
  xs: 40,   // Small avatars
  sm: 64,   // List view
  md: 80,   // Hero section
  lg: 112,  // Profile page
};

/**
 * Next.js Image props for LCP optimized images
 */
export interface LCPImageProps {
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  priority?: boolean;
  loading?: 'eager' | 'lazy';
}

/**
 * Default props for LCP images (above the fold)
 */
export const LCP_DEFAULT_PROPS: LCPImageProps = {
  placeholder: 'blur',
  priority: true,
  loading: 'eager',
};

/**
 * Default props for below the fold images
 */
export const LAZY_LOAD_PROPS: LCPImageProps = {
  placeholder: 'blur',
  priority: false,
  loading: 'lazy',
};
