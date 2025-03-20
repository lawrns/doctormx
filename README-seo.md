# Doctor.mx SEO Implementation

This module contains optimized SEO components and utilities for the Doctor.mx website to maximize search engine visibility and user engagement.

## Key Components

The SEO implementation includes:

- **Enhanced SEO Components** for different page types
- **Structured Data Markup** following schema.org guidelines
- **Dynamic Sitemap Generation**
- **Optimized Robots.txt**
- **Breadcrumb Navigation** with schema markup
- **Schema Utilities** for consistent structured data

## Directory Structure

```
doctormx/
├── src/
│   ├── components/
│   │   ├── seo/
│   │   │   ├── index.tsx            # Exports all SEO components
│   │   │   ├── SEO.tsx              # Original SEO component (backward compatibility)
│   │   │   ├── EnhancedSEO.tsx      # Base enhanced SEO component
│   │   │   ├── DoctorSEO.tsx        # Doctor profile SEO
│   │   │   ├── SpecialtySEO.tsx     # Medical specialty SEO
│   │   │   ├── MedicalConditionSEO.tsx # Medical condition SEO
│   │   │   └── LocationSEO.tsx      # Location-based SEO
│   │   ├── Breadcrumbs.tsx          # Breadcrumb navigation with schema
│   ├── lib/
│   │   └── schemaGenerators.ts      # Schema.org utilities
│   ├── utils/
│   │   ├── sitemapGenerator.ts      # Sitemap generation utilities
│   │   └── robotsGenerator.ts       # Robots.txt generation utilities
│   ├── scripts/
│   │   └── generateSEOFiles.ts      # Build script for SEO files
└── SEO-IMPLEMENTATION-GUIDE.md      # Detailed implementation guide
```

## Usage Examples

### Doctor Profile Page

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

### Specialty Page

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

### Breadcrumbs Component

```tsx
import Breadcrumbs from '../components/Breadcrumbs';

<Breadcrumbs 
  items={[
    { name: 'Especialidades', url: '/especialidades' },
    { name: 'Cardiología', url: '/especialidad/cardiologia' },
    { name: currentDoctor.name, url: `/doctor/${currentDoctor.id}`, isActive: true }
  ]}
/>
```

## Generating SEO Files

To generate the sitemap and robots.txt files:

```bash
# Add to your build script
npm run build && node scripts/generateSEOFiles.js

# Or run independently
node scripts/generateSEOFiles.js
```

This will create:
- sitemap.xml
- sitemap-doctors.xml
- sitemap-specialties.xml
- sitemap-conditions.xml
- sitemap-locations.xml
- sitemap-index.xml
- robots.txt

## Structured Data Implementation

The components automatically generate appropriate schema.org structured data for:

- Physician profiles
- Medical specialties
- Medical conditions
- Location directories
- Breadcrumb navigation
- Website and organization information

## Important Notes

1. For production, replace the mock data in the sitemap generator with actual database queries
2. Test implementation with Google's Rich Results Test and Schema Validator
3. Monitor performance in Google Search Console
4. Follow the detailed guidelines in SEO-IMPLEMENTATION-GUIDE.md

## Resources

For more detailed implementation instructions, see the [SEO Implementation Guide](./SEO-IMPLEMENTATION-GUIDE.md).
