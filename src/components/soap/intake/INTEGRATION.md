# Integration Guide: SOAP Phase 1 Components

This guide shows how to integrate the new Phase 1 UI components into the existing consultation flow.

## 🎯 Quick Integration

### Step 1: Import Components

In your consultation page (`ai-consulta-client.tsx`):

```tsx
import {
  ProgressStepper,
  useProgressSteps,
  QuestionCard,
  QuestionTitle,
  QuestionDescription,
  QuestionCardNavigation,
  SeveritySlider,
  SeverityLegend,
  SymptomAutocomplete,
  useSymptomData,
  ConversationalWelcome,
} from '@/components/soap';
```

### Step 2: Replace Welcome Step

**Before:**
```tsx
{currentStep === 'welcome' && (
  <WelcomeStep key="welcome" onNext={nextStep} />
)}
```

**After:**
```tsx
{currentStep === 'welcome' && (
  <ConversationalWelcome
    key="welcome"
    onStart={nextStep}
    userName={userFirstName}
  />
)}
```

### Step 3: Replace Chief Complaint Step

**Before:**
```tsx
{currentStep === 'chief-complaint' && (
  <ChiefComplaintStep
    key="chief-complaint"
    value={formData.chiefComplaint}
    onChange={(v) => updateFormData('chiefComplaint', v)}
    onNext={nextStep}
    onPrev={prevStep}
  />
)}
```

**After:**
```tsx
{currentStep === 'chief-complaint' && (
  <QuestionCard
    key="chief-complaint"
    step={1}
    totalSteps={9}
    icon={
      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
        <MessageSquare className="w-6 h-6 text-white" />
      </div>
    }
  >
    <QuestionTitle>¿Cuál es tu motivo principal?</QuestionTitle>
    <QuestionDescription>
      Describe brevemente qué te molesta
    </QuestionDescription>

    <SymptomAutocomplete
      value={formData.chiefComplaint}
      onChange={(v) => updateFormData('chiefComplaint', v)}
      suggestions={symptoms}
      placeholder="Ej: Dolor de cabeza fuerte..."
    />

    <QuestionCardNavigation
      onPrev={prevStep}
      onNext={nextStep}
      canNext={formData.chiefComplaint.trim().length > 0}
    />
  </QuestionCard>
)}
```

### Step 4: Replace Severity Step

**Before:**
```tsx
{currentStep === 'severity' && (
  <SeverityStep
    key="severity"
    value={formData.symptomSeverity}
    onChange={(v) => updateFormData('symptomSeverity', v)}
    onNext={nextStep}
    onPrev={prevStep}
  />
)}
```

**After:**
```tsx
{currentStep === 'severity' && (
  <QuestionCard
    key="severity"
    step={4}
    totalSteps={9}
    icon={
      <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
        <AlertCircle className="w-6 h-6 text-white" />
      </div>
    }
  >
    <QuestionTitle>¿Qué tan intenso es tu malestar?</QuestionTitle>
    <QuestionDescription>
      Del 1 (muy leve) al 10 (insoportable)
    </QuestionDescription>

    <SeveritySlider
      value={formData.symptomSeverity}
      onChange={(v) => updateFormData('symptomSeverity', v)}
      showLabel={true}
      showFaces={true}
    />

    <SeverityLegend className="mt-6" />

    <QuestionCardNavigation
      onPrev={prevStep}
      onNext={nextStep}
      canNext={true}
    />
  </QuestionCard>
)}
```

### Step 5: Add Progress Stepper

Add this at the top of your consultation flow (after header, before main content):

```tsx
{/* Progress indicator - show on all steps except welcome and results */}
{currentStep !== 'welcome' && currentStep !== 'results' && (
  <div className="mb-8">
    <ProgressStepper
      steps={useProgressSteps(currentStep)}
      currentStepId={currentStep}
    />
  </div>
)}
```

## 📋 Complete Step Mapping

| Old Step Name | New QuestionCard | Step Number |
|--------------|------------------|-------------|
| welcome | ConversationalWelcome | - |
| chief-complaint | QuestionCard + SymptomAutocomplete | 1/9 |
| symptoms | QuestionCard + textarea | 2/9 |
| duration | QuestionCard + duration buttons | 3/9 |
| severity | QuestionCard + SeveritySlider | 4/9 |
| onset | QuestionCard + onset cards | 5/9 |
| associated | QuestionCard + symptom chips | 6/9 |
| factors | QuestionCard + inputs | 7/9 |
| history | QuestionCard + textarea | 8/9 |
| consulting | SpecialistConsultation (no change) | - |
| results | ResultsStep (no change) | - |

## 🎨 Custom Data Hook

Add this hook to your component for symptom data:

```tsx
const { symptoms, categories } = useSymptomData();
```

The `symptoms` array includes:
- `id`: Unique identifier
- `name`: Symptom name
- `category`: Symptom category (Dolor, Digestivo, Respiratorio, etc.)
- `count`: Usage frequency (optional)

## 🔧 Advanced Configuration

### Custom Step Progress

If you want custom step names, create your own steps array:

```tsx
const customSteps: ProgressStep[] = [
  { id: 'symptoms', label: 'Síntomas', status: 'completed' },
  { id: 'severity', label: 'Severidad', status: 'in-progress' },
  { id: 'duration', label: 'Duración', status: 'pending' },
  { id: 'history', label: 'Historial', status: 'pending' },
];

<ProgressStepper steps={customSteps} currentStepId="severity" />
```

### Custom Severity Labels

Modify the labels in SeveritySlider.tsx if needed:

```tsx
const severityLabels = {
  1: { label: 'Muy leve', color: 'text-green-600', bgColor: 'bg-green-50' },
  // ... customize as needed
};
```

### Custom Symptom Categories

Modify the category colors in SymptomAutocomplete.tsx:

```tsx
const categoryColors: Record<string, string> = {
  'Dolor': 'bg-red-100 text-red-700',
  'Digestivo': 'bg-orange-100 text-orange-700',
  // ... add your categories
};
```

## 🚦 Migration Checklist

- [ ] Import new components
- [ ] Replace WelcomeStep with ConversationalWelcome
- [ ] Replace ChiefComplaintStep with QuestionCard + SymptomAutocomplete
- [ ] Replace SeverityStep with QuestionCard + SeveritySlider
- [ ] Add ProgressStepper to consultation flow
- [ ] Replace other steps with QuestionCard wrapper
- [ ] Test keyboard navigation
- [ ] Test screen reader accessibility
- [ ] Test animations (check reduced motion preference)
- [ ] Verify mobile responsiveness

## 🐛 Troubleshooting

### Issue: Symptoms not showing in autocomplete
**Solution:** Make sure you're calling `useSymptomData()` hook in your component

### Issue: Progress steps not updating
**Solution:** Pass the correct `currentStepId` prop to ProgressStepper

### Issue: Animations not playing
**Solution:** Ensure parent component has `<AnimatePresence mode="wait">` wrapper

### Issue: TypeScript errors
**Solution:** Make sure you've imported types from the intake module

## 📱 Responsive Design

All components are fully responsive:
- **Mobile**: Full-width cards, stacked layout
- **Tablet**: Optimized padding and spacing
- **Desktop**: Max-width containers with proper margins

## 🎭 Animation Timing

All animations use consistent timing:
- **Page transitions**: 300ms
- **Micro-interactions**: 150ms
- **Progress updates**: 400ms

Animations automatically respect `prefers-reduced-motion`.

## ♿ Accessibility Testing

Test with:
1. Keyboard only (Tab, Enter, Arrow keys)
2. Screen reader (VoiceOver/NVDA)
3. High contrast mode
4. Reduced motion preference

All components should be fully accessible.

---

**Need Help?** See `EXAMPLES.tsx` for complete working examples.
