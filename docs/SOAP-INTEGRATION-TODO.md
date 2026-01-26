# SOAP Multi-Agent Integration - Implementation TODO

## Status

✅ **Backend**: Production-ready (`/src/lib/soap/agents.ts`, `/src/app/api/soap/consult/route.ts`)
✅ **UI Components**: Production-ready (`/src/components/soap/`)
⚠️ **Frontend Integration**: DEMO ONLY - needs real API connection

## What Works

1. **Beautiful UI Components** - All SOAP components are fully functional:
   - `SpecialistConsultation` - Animated specialist cards
   - `ConsensusMatrix` - Kendall's W consensus visualization
   - `SOAPTimeline` - Phase progress tracker
   - `ConsultationProgress` - Real-time progress indicator

2. **Production Backend** - Full multi-agent orchestration:
   - 4 specialist agents (GP, dermatologist, internist, psychiatrist)
   - Supervisor agent for consensus building
   - Kendall's W coefficient calculation
   - Rate limiting with `p-limit(2)`
   - Complete error logging

3. **Demo Page** - `/soap-demo` shows all components working

4. **Dashboard Link** - Patient dashboard now has "Consulta Multi-Especialista" card

## What Needs Fixing

### Critical: API Integration

The page at `/app/app/ai-consulta/page.tsx` currently uses **simulated data**:

```typescript
// ❌ CURRENT: Fake simulation
const simulateSpecialistConsultation = async () => {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  setSpecialists((prev) => prev.map(/* hardcoded data */));
};
```

### Required: Real API Integration

```typescript
// ✅ NEEDED: Real API call
const startSOAPConsultation = async (subjectiveData: SubjectiveData) => {
  const response = await fetch('/api/soap/consult', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      patientId: user.id,
      subjective: subjectiveData,
      objective: optionalObjectiveData,
    }),
  });

  const data = await response.json();
  // Map API response to UI components
  setSpecialists(data.consultation.assessment.specialists);
  setConsensus(data.consultation.assessment.consensus);
};
```

## Data Structure Required

The API expects this structure (from `/src/lib/soap/types.ts`):

```typescript
interface SubjectiveData {
  chiefComplaint: string;           // Main complaint
  symptomsDescription: string;      // Detailed symptoms
  symptomDuration: string;          // "2 days", "1 week"
  symptomSeverity: number;          // 1-10 scale
  onsetType: 'sudden' | 'gradual';
  associatedSymptoms: string[];     // Other symptoms
  aggravatingFactors: string[];     // What makes it worse
  relievingFactors: string[];       // What helps
  previousTreatments: string[];     // Past treatments
  medicalHistory?: string;
  medications?: string[];
  allergies?: string[];
  familyHistory?: string;
  socialHistory?: string;
}
```

## Implementation Plan

### Option 1: Quick Fix (Chat-Based)

Convert the simple chat interface to collect structured data:
1. Ask questions one by one in chat
2. Build `SubjectiveData` object progressively
3. Call `/api/soap/consult` when complete
4. Display results with existing components

**Estimate:** 2-3 hours

### Option 2: Full Intake Form (Recommended)

Create a proper intake wizard:
1. Multi-step form for all SubjectiveData fields
2. Use shadcn/ui form components
3. Validation at each step
4. Call API on completion
5. Display animated results

**Estimate:** 4-6 hours

### Option 3: Hybrid (Best UX)

1. Start with simple chat for chief complaint
2. AI asks follow-up questions naturally
3. Convert conversation to structured data
4. Call API and display results

**Estimate:** 6-8 hours

## Next Steps

Choose implementation approach and update `/app/app/ai-consulta/page.tsx` to:
1. Collect proper `SubjectiveData`
2. Call `/api/soap/consult` endpoint
3. Handle loading/error states
4. Display real results
5. Save consultation to database

## Files Modified This Session

1. ✅ `/src/app/app/ai-consulta/page.tsx` - Created (DEMO VERSION)
2. ✅ `/src/app/app/page.tsx` - Added dashboard card
3. ✅ `/docs/PEER-REVIEW-SOAP-MULTIAGENT.md` - Full peer review
4. ✅ Deployed to https://doctor.mx

## Files Already Existing (No Changes Needed)

- `/src/lib/soap/agents.ts` - Backend orchestration
- `/src/lib/soap/types.ts` - TypeScript types
- `/src/lib/soap/prompts.ts` - AI prompts
- `/src/app/api/soap/consult/route.ts` - API endpoint
- `/src/components/soap/*.tsx` - All UI components
- `/src/types/soap.ts` - Shared types
