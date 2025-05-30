# DoctorMX Packages

This directory contains shared packages for the DoctorMX platform, implementing the Phase 1-4 roadmap features.

## Structure

```
packages/
├── types/           # Shared TypeScript type definitions
├── services/        # Business logic and data access services
└── prompts/         # LLM prompt templates and configurations
```

## Phase 1 Features (Implemented)

### ✅ Types (`packages/types/`)
- `herb.ts` - Medicinal herb and plant definitions
- `diagnosis.ts` - Medical analysis and symptom types
- `protocol.ts` - Treatment protocol and progress tracking
- `index.ts` - Unified type exports with feature flags

### ✅ Services (`packages/services/`)
- `HerbService.ts` - Herb database search and recommendations
- `FeatureFlagService.ts` - Gradual rollout and A/B testing
- `RedFlagDetectionService.ts` - Emergency and urgent condition detection
- `EnhancedDiagnosticService.ts` - Integrated diagnostic flow

### ✅ Prompts (`packages/prompts/`)
- `image-analysis-v2.md` - Enhanced medical image analysis
- `root-cause-analysis.md` - Holistic symptom correlation

## Usage

### Import Services
```typescript
import { herbService } from '@svc/HerbService';
import { featureFlagService } from '@svc/FeatureFlagService';
```

### Import Types
```typescript
import type { Herb, FeatureFlags, RedFlag } from '@pkg/types';
```

### Feature Flags
```typescript
// Check if feature is enabled
const herbsEnabled = await featureFlagService.isFeatureEnabled('herbDatabase', userId);

// Get all flags for user
const flags = await featureFlagService.getFeatureFlags(userId);
```

### Herb Database
```typescript
// Search herbs
const results = await herbService.searchHerbs({ 
  query: 'dolor', 
  evidenceGrade: ['A', 'B'] 
});

// Get recommendations for symptoms
const recommendations = await herbService.getRecommendationsForSymptoms([
  'dolor de cabeza', 
  'ansiedad'
]);
```

### Red Flag Detection
```typescript
// Analyze text for emergency conditions
const redFlags = redFlagDetectionService.analyzeText(
  'Tengo dolor de pecho severo y falta de aire'
);

// Analyze structured symptoms
const flags = redFlagDetectionService.analyzeSymptoms(symptoms, patientAge);
```

## Database Schema

The packages work with the following Supabase tables:

- `herbs` - Medicinal herb database
- `feature_flags` - Feature rollout control
- `symptom_reports` - User symptom data
- `diagnoses` - AI diagnostic results
- `protocols` - Treatment protocols

## Environment Setup

1. **Database Migration**:
   ```bash
   npm run db:migrate
   ```

2. **Environment Variables**:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Path Aliases** (already configured in `tsconfig.app.json`):
   ```json
   {
     "paths": {
       "@pkg/*": ["./packages/*"],
       "@svc/*": ["./packages/services/*"]
     }
   }
   ```

## Testing

Use the test component to verify integration:

```typescript
import Phase1Test from '@/components/test/Phase1Test';

// Renders test results for all Phase 1 features
<Phase1Test />
```

## Phase 2-4 Roadmap

### Phase 2 (Months 4-6) - Planned
- Constitutional analysis (Ayurvedic/metabolic typing)
- Protocol builder with multi-stage treatments
- Progress tracking dashboard
- Enhanced root cause correlation

### Phase 3 (Months 7-12) - Planned
- Knowledge graph visualization
- Evidence integration (PubMed, clinical trials)
- Expert portal for practitioner validation
- Herb database expansion (1000+ species)

### Phase 4 (Year 2) - Planned
- Community hub and patient logging
- Ethical herb marketplace
- Multilingual support
- Academic integrations

## Contributing

1. Follow existing patterns in each package
2. Add comprehensive TypeScript types
3. Include error handling and logging
4. Update this README when adding new features
5. Test integration with the main app

## Security Notes

- All services use RLS (Row Level Security) policies
- Feature flags control access to experimental features
- Red flag detection prioritizes user safety
- Herb recommendations include contraindication warnings