/**
 * Tests for image blur placeholder utilities
 */

import {
  getBlurDataURL,
  SIMEON_BLUR_DATA_URL,
  DOCTOR_AVATAR_BLUR_DATA_URL,
  SMALL_BLUR_DATA_URL,
  LCP_DEFAULT_PROPS,
  LAZY_LOAD_PROPS,
  DOCTOR_AVATAR_SIZES,
} from '@/lib/performance/image-blur';

describe('image-blur utilities', () => {
  describe('getBlurDataURL', () => {
    it('should return simeon blur data URL for simeon type', () => {
      const result = getBlurDataURL('simeon');
      expect(result).toBe(SIMEON_BLUR_DATA_URL);
      expect(result).toContain('data:image/png;base64');
    });

    it('should return doctor-avatar blur data URL for doctor-avatar type', () => {
      const result = getBlurDataURL('doctor-avatar');
      expect(result).toBe(DOCTOR_AVATAR_BLUR_DATA_URL);
      expect(result).toContain('data:image/png;base64');
    });

    it('should return default blur data URL when no type specified', () => {
      const result = getBlurDataURL();
      expect(result).toBe(SMALL_BLUR_DATA_URL);
      expect(result).toContain('data:image/png;base64');
    });

    it('should return default blur data URL for unknown type', () => {
      const result = getBlurDataURL('default');
      expect(result).toBe(SMALL_BLUR_DATA_URL);
    });
  });

  describe('LCP_DEFAULT_PROPS', () => {
    it('should have correct properties for LCP images', () => {
      expect(LCP_DEFAULT_PROPS).toEqual({
        placeholder: 'blur',
        priority: true,
        loading: 'eager',
      });
    });
  });

  describe('LAZY_LOAD_PROPS', () => {
    it('should have correct properties for lazy-loaded images', () => {
      expect(LAZY_LOAD_PROPS).toEqual({
        placeholder: 'blur',
        priority: false,
        loading: 'lazy',
      });
    });
  });

  describe('DOCTOR_AVATAR_SIZES', () => {
    it('should have correct size values', () => {
      expect(DOCTOR_AVATAR_SIZES).toEqual({
        xs: 40,
        sm: 64,
        md: 80,
        lg: 112,
      });
    });
  });

  describe('blur data URLs', () => {
    it('all blur data URLs should be valid base64 image URLs', () => {
      const urls = [
        SIMEON_BLUR_DATA_URL,
        DOCTOR_AVATAR_BLUR_DATA_URL,
        SMALL_BLUR_DATA_URL,
      ];

      urls.forEach((url) => {
        expect(url).toMatch(/^data:image\/png;base64,[A-Za-z0-9+/=]+$/);
      });
    });

    it('all blur data URLs should start with correct data URI scheme', () => {
      expect(SIMEON_BLUR_DATA_URL.startsWith('data:image/png;base64,')).toBe(true);
      expect(DOCTOR_AVATAR_BLUR_DATA_URL.startsWith('data:image/png;base64,')).toBe(true);
      expect(SMALL_BLUR_DATA_URL.startsWith('data:image/png;base64,')).toBe(true);
    });
  });
});
