# Content Security Policy (CSP) Reference

## Quick Reference

This document provides a quick reference for the CSP policy implemented in Doctor.mx.

## Policy Summary

The CSP is designed to be secure while allowing necessary third-party services for a healthcare platform.

## Directives Explained

### default-src 'self'
- **Fallback** for all other directives
- Only allows resources from the same origin

### script-src 'self' 'unsafe-eval' 'unsafe-inline' *.stripe.com...
- **JavaScript sources**
- Allows inline scripts and eval (necessary for Next.js development)
- Permits Stripe scripts and jsDelivr CDN

### style-src 'self' 'unsafe-inline' *.googleapis.com...
- **CSS sources**
- Allows inline styles (necessary for Next.js and Tailwind)
- Permits Google Fonts

### img-src 'self' data: blob: *.stripe.com...
- **Image sources**
- Allows data URIs and blobs (necessary for profile uploads)
- Permits user avatars from multiple sources

### font-src 'self' *.googleapis.com...
- **Font sources**
- Only allows Google Fonts

### connect-src 'self' *.supabase.co *.stripe.com...
- **API/Fetch/XHR/WebSocket sources**
- Critical for backend communication
- Allows Supabase, Stripe, and video services

### frame-src 'self' *.stripe.com...
- **Frame/iframe sources**
- Necessary for Stripe Elements
- Allows Jitsi Meet and Daily.co for video calls

### object-src 'none'
- **Plugin sources**
- Completely blocks plugins (Flash, Java, etc.)

### base-uri 'self'
- **Base URL restrictions**
- Prevents base tag injection attacks

### form-action 'self'
- **Form submission targets**
- Prevents forms from submitting to external sites

### frame-ancestors 'self'
- **Who can frame this site**
- Prevents clickjacking from external sites

### upgrade-insecure-requests
- **Automatic HTTPS upgrade**
- Upgrades all HTTP requests to HTTPS

## Allowed Domains by Service

| Service | Domains | Purpose |
|---------|---------|---------|
| Stripe | *.stripe.com, *.stripe.network, js.stripe.com, api.stripe.com, hooks.stripe.com | Payment processing |
| Supabase | *.supabase.co | Backend & auth |
| Video | meet.jit.si, *.daily.co | Consultation calls |
| Fonts | *.googleapis.com, *.gstatic.com | Typography |
| Images | *.googleusercontent.com, images.unsplash.com, avatars.githubusercontent.com, res.cloudinary.com, i.pravatar.cc | User avatars & media |
| CDN | cdn.jsdelivr.net | Third-party libraries |

## CSP Violation Troubleshooting

If you see CSP violations in the console:

1. **Identify the blocked resource** from the error message
2. **Find the directive** that blocked it (e.g., script-src, connect-src)
3. **Add the domain** to the appropriate directive in next.config.ts
4. **Restart the dev server** for changes to take effect

## Security vs. Usability

This CSP strikes a balance between:

**Security:**
- Prevents XSS attacks
- Blocks mixed content
- Restricts data exfiltration
- Prevents clickjacking

**Usability:**
- Allows necessary third-party services
- Supports development workflow
- Maintains all platform features

## Production Considerations

1. **Monitor CSP violations** for the first few weeks
2. **Consider implementing CSP reporting** for production
3. **Gradually remove 'unsafe-inline'** if using nonce-based approach
4. **Review and update** as third-party services change

---

Last Updated: 2025-02-09
