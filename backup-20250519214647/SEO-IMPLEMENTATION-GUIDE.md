# Doctor.mx SEO Implementation Guide

This document outlines the comprehensive SEO strategy for Doctor.mx and provides implementation guidelines for developers and content managers.

## Table of Contents

1. [Overview](#overview)
2. [Component Implementation](#component-implementation)
3. [Content Optimization](#content-optimization)
4. [Technical SEO Implementation](#technical-seo-implementation)
5. [Monitoring and Maintenance](#monitoring-and-maintenance)
6. [Key Performance Indicators](#key-performance-indicators)

## Overview

The Doctor.mx SEO strategy focuses on optimizing several key areas:

- **Structured Data:** Implementation of schema.org markup for medical entities
- **Metadata:** Enhanced meta tags for better search visibility
- **URL Structure:** Consistent, keyword-rich URLs across the site
- **Content Strategy:** High-quality, localizable medical content
- **Technical SEO:** Site speed, mobile optimization, sitemaps, and robots.txt
- **Local SEO:** Optimization for location-based searches

## Component Implementation

### SEO Components

We've created specialized SEO components for different page types:

- `EnhancedSEO.tsx`: Base component with improved metadata
- `DoctorSEO.tsx`: For doctor profile pages
- `SpecialtySEO.tsx`: For medical specialty pages
- `MedicalConditionSEO.tsx`: For condition/disease pages
- `LocationSEO.tsx`: For location-based doctor directories

### Usage Examples

#### Doctor Profile Page

```tsx
import { DoctorSEO } from '../components/seo';

function DoctorProfilePage() {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  
  // Fetch doctor data...
  
  return (
    <div>
      {doctor && (
        <DoctorSEO
          doctor={doctor}
          url={`/doctor/${id}`}
        />
      )}
      
      {/* Page content */}
    </div>
  );
}
```

#### Specialty Page

```tsx
import { SpecialtySEO } from '../components/seo';

function SpecialtyPage() {
  const { specialtySlug, locationSlug } = useParams();
  const [specialty, setSpecialty] = useState(null);
  const [location, setLocation] = useState(null);
  
  // Fetch data...
  
  return (
    <div>
      {specialty && (
        <SpecialtySEO
          specialty={specialty}
          location={location}
        />
      )}
      
      {/* Page content */}
    </div>
  );
}
```

### Breadcrumbs Implementation

Always include breadcrumbs on internal pages:

```tsx
import Breadcrumbs from '../components/Breadcrumbs';

// In your page component:
<Breadcrumbs 
  items={[
    { name: 'Especialidades', url: '/especialidades' },
    { name: 'Cardiología', url: '/especialidad/cardiologia' },
    { name: 'Dr. Juan Pérez', url: '/doctor/dr-juan-perez', isActive: true }
  ]}
/>
```

## Content Optimization

### Meta Title Format

Use these formats for consistent, keyword-rich titles:

- **Doctor Profiles:** `[Dr. Name] - [Specialty] en [Location] | Doctor.mx`
- **Specialty Pages:** `Mejores [Specialty] en [Location] ([X]+ Especialistas) | Doctor.mx`
- **Condition Pages:** `[Condition] - Síntomas, Causas, Tratamientos y Especialistas | Doctor.mx`
- **Location Pages:** `Médicos en [Location] | [X]+ Especialidades | Doctor.mx`

### Meta Description Guidelines

- Include primary keywords near the beginning
- Keep between 140-160 characters
- Include a clear call-to-action when appropriate
- Mention unique value propositions (e.g., "Agenda online", "Telemedicina disponible")

### URL Structure

Follow these URL patterns:

- Doctor profiles: `/doctor/[slug]`
- Specialties: `/especialidad/[specialty-slug]`
- Specialties in location: `/especialidad/[specialty-slug]/[location-slug]`
- Conditions: `/padecimiento/[condition-slug]`
- Locations: `/ubicacion/[location-slug]`

### Content Guidelines

1. **Doctor Profiles:**
   - Include comprehensive doctor bios (300+ words)
   - List education, certifications, and specializations
   - Add detailed services offered
   - Include patient testimonials where available

2. **Specialty Pages:**
   - Provide detailed explanation of the specialty
   - Include common conditions treated
   - Describe typical procedures
   - Add FAQs specific to the specialty

3. **Condition Pages:**
   - Explain symptoms, causes, and treatments
   - Link to relevant specialties
   - Include prevention information
   - Add statistics on prevalence when available

## Technical SEO Implementation

### Build Process Integration

1. Add the SEO file generation to your build pipeline:

```json
// In package.json
{
  "scripts": {
    "build": "react-scripts build && node dist/scripts/generateSEOFiles.js",
    "generate-seo": "node dist/scripts/generateSEOFiles.js"
  }
}
```

2. Ensure the `public` directory is writable during build

### Sitemap Implementation

The sitemap generation is handled by `src/scripts/generateSEOFiles.ts` which creates:

- `sitemap.xml`: Main site pages
- `sitemap-doctors.xml`: Doctor profile pages
- `sitemap-specialties.xml`: Specialty pages
- `sitemap-conditions.xml`: Medical condition pages
- `sitemap-locations.xml`: Location directory pages
- `sitemap-index.xml`: Index of all sitemaps

In production, replace the mock data with database queries.

### Robots.txt Implementation

The `robots.txt` file is automatically generated during build with proper directives.

### Page Speed Optimization

Implement these optimizations:

1. **Image Optimization:**
   - Use WebP format
   - Implement lazy loading with the `LazyImage` component
   - Set appropriate sizes for doctor profile images

2. **JavaScript Optimization:**
   - Implement code splitting by route
   - Defer non-critical JavaScript

3. **CSS Optimization:**
   - Extract critical CSS for above-the-fold content
   - Minimize unused CSS

4. **Server Performance:**
   - Implement proper caching headers
   - Use a CDN for static assets

### Mobile Optimization

1. Use responsive design throughout the site
2. Optimize tap targets for mobile
3. Test on multiple device sizes

## Monitoring and Maintenance

### Regular Tasks

1. Monitor Google Search Console for issues
2. Verify structured data using Google's Rich Results Test
3. Update sitemaps monthly with new content
4. Monitor and fix crawl errors

### Tracking Implementation

Add Google Tag Manager and configure:

1. Google Analytics 4
2. Enhanced ecommerce for appointment bookings
3. Event tracking for doctor profile interactions

## Key Performance Indicators

Monitor these metrics to evaluate SEO performance:

1. **Visibility Metrics:**
   - Organic search traffic
   - Keyword rankings
   - SERP click-through rates

2. **Technical Metrics:**
   - Core Web Vitals
   - Crawl stats
   - Indexing coverage

3. **Business Metrics:**
   - Appointment bookings
   - Doctor profile views
   - Specialty page conversion rates

---

## Implementation Timeline

| Phase | Tasks | Timeline |
|-------|-------|----------|
| 1 | Implement SEO components | Week 1-2 |
| 2 | Update metadata on key pages | Week 2-3 |
| 3 | Implement schema.org markup | Week 3-4 |
| 4 | Implement sitemaps and robots.txt | Week 4 |
| 5 | Technical optimization | Week 5-6 |
| 6 | Content upgrades | Week 7-8 |
| 7 | Testing and monitoring setup | Week 9 |

## Resources

- [Schema.org Medical Types](https://schema.org/docs/meddocs.html)
- [Google Search Central](https://developers.google.com/search)
- [Structured Data Testing Tool](https://validator.schema.org/)
- [Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)
