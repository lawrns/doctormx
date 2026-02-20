# Error Codes Reference

Comprehensive reference for all error codes used in the Doctor.mx platform.

## Overview

Error codes follow the format: `CATEGORY_NUMBER` (e.g., `MED_001`, `AUTH_001`)

| Prefix | Category | Description |
|--------|----------|-------------|
| `MED` | Medical | Medical record and data errors |
| `EMG` | Emergency | Emergency symptom detection |
| `RX` | Prescription | Prescription-related errors |
| `DX` | Diagnosis | Diagnosis and analysis errors |
| `APT` | Appointment | Scheduling and availability errors |
| `AUTH` | Authentication | Login and session errors |
| `ACC` | Authorization | Permission and access errors |
| `VAL` | Validation | Input validation errors |
| `NF` | Not Found | Resource not found errors |
| `RATE` | Rate Limit | Rate limiting and quota errors |
| `EXT` | External | Third-party service errors |
| `CON` | Consent | User consent and privacy errors |
| `PAY` | Payment | Payment processing errors |
| `VID` | Video | Video consultation errors |

---

## Medical Errors (MED_xxx)

### MED_001 - Medical Record Error
**Meaning:** Failed to access or update a patient's medical record.

**Patient Message (ES):** "Hubo un problema al acceder a su expediente médico. Por favor, intente nuevamente."

**Developer Message:** "Failed to access or update medical record"

**Common Causes:**
- Database connection timeout
- RLS policy blocking access
- Invalid patient ID
- Concurrent modification conflict

**Resolution Steps:**
1. Check Supabase connection status
2. Verify RLS policies allow access
3. Retry the operation
4. Check server logs for database errors

---

### MED_002 - Medical Data Invalid
**Meaning:** The provided medical data failed validation.

**Patient Message (ES):** "Los datos médicos proporcionados no son válidos. Por favor, verifique la información."

**Developer Message:** "Invalid medical data provided"

**Common Causes:**
- Missing required fields
- Invalid format (e.g., dates)
- Values outside acceptable ranges

**Resolution Steps:**
1. Validate all required fields are present
2. Check date formats (YYYY-MM-DD)
3. Verify numeric values are within valid ranges

---

### MED_003 - Symptom Analysis Failed
**Meaning:** The AI symptom analysis service encountered an error.

**Patient Message (ES):** "No pudimos analizar sus síntomas correctamente. Por favor, intente nuevamente."

**Developer Message:** "AI symptom analysis failed"

**Common Causes:**
- OpenAI API error or timeout
- Invalid symptom description format
- AI service temporarily unavailable

**Resolution Steps:**
1. Check AI service health (`/api/health`)
2. Verify OpenAI API key is valid
3. Retry after a short delay
4. Check AI service status page

---

### MED_004 - Red Flag Detected
**Meaning:** Potentially serious symptoms were detected in the patient's description.

**Patient Message (ES):** "Detectamos información importante que requiere atención médica."

**Developer Message:** "Red flags detected in symptom analysis"

**Common Causes:**
- Patient described emergency symptoms
- AI detected concerning patterns

**Resolution Steps:**
1. Display emergency warning to user
2. Recommend immediate medical attention
3. Log for medical review
4. Offer emergency contact information

---

## Emergency Errors (EMG_xxx)

### EMG_001 - Emergency Detected
**Meaning:** AI determined the patient may need emergency medical attention.

**Patient Message (ES):** "Según los síntomas que describe, podría requerir atención médica urgente."

**Developer Message:** "Emergency symptoms detected by AI"

**Resolution Steps:**
1. **DO NOT** proceed with normal flow
2. Display emergency warning prominently
3. Show emergency contact numbers:
   - Emergencias: 911
   - Cruz Roja: 065
   - Locatel: 5658-1111
4. Log incident for review
5. Offer to connect with emergency services

---

### EMG_002 - Critical Symptoms
**Meaning:** Critical symptoms requiring immediate attention were detected.

**Patient Message (ES):** "Ha descrito síntomas que requieren atención médica inmediata."

**Developer Message:** "Critical symptoms requiring immediate attention"

**Resolution Steps:**
1. Treat as medical emergency
2. Instruct user to call 911 immediately
3. Do not proceed with AI consultation
4. Alert medical team if logged in

---

### EMG_003 - Urgent Care Needed
**Meaning:** Patient should seek medical care soon but not necessarily emergency.

**Patient Message (ES):** "Sus síntomas sugieren que debe buscar atención médica pronto."

**Developer Message:** "Symptoms indicating need for urgent care"

**Resolution Steps:**
1. Display urgent care warning
2. Suggest same-day medical appointment
3. Offer doctor booking options
4. Provide self-care advice if appropriate

---

### EMG_004 - Emergency Redirect
**Meaning:** System is redirecting user to emergency services.

**Patient Message (ES):** "Por su seguridad, le recomendamos contactar servicios de emergencia."

**Developer Message:** "Patient should be redirected to emergency services"

**Resolution Steps:**
1. Redirect to emergency information page
2. Provide emergency contact numbers
3. Clear any active consultations
4. Log the redirect event

---

## Prescription Errors (RX_xxx)

### RX_001 - Prescription Generation Failed
**Meaning:** System failed to generate a prescription.

**Patient Message (ES):** "No pudimos generar su receta. Por favor, contacte a su médico."

**Developer Message:** "Failed to generate prescription"

**Common Causes:**
- Missing patient information
- Invalid medication data
- PDF generation error
- Database write failure

**Resolution Steps:**
1. Verify all patient data is complete
2. Check PDF generation service
3. Review database connection
4. Allow manual prescription entry

---

### RX_002 - Drug Interaction
**Meaning:** Potential drug-drug interaction detected.

**Patient Message (ES):** "Existe una posible interacción entre medicamentos. Su médico será notificado."

**Developer Message:** "Potential drug-drug interaction detected"

**Resolution Steps:**
1. Alert prescribing doctor immediately
2. Display interaction warning
3. Require doctor confirmation before proceeding
4. Log interaction for review

---

### RX_003 - Dosage Error
**Meaning:** Prescribed dosage is outside safe range.

**Patient Message (ES):** "La dosis del medicamento necesita revisión. Su médico será notificado."

**Developer Message:** "Dosage outside safe range"

**Resolution Steps:**
1. Flag for doctor review
2. Prevent prescription issuance
3. Suggest standard dosage

---

### RX_004 - Allergy Alert
**Meaning:** Patient has allergy to prescribed medication.

**Patient Message (ES):** "Detectamos una posible alergia al medicamento. Su médico será notificado."

**Developer Message:** "Patient allergy detected for prescribed medication"

**Resolution Steps:**
1. **BLOCK** prescription immediately
2. Alert doctor and patient
3. Require alternative medication selection
4. Update patient allergy record

---

### RX_005 - Contraindication
**Meaning:** Medication is contraindicated for patient condition.

**Patient Message (ES):** "Este medicamento puede no ser adecuado para usted. Su médico será notificado."

**Developer Message:** "Contraindication detected"

**Resolution Steps:**
1. Review patient medical history
2. Flag for doctor approval
3. Suggest alternatives if available

---

### RX_006 - Prescription Expired
**Meaning:** The prescription has passed its validity period.

**Patient Message (ES):** "Esta receta ha expirado. Por favor, solicite una nueva a su médico."

**Developer Message:** "Prescription has expired"

**Resolution Steps:**
1. Inform patient of expiration
2. Offer to book follow-up appointment
3. Require new consultation for controlled substances

---

## Diagnosis Errors (DX_xxx)

### DX_001 - Diagnosis Low Confidence
**Meaning:** AI confidence in diagnosis is below threshold.

**Patient Message (ES):** "Necesitamos más información para darle un diagnóstico preciso."

**Developer Message:** "AI diagnosis confidence below threshold"

**Resolution Steps:**
1. Ask follow-up questions
2. Request more symptom details
3. Suggest human consultation
4. Display confidence disclaimer

---

### DX_002 - Insufficient Data
**Meaning:** Not enough information provided for diagnosis.

**Patient Message (ES):** "Por favor, proporcione más detalles sobre sus síntomas."

**Developer Message:** "Insufficient data for accurate diagnosis"

**Resolution Steps:**
1. Guide user to provide more details
2. Ask specific follow-up questions
3. Explain why more info is needed

---

### DX_003 - Diagnosis Conflict
**Meaning:** Conflicting information detected in patient responses.

**Patient Message (ES):** "Hay información contradictoria. Por favor, revise sus respuestas."

**Developer Message:** "Conflicting diagnosis information"

**Resolution Steps:**
1. Highlight conflicting answers
2. Ask user to clarify
3. Restart questionnaire if needed

---

### DX_004 - Symptom Mismatch
**Meaning:** Reported symptoms don't match expected patterns.

**Patient Message (ES):** "Los síntomas descritos no coinciden. Por favor, verifique."

**Developer Message:** "Symptoms do not match expected patterns"

**Resolution Steps:**
1. Request symptom verification
2. Ask patient to describe differently
3. Consider alternative diagnoses

---

## Appointment Errors (APT_xxx)

### APT_001 - Appointment Conflict
**Meaning:** Time slot is no longer available.

**Patient Message (ES):** "Este horario ya no está disponible. Por favor, seleccione otro."

**Developer Message:** "Time slot conflict detected"

**Resolution Steps:**
1. Refresh available time slots
2. Show next available times
3. Allow waiting list signup

---

### APT_002 - Doctor Unavailable
**Meaning:** Doctor is not available at requested time.

**Patient Message (ES):** "El médico no está disponible en este horario."

**Developer Message:** "Doctor not available at requested time"

**Resolution Steps:**
1. Show doctor's actual availability
2. Suggest alternative doctors
3. Offer notification when available

---

### APT_003 - Invalid Time Slot
**Meaning:** Selected time slot is invalid.

**Patient Message (ES):** "El horario seleccionado no es válido."

**Developer Message:** "Invalid time slot selected"

**Common Causes:**
- Time in the past
- Outside business hours
- Not a valid slot (e.g., 2:37 PM)

**Resolution Steps:**
1. Validate before submission
2. Show valid time slots only
3. Provide clear error message

---

### APT_004 - Appointment Cancelled
**Meaning:** The appointment has been cancelled.

**Patient Message (ES):** "Esta cita ha sido cancelada."

**Developer Message:** "Appointment has been cancelled"

**Resolution Steps:**
1. Notify all parties
2. Offer rescheduling
3. Process refund if applicable

---

### APT_005 - Appointment Expired
**Meaning:** The appointment time has passed.

**Patient Message (ES):** "Esta cita ha expirado. Por favor, agende una nueva."

**Developer Message:** "Appointment has expired"

**Resolution Steps:**
1. Mark appointment as missed
2. Offer rescheduling
3. Apply no-show policy if applicable

---

## Authentication Errors (AUTH_xxx)

### AUTH_001 - Invalid Credentials
**Meaning:** Email or password is incorrect.

**Patient Message (ES):** "El correo o contraseña son incorrectos."

**Developer Message:** "Invalid authentication credentials"

**Resolution Steps:**
1. Check for typos in email
2. Verify password is correct
3. Offer password reset
4. Check for account lockout

---

### AUTH_002 - Session Expired
**Meaning:** User session has expired.

**Patient Message (ES):** "Su sesión ha expirado. Por favor, inicie sesión nuevamente."

**Developer Message:** "User session has expired"

**Resolution Steps:**
1. Redirect to login page
2. Preserve intended destination
3. Auto-redirect after login

---

### AUTH_003 - Token Invalid
**Meaning:** Authentication token is invalid or malformed.

**Patient Message (ES):** "Su sesión no es válida. Por favor, inicie sesión nuevamente."

**Developer Message:** "Invalid authentication token"

**Resolution Steps:**
1. Clear local storage/cookies
2. Force re-authentication
3. Check token format

---

### AUTH_004 - Unauthorized
**Meaning:** User is not authenticated.

**Patient Message (ES):** "No tiene autorización para acceder a esta sección."

**Developer Message:** "User not authenticated"

**Resolution Steps:**
1. Redirect to login
2. Return 401 status code
3. Prompt for credentials

---

## Authorization Errors (ACC_xxx)

### ACC_001 - Access Denied
**Meaning:** User lacks permission for this action.

**Patient Message (ES):** "No tiene permiso para realizar esta acción."

**Developer Message:** "Access denied to resource"

**Resolution Steps:**
1. Check user role
2. Verify resource ownership
3. Log access attempt
4. Return 403 status

---

### ACC_002 - Insufficient Permissions
**Meaning:** User's role doesn't have required permissions.

**Patient Message (ES):** "Su cuenta no tiene los permisos necesarios."

**Developer Message:** "User lacks required permissions"

**Resolution Steps:**
1. Check role-based access control
2. Suggest contacting admin
3. Offer upgrade path if applicable

---

### ACC_003 - Role Required
**Meaning:** Specific role is required for this action.

**Patient Message (ES):** "Esta función está disponible solo para personal médico."

**Developer Message:** "Specific role required for this action"

**Resolution Steps:**
1. Inform user of required role
2. Provide upgrade/verification process
3. Hide restricted UI elements

---

## Validation Errors (VAL_xxx)

### VAL_001 - Validation Failed
**Meaning:** General validation failure.

**Patient Message (ES):** "Por favor, verifique que todos los datos sean correctos."

**Developer Message:** "Input validation failed"

**Resolution Steps:**
1. Highlight invalid fields
2. Show specific validation messages
3. Prevent form submission

---

### VAL_002 - Invalid Input
**Meaning:** Input format or content is invalid.

**Patient Message (ES):** "La información ingresada no es válida."

**Developer Message:** "Invalid input provided"

**Resolution Steps:**
1. Specify expected format
2. Provide input examples
3. Use input masks if applicable

---

### VAL_003 - Missing Required Field
**Meaning:** Required field is empty or missing.

**Patient Message (ES):** "Falta completar información requerida."

**Developer Message:** "Required field is missing"

**Resolution Steps:**
1. Mark required fields clearly
2. Scroll to first missing field
3. Show field-specific message

---

### VAL_004 - Invalid Format
**Meaning:** Input doesn't match expected format.

**Patient Message (ES):** "El formato de la información no es correcto."

**Developer Message:** "Input format is invalid"

**Resolution Steps:**
1. Show expected format
2. Use format hints
3. Provide validation examples

---

## Not Found Errors (NF_xxx)

### NF_001 - Resource Not Found
**Meaning:** Requested resource doesn't exist.

**Patient Message (ES):** "No encontramos la información solicitada."

**Developer Message:** "Requested resource not found"

**Resolution Steps:**
1. Return 404 status
2. Log request for analysis
3. Suggest alternatives
4. Check for typo in ID

---

### NF_002 - User Not Found
**Meaning:** User account doesn't exist.

**Patient Message (ES):** "No encontramos el usuario en nuestro sistema."

**Developer Message:** "User not found in system"

**Resolution Steps:**
1. Check email address
2. Suggest registration
3. Check for deleted accounts

---

### NF_003 - Doctor Not Found
**Meaning:** Doctor profile doesn't exist.

**Patient Message (ES):** "No encontramos el médico en nuestro sistema."

**Developer Message:** "Doctor not found in system"

**Resolution Steps:**
1. Verify doctor ID
2. Check if profile is active
3. Suggest similar doctors

---

### NF_004 - Appointment Not Found
**Meaning:** Appointment doesn't exist.

**Patient Message (ES):** "No encontramos la cita especificada."

**Developer Message:** "Appointment not found"

**Resolution Steps:**
1. Check appointment ID
2. Verify user has access
3. Check if cancelled/deleted

---

## Rate Limit Errors (RATE_xxx)

### RATE_001 - Rate Limit Exceeded
**Meaning:** Too many requests in time window.

**Patient Message (ES):** "Ha excedido el límite de solicitudes. Por favor, espere unos minutos."

**Developer Message:** "Rate limit exceeded"

**Resolution Steps:**
1. Return 429 status
2. Include Retry-After header
3. Implement exponential backoff

---

### RATE_002 - Too Many Requests
**Meaning:** Request rate is too high.

**Patient Message (ES):** "Demasiadas solicitudes. Por favor, intente más tarde."

**Developer Message:** "Too many requests in short time"

**Resolution Steps:**
1. Implement client-side throttling
2. Display countdown timer
3. Queue requests

---

### RATE_003 - Quota Exceeded
**Meaning:** Account usage limit reached.

**Patient Message (ES):** "Ha alcanzado el límite de uso de su cuenta."

**Developer Message:** "User quota exceeded"

**Resolution Steps:**
1. Show usage statistics
2. Offer plan upgrade
3. Reset at billing cycle

---

## External Service Errors (EXT_xxx)

### EXT_001 - External Service Down
**Meaning:** Third-party service is unavailable.

**Patient Message (ES):** "El servicio no está disponible. Por favor, intente más tarde."

**Developer Message:** "External service unavailable"

**Common Causes:**
- Service outage
- Network issues
- DNS resolution failure

**Resolution Steps:**
1. Check service status page
2. Implement fallback
3. Retry with exponential backoff
4. Notify operations team

---

### EXT_002 - AI Service Error
**Meaning:** AI provider (OpenAI, etc.) returned an error.

**Patient Message (ES):** "El servicio de IA no está disponible. Por favor, intente más tarde."

**Developer Message:** "AI service error occurred"

**Resolution Steps:**
1. Check API key validity
2. Verify quota/limit status
3. Check provider status page
4. Switch to backup provider if configured

---

### EXT_003 - Payment Service Error
**Meaning:** Stripe or payment processor error.

**Patient Message (ES):** "Hubo un problema con el procesamiento del pago."

**Developer Message:** "Payment service error"

**Resolution Steps:**
1. Check Stripe dashboard
2. Verify webhook configuration
3. Check payment method validity
4. Log error details

---

### EXT_004 - SMS Service Error
**Meaning:** Twilio or SMS provider error.

**Patient Message (ES):** "No pudimos enviar el mensaje de texto. Por favor, intente nuevamente."

**Developer Message:** "SMS service error"

**Resolution Steps:**
1. Check Twilio logs
2. Verify phone number format
3. Check account balance
4. Validate sender ID

---

## Consent Errors (CON_xxx)

### CON_001 - Consent Required
**Meaning:** User must accept terms before proceeding.

**Patient Message (ES):** "Debe aceptar los términos para continuar."

**Developer Message:** "User consent required"

**Resolution Steps:**
1. Show consent form
2. Explain why consent is needed
3. Block until accepted

---

### CON_002 - Consent Outdated
**Meaning:** User's consent version is old.

**Patient Message (ES):** "Hemos actualizado nuestros términos. Por favor, revíselos."

**Developer Message:** "User consent version outdated"

**Resolution Steps:**
1. Show updated terms
2. Highlight changes
3. Request re-consent

---

### CON_003 - Consent Withdrawn
**Meaning:** User has withdrawn consent.

**Patient Message (ES):** "Ha retirado su consentimiento. Ya no podemos continuar."

**Developer Message:** "User has withdrawn consent"

**Resolution Steps:**
1. Stop processing data
2. Begin data deletion if requested
3. Log withdrawal
4. Restrict account access

---

### CON_004 - Privacy Policy Updated
**Meaning:** Privacy policy has changed.

**Patient Message (ES):** "Hemos actualizado nuestra política de privacidad."

**Developer Message:** "Privacy policy has been updated"

**Resolution Steps:**
1. Notify user of changes
2. Show summary of updates
3. Request acknowledgment

---

## Payment Errors (PAY_xxx)

### PAY_001 - Payment Failed
**Meaning:** General payment processing failure.

**Patient Message (ES):** "El pago no pudo ser procesado. Por favor, intente con otro método."

**Developer Message:** "Payment processing failed"

**Resolution Steps:**
1. Check payment method
2. Verify card details
3. Try alternative method
4. Contact bank if persists

---

### PAY_002 - Payment Declined
**Meaning:** Bank/payment processor declined the transaction.

**Patient Message (ES):** "El pago fue rechazado. Por favor, verifique sus datos."

**Developer Message:** "Payment declined by processor"

**Resolution Steps:**
1. Check card balance/limit
2. Verify billing address
3. Contact issuing bank
4. Try different card

---

### PAY_003 - Payment Cancelled
**Meaning:** User cancelled the payment.

**Patient Message (ES):** "El pago fue cancelado."

**Developer Message:** "Payment cancelled by user"

**Resolution Steps:**
1. Save cart/session
2. Offer to retry
3. Ask for feedback

---

### PAY_004 - Refund Failed
**Meaning:** Refund processing failed.

**Patient Message (ES):** "No pudimos procesar el reembolso. Por favor, contacte a soporte."

**Developer Message:** "Refund processing failed"

**Resolution Steps:**
1. Check refund eligibility
2. Verify original payment
3. Process manually if needed
4. Escalate to support

---

## Video Consultation Errors (VID_xxx)

### VID_001 - Video Setup Failed
**Meaning:** Could not initialize video call.

**Patient Message (ES):** "No pudimos configurar la videollamada. Por favor, intente nuevamente."

**Developer Message:** "Failed to setup video consultation"

**Resolution Steps:**
1. Check Daily.co configuration
2. Verify API key
3. Test in different browser
4. Check room limits

---

### VID_002 - Video Connection Error
**Meaning:** Video call connection failed.

**Patient Message (ES):** "Hubo un problema con la conexión de video."

**Developer Message:** "Video connection error"

**Resolution Steps:**
1. Check internet connection
2. Refresh page
3. Try audio-only fallback
4. Check firewall settings

---

### VID_003 - Video Permission Denied
**Meaning:** User denied camera/microphone access.

**Patient Message (ES):** "Necesita permisos de cámara y micrófono para la videollamada."

**Developer Message:** "Camera/microphone permission denied"

**Resolution Steps:**
1. Show permission instructions
2. Link to browser settings
3. Offer audio-only option

---

### VID_004 - Recording Failed
**Meaning:** Could not record the consultation.

**Patient Message (ES):** "No pudimos grabar la consulta."

**Developer Message:** "Failed to record consultation"

**Resolution Steps:**
1. Check storage quota
2. Verify recording permissions
3. Log error for review
4. Continue without recording

---

## Emergency Error Handling

Emergency errors (`EMG_xxx`) require special handling:

```typescript
import { isEmergencyError, getPatientMessage } from '@/lib/errors';

function handleError(error: AppError) {
  if (isEmergencyError(error.code)) {
    // Show emergency UI
    showEmergencyWarning();
    
    // Log for review
    logEmergency(error);
    
    // Notify medical team if needed
    notifyMedicalTeam(error);
    
    // Display emergency contacts
    return redirectToEmergencyPage();
  }
  
  // Handle normal errors
  return showErrorMessage(getPatientMessage(error));
}
```

---

## HTTP Status Code Mapping

| Error Category | HTTP Status |
|----------------|-------------|
| Validation (VAL_xxx) | 400 Bad Request |
| Authentication (AUTH_xxx) | 401 Unauthorized |
| Authorization (ACC_xxx) | 403 Forbidden |
| Not Found (NF_xxx) | 404 Not Found |
| Rate Limit (RATE_xxx) | 429 Too Many Requests |
| External Service (EXT_xxx) | 502/503 Service Unavailable |
| Server Errors | 500 Internal Server Error |

---

## Related Documentation

- [Error Handler System](/src/lib/errors/README.md)
- [Troubleshooting Guide](/docs/TROUBLESHOOTING.md)
- [API Error Handling](/docs/api/README.md)
