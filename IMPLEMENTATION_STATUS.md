# Hybrid-Guided AI Doctor Overhaul - Implementation Status

## ✅ Completed Components

### Schema & Types
- `server/types/chat.ts` - Schema v2 definitions with ConversationStage, Chip, FormField, ChatResponseV2, ConversationMemory

### UI Components
- `src/components/ChipBar.jsx` - Single-row scrollable chip bar with icons and actions
- `src/components/InlinePickers/SeverityScale.jsx` - 4-level severity picker (green/yellow/orange/red)
- `src/components/InlinePickers/DurationPicker.jsx` - Duration presets (hours/days/weeks/months)
- `src/components/InlinePickers/SpecialtyPicker.jsx` - Medical specialty selector
- `src/components/InlinePickers/SymptomLocation.jsx` - Google Places autocomplete for location
- `src/components/AppointmentCard.jsx` - Appointment booking card with details
- `src/components/SummaryCard.jsx` - Conversation summary card with save/share

## 🚧 Pending Integration

### Backend Updates Required
1. Update `server/providers/openai.ts` to return Schema v2 format
2. Add stage machine logic to track conversation progress
3. Implement memory context in chat endpoint
4. Generate chips[] based on conversation stage

### Frontend Integration Required
1. Update `src/pages/DoctorAI.jsx` to:
   - Replace QuickReplyOptions with ChipBar
   - Add inline pickers based on form fields from AI response
   - Add conversation memory state
   - Implement stage controller logic
   - Collapse composer by default with "Escribir" expand button
   - Add AppointmentCard and SummaryCard rendering

2. Update chat API calls to send memory context

### Endpoints to Add
- POST /api/chat/save - Save conversation
- POST /api/chat/share - Share conversation
- POST /api/referrals/create - Create referral
- POST /api/appointments/create - Create appointment

## Next Steps

1. **Backend Schema v2 Output** - Modify OpenAI provider to structure responses with chips, forms, next_state
2. **Stage Machine Logic** - Track conversation stage and memory
3. **Frontend Integration** - Wire up ChipBar and inline pickers
4. **Testing** - Verify full conversation flow without typing
5. **Polish** - Copy review, accessibility, error handling

## Architecture Notes

- Chips always visible in single horizontal row
- Inline pickers appear based on AI form field requests
- Stage machine: intake → clarify → assess_severity → recommendations → actions → wrap_up
- Composer collapsed by default, expandable with "Escribir" button
- Memory tracks collected fields to avoid redundant questions

