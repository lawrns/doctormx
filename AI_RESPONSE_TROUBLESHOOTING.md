# DoctorMX AI Response Troubleshooting Guide

## Issue Summary
The DoctorMX virtual doctor chatbot was providing generic, non-contextual responses instead of medically relevant answers that address specific symptoms and conditions mentioned in user messages.

## Root Cause Analysis
The development mode mock response system was intercepting and replacing what would otherwise be actual LLM-generated responses with overly simplistic, generic templates.

## Solutions Implemented

### 1. Enhanced Mock Response System ✅
**Location:** `src/core/services/ai/AIService.ts` (lines 544-746)

**What was implemented:**
- **Contextual Keyword Detection:** Enhanced medical keyword analysis with categorized terms (anal, genital, digestive, respiratory, etc.)
- **Specific Medical Responses:** Tailored responses for different body systems and conditions
- **Conversation Context Awareness:** Maintains conversation history and provides contextual follow-up responses
- **Pain Location Detection:** Recognizes and addresses specific anatomical regions mentioned by users
- **Dynamic Follow-up Questions:** Generates relevant questions based on detected medical categories

**Key improvements:**
```typescript
// Enhanced keyword analysis for better context recognition
const medicalKeywords = {
  anal: ['anal', 'recto', 'rectal', 'ano', 'hemorroides', 'fisura'],
  genital: ['genital', 'vaginal', 'pene', 'testicular', 'vulva'],
  digestive: ['estómago', 'intestino', 'digestión', 'náusea', 'vómito', 'diarrea'],
  // ... more categories
};
```

### 2. Environment-Based Control System ✅
**Location:** `.env.local`, `src/core/services/ai/AIService.ts` (lines 468-475)

**Configuration options:**
- `VITE_FORCE_REAL_AI=false` - Use enhanced mock responses (default for development)
- `VITE_FORCE_REAL_AI=true` - Use real AI API calls for testing
- `VITE_ENHANCED_MOCKS=true` - Enable contextual mock responses

### 3. Ignore File Adjustments ✅
**Location:** `.gitignore`

**Changes made:**
- Updated `.gitignore` to allow `.env.local` files
- Removed blanket `.env.*` ignore pattern
- Added specific ignore patterns for production/staging env files

## How to Use the Solutions

### For Enhanced Mock Responses (Recommended for Development)
```bash
# Ensure .env.local contains:
VITE_FORCE_REAL_AI=false
VITE_ENHANCED_MOCKS=true

# Restart development server
npm run dev
```

### For Real AI API Testing
```bash
# Update .env.local:
VITE_FORCE_REAL_AI=true

# Restart development server
npm run dev
```

## Testing the Fixes

### Test Case 1: Anal/Rectal Pain
**Input:** "Tengo dolor anal"
**Expected Output:** 
- Specific information about anal/rectal conditions
- Relevant questions about bowel movements, bleeding, etc.
- Proctology specialty recommendation
- Specific condition suggestions (hemorrhoids, fissures, etc.)

### Test Case 2: General Pain with Location
**Input:** "Me duele la espalda"
**Expected Output:**
- Pain assessment questions
- Location-specific advice
- Intensity scale questions
- Activity-related inquiries

### Test Case 3: Conversation Context
**Input:** Follow-up message after initial complaint
**Expected Output:**
- Reference to previous conversation
- Contextual questions about symptom evolution
- Appropriate follow-up recommendations

## Technical Details

### Mock Response Generation Flow
1. **Message Analysis:** Extract and categorize medical terms from user input
2. **Context Detection:** Analyze conversation history for continuity
3. **Category Matching:** Match detected terms to specific medical categories
4. **Response Generation:** Create contextually appropriate response based on category
5. **Follow-up Creation:** Generate relevant questions for the detected condition

### Key Methods Added
- `generateContextualMockResponse()` - Main mock response generator
- `extractPainLocation()` - Identifies specific anatomical locations
- `generateContextualFollowUp()` - Creates relevant follow-up questions

## Development Notes

### Environment Variables
- All `VITE_*` variables are available in the frontend
- Changes to `.env.local` require development server restart
- Use `.env.local` for local overrides (not committed to git)

### Debugging
Enable debug mode in `.env.local`:
```
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=debug
```

Check browser console for:
- Mock response generation logs
- API request details
- Conversation context analysis

## Future Enhancements

### Planned Improvements
1. **Database Integration:** Connect mock responses to Supabase medical knowledge
2. **Machine Learning:** Train models on conversation patterns
3. **Multi-language Support:** Extend contextual analysis to other languages
4. **Severity Assessment:** Automatic triage based on symptom descriptions

### Configuration Options
```typescript
// Future .env.local options
VITE_MOCK_RESPONSE_DELAY=2000
VITE_MEDICAL_KNOWLEDGE_SOURCE=database
VITE_AI_PERSONALITY=empathetic
VITE_RESPONSE_LENGTH=detailed
```

## Troubleshooting

### Common Issues

**Issue:** Generic responses still appearing
**Solution:** 
1. Check `.env.local` exists with correct settings
2. Restart development server
3. Clear browser cache
4. Verify console logs show "Contextual mock AI response generated"

**Issue:** Environment variables not loading
**Solution:**
1. Ensure `.env.local` is in project root
2. Restart Vite development server
3. Check that variables start with `VITE_`

**Issue:** Mock responses not contextual enough
**Solution:**
1. Check `medicalKeywords` object in `AIService.ts`
2. Add new keywords to appropriate categories
3. Extend `generateContextualMockResponse()` logic

## Verification Checklist

- [ ] `.env.local` file created with correct settings
- [ ] Development server restarted after env changes
- [ ] Console shows "Contextual mock AI response generated"
- [ ] Anal/rectal pain queries get specific proctology responses
- [ ] Pain location is correctly identified and addressed
- [ ] Follow-up questions are relevant to the medical category
- [ ] Conversation context is maintained across messages
- [ ] Real AI toggle works when `VITE_FORCE_REAL_AI=true`

## Contact Information
For technical support or additional enhancements, refer to the AIService.ts implementation or create an issue in the project repository. 