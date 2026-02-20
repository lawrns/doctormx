/**
 * Security Tests for Safe Structured Data
 *
 * Tests XSS prevention and JSON-LD sanitization
 */

import { describe, it, expect } from 'vitest';
import {
  safeJsonLd,
  safeJsonLdRelaxed,
  isValidJsonLd,
} from '../safeStructuredData';

describe('safeStructuredData Security', () => {
  describe('XSS Prevention', () => {
    it('should strip </script> tags to prevent injection', () => {
      const maliciousData = {
        '@context': 'https://schema.org',
        '@type': 'MedicalBusiness',
        name: '</script><script>alert("XSS")</script>Malicious',
        description: 'Normal description',
      };

      const result = safeJsonLd(maliciousData);
      
      // Should strip all script tags entirely (more secure than escaping)
      expect(result).not.toContain('<script');
      expect(result).not.toContain('</script>');
      expect(result).not.toContain('alert(');
      // Content after tags should remain
      expect(result).toContain('Malicious');
      expect(result).toContain('Normal description');
    });

    it('should sanitize HTML tags from strings', () => {
      const dataWithHtml = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: '<img src=x onerror=alert("XSS")>Doctor.mx',
        description: '<script>alert("test")</script>Description',
      };

      const result = safeJsonLd(dataWithHtml);
      
      // HTML tags should be stripped
      expect(result).not.toContain('<img');
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('onerror=');
      // Content should remain
      expect(result).toContain('Doctor.mx');
      expect(result).toContain('Description');
    });

    it('should escape & to prevent HTML entity injection', () => {
      const data = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Doctor & Associates <script>',
        description: 'Test',
      };

      const result = safeJsonLd(data);
      
      expect(result).toContain('\\u0026');
      expect(result).not.toContain('& Associates'); // Should be escaped
    });

    it('should handle nested objects safely', () => {
      const nestedData = {
        '@context': 'https://schema.org',
        '@type': 'MedicalBusiness',
        name: 'Test',
        address: {
          '@type': 'PostalAddress',
          addressLocality: '<script>alert("city")</script>Ciudad',
          streetAddress: '123 <b>Bold</b> Street',
        },
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '<script>alert("phone")</script>+52-800',
        },
      };

      const result = safeJsonLd(nestedData);
      
      expect(result).not.toContain('<script>');
      expect(result).toContain('Ciudad');
      expect(result).toContain('123');
      expect(result).toContain('Bold');
      expect(result).toContain('+52-800');
    });

    it('should handle arrays safely', () => {
      const dataWithArray = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Test',
        sameAs: [
          'https://example.com/<script>alert(1)</script>',
          'https://safe.com/page',
        ],
      };

      const result = safeJsonLd(dataWithArray);
      
      expect(result).not.toContain('<script>');
      expect(result).toContain('https://example.com/');
      expect(result).toContain('https://safe.com/page');
    });
  });

  describe('Validation', () => {
    it('should throw error for missing @context', () => {
      const invalidData = {
        '@type': 'Organization',
        name: 'Test',
      };

      expect(() => safeJsonLd(invalidData)).toThrow('Invalid JSON-LD structure');
    });

    it('should throw error for missing @type', () => {
      const invalidData = {
        '@context': 'https://schema.org',
        name: 'Test',
      };

      expect(() => safeJsonLd(invalidData)).toThrow('Invalid JSON-LD structure');
    });

    it('should not throw for valid JSON-LD with relaxed mode', () => {
      const dataWithoutType = {
        name: 'Test',
        description: 'Description',
      };

      // relaxed mode doesn't validate
      expect(() => safeJsonLdRelaxed(dataWithoutType)).not.toThrow();
    });

    it('should validate correct JSON-LD structure', () => {
      const validData = {
        '@context': 'https://schema.org',
        '@type': 'MedicalBusiness',
        name: 'Doctor.mx',
      };

      expect(() => safeJsonLd(validData)).not.toThrow();
      const result = safeJsonLd(validData);
      expect(JSON.parse(result)).toEqual(validData);
    });
  });

  describe('Type Guards', () => {
    it('should identify valid JSON-LD objects', () => {
      const valid = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
      };

      expect(isValidJsonLd(valid)).toBe(true);
    });

    it('should reject invalid JSON-LD objects', () => {
      expect(isValidJsonLd(null)).toBe(false);
      expect(isValidJsonLd(undefined)).toBe(false);
      expect(isValidJsonLd('string')).toBe(false);
      expect(isValidJsonLd(123)).toBe(false);
      expect(isValidJsonLd({ name: 'test' })).toBe(false);
    });
  });

  describe('Unicode Escaping', () => {
    it('should escape line and paragraph separators', () => {
      const data = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Test\u2028Name',
        description: 'Desc\u2029ription',
      };

      const result = safeJsonLd(data);
      
      expect(result).toContain('\\u2028');
      expect(result).toContain('\\u2029');
    });
  });

  describe('CSP Compliance', () => {
    it('should produce output that works with strict CSP', () => {
      const data = {
        '@context': 'https://schema.org',
        '@type': 'MedicalBusiness',
        name: 'Doctor.mx',
        description: 'Test <b>description</b>',
      };

      const result = safeJsonLd(data);
      
      // Should not contain inline script-breakers
      expect(result).not.toMatch(/<\s*\//i); // No closing tags
      expect(result).not.toContain('javascript:');
      expect(result).not.toContain('onerror=');
      expect(result).not.toContain('onload=');
    });
  });

  describe('Real-world scenarios', () => {
    it('should handle doctor profile data safely', () => {
      const doctorData = {
        '@context': 'https://schema.org',
        '@type': 'Physician',
        name: 'Dr. Juan Pérez',
        medicalSpecialty: 'Cardiología',
        description: 'Especialista en <em>cardiología</em> intervencionista',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Ciudad de México',
          addressCountry: 'MX',
        },
      };

      const result = safeJsonLd(doctorData);
      const parsed = JSON.parse(result);

      // HTML stripped but content preserved
      expect(parsed.description).not.toContain('<em>');
      expect(parsed.description).toContain('cardiología');
      expect(parsed.name).toBe('Dr. Juan Pérez');
    });

    it('should handle city/specialty directory data', () => {
      const directoryData = {
        '@context': 'https://schema.org',
        '@type': 'MedicalBusiness',
        name: 'Cardiólogos en Ciudad de México',
        description: 'Directorio de especialistas',
        areaServed: {
          '@type': 'City',
          name: 'Ciudad de México',
        },
      };

      const result = safeJsonLd(directoryData);
      expect(() => JSON.parse(result)).not.toThrow();
    });
  });
});
