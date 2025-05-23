# DoctorMX Platform Upgrade Tasks

## Priority 1 - Critical UX Improvements (Immediate Implementation)

### A. Remove Modal Wizard System
**Priority: P0 - Blocking user onboarding**

#### A.1 Delete Wizard Components
- [ ] Remove `src/pages/wizard/Step1Page.tsx`
- [ ] Remove `src/pages/wizard/Step2Page.tsx` 
- [ ] Remove `src/pages/wizard/Step3Page.tsx`
- [ ] Remove `src/pages/wizard/WizardLayout.tsx`
- [ ] Remove `src/contexts/WizardContext.tsx`
- [ ] Remove wizard imports from `src/core/components/AILayout.tsx`
- [ ] Remove wizard routes from AILayout routing

#### A.2 Remove Wizard References
- [ ] Update `src/pages/AIHomePage.tsx` - remove `/wizard/step-1` links
- [ ] Remove wizard CSS classes from global stylesheets
- [ ] Clean up any wizard-related state in components

#### A.3 Hide Wizard Styles
```css
/* Add to globals.css */
.wizard-overlay { display: none !important; }
.wizard-modal { display: none !important; }
```

### B. Implement Inline Chat Onboarding
**Priority: P0 - Replace removed wizard functionality**

#### B.1 Modify Hero CTA Button
- [ ] Update `src/pages/AIHomePage.tsx` CTA buttons
- [ ] Replace `/wizard/step-1` navigation with chat opening
- [ ] Add onboarding message injection

#### B.2 Create Chat Container with Proper Sizing
- [ ] Implement responsive chat container (90vh height, 100% width mobile, 420px desktop)
- [ ] Add 300ms slide-up animation with cubic-bezier(0.22,1,0.36,1)
- [ ] Ensure proper mobile viewport handling

#### B.3 Onboarding Message Flow
- [ ] Detect sys-onboard-1 message for age/sex collection
- [ ] Parse user input with regex: `(\d{1,3})\s*(años|yo)?\s*(hombre|mujer|otro)`
- [ ] Store metadata in chat context
- [ ] Trigger symptom collection with sys-onboard-2
- [ ] Forward to AI with formatted system prompt

### C. Animation & Timing Improvements  
**Priority: P1 - UX Polish**

#### C.1 Chat Animations
- [ ] Implement slide-up animation for chat container
- [ ] Add bot typing indicator with 800ms minimum display time
- [ ] Create smooth transitions between onboarding steps

#### C.2 Hero CTA Animations
- [ ] Add bounce animation after 5-second timeout
- [ ] Implement attention-grabbing animations

## Priority 2 - Core Feature Implementation (Week 1)

### D. Real AI Integration
**Priority: P1 - Replace mock functionality**

#### D.1 Speech-to-Text Integration
- [ ] Create `netlify/functions/transcribe.ts`
- [ ] Integrate OpenAI Whisper API
- [ ] Wire up to chat input component
- [ ] Add audio recording UI controls

#### D.2 Image Analysis API
- [ ] Create `netlify/functions/analyze-image.ts`  
- [ ] Implement dermatology model integration
- [ ] Replace mock analysis in AIImageAnalysisPage
- [ ] Add image upload handling

#### D.3 Enhanced AI Chat
- [ ] Create `netlify/functions/chat.ts` for secure AI calls
- [ ] Move API keys server-side
- [ ] Implement streaming responses
- [ ] Add error handling and fallbacks

### E. Medical Features Implementation
**Priority: P1 - Core product functionality**

#### E.1 Provider Directory & Referrals
- [ ] Create `netlify/functions/providers.ts`
- [ ] Set up PostGIS geography in Supabase
- [ ] Implement location-based provider search
- [ ] Create provider listing UI

#### E.2 Appointment Scheduling
- [ ] Create `netlify/functions/appointments.ts`
- [ ] Design appointment booking flow
- [ ] Integrate with provider availability
- [ ] Add calendar integration

#### E.3 Prescription Management
- [ ] Create `netlify/functions/prescriptions.ts`
- [ ] Build prescription PDF generation
- [ ] Implement medication database
- [ ] Create pharmacy integration

## Priority 3 - Architecture & Code Quality (Week 2)

### F. Component Architecture Refactoring
**Priority: P2 - Technical debt**

#### F.1 Chat System Restructure
- [ ] Break AIDoctor into smaller components:
  - `ChatMessages.tsx`
  - `ChatInput.tsx` 
  - `ProvidersList.tsx`
  - `PrescriptionsList.tsx`
  - `PharmaciesList.tsx`
- [ ] Create centralized `ChatContext.tsx`
- [ ] Implement proper state management

#### F.2 Remove Deprecated Components
- [ ] Delete unused AIDoctor variants
- [ ] Remove unused page components
- [ ] Clean up import statements

#### F.3 Error Handling Standardization
- [ ] Replace all `alert()` calls with Toast components
- [ ] Implement consistent error messaging
- [ ] Add graceful degradation

### G. Responsive Design & Layout
**Priority: P2 - Multi-device support**

#### G.1 Mobile Optimizations
- [ ] Tab bar horizontal scroll implementation
- [ ] Sticky chat input positioning
- [ ] Safe-area padding for iOS devices
- [ ] Touch-friendly interactive elements

#### G.2 Desktop & Ultra-wide Support
- [ ] Ultra-wide layout (≥2560px) with side-by-side views
- [ ] Responsive breakpoint optimization
- [ ] Desktop-specific UI enhancements

## Priority 4 - Testing & Quality Assurance (Week 3)

### H. Automated Testing
**Priority: P2 - Quality assurance**

#### H.1 API Function Tests
- [ ] Unit tests for all Netlify functions
- [ ] Integration tests for database operations
- [ ] Mock external API responses

#### H.2 Frontend Component Tests
- [ ] Chat flow testing
- [ ] Onboarding sequence testing  
- [ ] Responsive layout testing

#### H.3 End-to-End Testing
- [ ] Complete user journey testing
- [ ] Cross-browser compatibility
- [ ] Mobile device testing

### I. Performance & Optimization
**Priority: P2 - User experience**

#### I.1 Bundle Optimization
- [ ] Code splitting implementation
- [ ] Lazy loading for heavy components
- [ ] Asset optimization

#### I.2 Database Performance
- [ ] Query optimization
- [ ] Index creation for location searches
- [ ] Caching strategies

## Implementation Timeline

### Week 1 (Priority 0-1)
- **Days 1-2**: Remove wizard, implement inline chat onboarding
- **Days 3-4**: Real AI integration (STT, image analysis, chat)
- **Days 5-7**: Medical features (providers, appointments, prescriptions)

### Week 2 (Priority 2)
- **Days 1-3**: Architecture refactoring  
- **Days 4-7**: Responsive design improvements

### Week 3 (Priority 2-3)
- **Days 1-4**: Testing implementation
- **Days 5-7**: Performance optimization & final polish

## Success Metrics

### User Experience
- [ ] Chat opens in <300ms with smooth animation
- [ ] Onboarding completes in <60 seconds
- [ ] Zero broken wizard URLs (404s)
- [ ] Responsive design works 360px-2560px

### Technical Performance  
- [ ] All API functions respond in <2 seconds
- [ ] Error handling covers 100% of failure scenarios
- [ ] Mobile performance score >90
- [ ] Desktop performance score >95

### Medical Features
- [ ] Provider search returns results for all major cities
- [ ] Appointment booking flow completes successfully
- [ ] Prescription generation works end-to-end
- [ ] Image analysis provides meaningful results

## Risk Mitigation

### High Risk Items
1. **AI API Integration**: Have fallback responses ready
2. **Database Migration**: Test all queries before deployment  
3. **Mobile Layout**: Extensive device testing required
4. **Provider Data**: Ensure sufficient provider database

### Contingency Plans
- Gradual rollout with feature flags
- A/B testing for critical flows
- Rollback procedures for each major change
- Performance monitoring alerts 