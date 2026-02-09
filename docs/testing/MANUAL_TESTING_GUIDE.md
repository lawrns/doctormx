# Doctory V2 - Complete Manual Testing Guide

## 🎯 Overview

This guide provides step-by-step instructions to manually test all user stories
in Doctory V2. The application is running on **http://localhost:3001**

---

## 📋 Test Accounts

### Patient Account

- **Email:** `testpatient2026@doctory.com`
- **Password:** `TestPass123!`
- **Role:** Patient
- **Status:** Active ✓

### Doctor Account

- **Email:** `testdoctor2026@doctory.com`
- **Password:** `TestPass123!`
- **Role:** Doctor
- **Status:** Verified ✓
- **Specialty:** Medicina General

### Admin Account

- **Email:** `testadmin2026@doctory.com`
- **Password:** `TestPass123!`
- **Role:** Admin
- **Status:** Active ✓

---

## 🧪 User Story 1: Patient Registration & Login

### 1.1 Access Registration Page

1. Open browser: `http://localhost:3001/auth/register`
2. **Expected:** See patient registration form with fields:
   - Nombre completo
   - Correo electrónico
   - Teléfono (opcional)
   - Contraseña
3. **Verify:** "Crear cuenta gratis" button is visible

### 1.2 Register as Patient (Optional - Use Test Account)

1. Fill in form:
   - Full Name: `Test Patient`
   - Email: `newpatient-{timestamp}@test.com`
   - Phone: `5512345678`
   - Password: `TestPass123!`
2. Click "Crear cuenta gratis"
3. **Expected:** Redirected to `/app` (patient dashboard)

### 1.3 Access Login Page

1. Open: `http://localhost:3001/auth/login`
2. **Expected:** See login form with:
   - Correo electrónico field
   - Contraseña field
   - "Iniciar sesión" button
   - Social login options (Google, GitHub)

### 1.4 Login as Patient

1. Enter credentials:
   - Email: `testpatient2026@doctory.com`
   - Password: `TestPass123!`
2. Click "Iniciar sesión"
3. **Expected:** Redirected to `/app` (patient dashboard)
4. **Verify:** Can see patient dashboard content

### 1.5 Test Invalid Login

1. Go to login page
2. Enter:
   - Email: `testpatient2026@doctory.com`
   - Password: `WrongPassword`
3. Click "Iniciar sesión"
4. **Expected:** Error message: "Invalid login credentials"

---

## 🏥 User Story 2: Doctor Registration & Onboarding

### 2.1 Access Doctor Registration

1. Open: `http://localhost:3001/auth/register?type=doctor`
2. **Expected:** See doctor registration form with:
   - Green badge: "Después del registro, completarás tu perfil profesional"
   - "Registrarme como médico" button (green)

### 2.2 Register as Doctor (Optional - Use Test Account)

1. Fill in form:
   - Full Name: `Dr. Test Doctor`
   - Email: `newdoctor-{timestamp}@test.com`
   - Phone: `5587654321`
   - Password: `TestPass123!`
2. Click "Registrarme como médico"
3. **Expected:** Redirected to `/doctor/onboarding`

### 2.3 Doctor Login

1. Go to: `http://localhost:3001/auth/login`
2. Enter:
   - Email: `testdoctor2026@doctory.com`
   - Password: `TestPass123!`
3. Click "Iniciar sesión"
4. **Expected:** Redirected to `/doctor` (doctor dashboard)

### 2.4 Access Doctor Onboarding

1. Go to: `http://localhost:3001/doctor/onboarding`
2. **Expected:** See onboarding form with sections:
   - Professional Information (Specialty, License, Bio)
   - Availability (Schedule)
   - Pricing (Consultation fee)
3. **Verify:** Can scroll through all sections

### 2.5 Complete Doctor Profile

1. Fill in Professional Info:
   - Specialty: Select from dropdown
   - License Number: `MED-12345`
   - Bio: `Experienced doctor`
2. Set Availability:
   - Monday-Friday: 09:00 - 17:00
   - Saturday: 09:00 - 13:00
   - Sunday: Closed
3. Set Pricing:
   - Consultation Fee: 500 MXN
4. Click "Guardar" or "Continuar"
5. **Expected:** Profile saved successfully

---

## 👥 User Story 3: Browse Doctors

### 3.1 Access Doctors Directory (Public)

1. Open: `http://localhost:3001/doctors`
2. **Expected:** See list of verified doctors with:
   - Doctor name
   - Specialty
   - Rating/Reviews
   - Consultation price
   - "Ver perfil" or "Reservar" button

### 3.2 View Doctor Details

1. Click on any doctor card
2. **Expected:** See doctor profile page with:
   - Doctor photo/avatar
   - Full name and specialty
   - Bio/description
   - Rating and reviews
   - Available time slots
   - "Reservar consulta" button

### 3.3 Filter Doctors by Specialty

1. On doctors page, look for filter/search options
2. Select a specialty (e.g., "Cardiología")
3. **Expected:** List updates to show only doctors with that specialty

### 3.4 Search Doctors by Name

1. On doctors page, find search box
2. Type doctor name
3. **Expected:** List filters to show matching doctors

---

## 📅 User Story 4: Book Appointment

### 4.1 Access Booking Page (as Patient)

1. Login as patient
2. Go to: `http://localhost:3001/doctors`
3. Click on a verified doctor
4. Click "Reservar consulta"
5. **Expected:** Redirected to booking page with:
   - Doctor information
   - Available time slots
   - Date picker

### 4.2 Select Appointment Date & Time

1. Click on date picker
2. Select a future date
3. **Expected:** Available time slots appear for that date
4. Click on a time slot
5. **Expected:** Time slot is selected (highlighted)

### 4.3 Add Appointment Notes

1. In notes field, type: `Consultation for general checkup`
2. **Expected:** Notes are saved

### 4.4 Proceed to Payment

1. Click "Continuar" or "Reservar"
2. **Expected:** Redirected to payment page with:
   - Appointment summary
   - Total price
   - Stripe payment form

### 4.5 Test Payment (Stripe Test Card)

1. Use Stripe test card: `4242 4242 4242 4242`
2. Expiry: Any future date (e.g., 12/25)
3. CVC: Any 3 digits (e.g., 123)
4. Click "Pagar"
5. **Expected:** Payment processed, redirected to success page

---

## 👨‍⚕️ User Story 5: Patient Dashboard

### 5.1 Access Patient Dashboard

1. Login as patient
2. Go to: `http://localhost:3001/app`
3. **Expected:** See dashboard with:
   - Welcome message
   - Upcoming appointments
   - Recent doctors
   - Quick action buttons

### 5.2 View Appointments

1. Click "Mis citas" or "Appointments"
2. **Expected:** See list of all patient appointments with:
   - Doctor name
   - Date and time
   - Status (pending, confirmed, completed)
   - Action buttons (reschedule, cancel, etc.)

### 5.3 View Appointment Details

1. Click on an appointment
2. **Expected:** See full appointment details:
   - Doctor information
   - Date and time
   - Appointment notes
   - Status
   - Chat option

### 5.4 Cancel Appointment

1. Click on an appointment
2. Click "Cancelar cita"
3. **Expected:** Confirmation dialog appears
4. Click "Confirmar"
5. **Expected:** Appointment status changes to "Cancelled"

### 5.5 View Profile

1. Click "Mi perfil" or profile icon
2. **Expected:** See patient profile with:
   - Full name
   - Email
   - Phone
   - Edit button

### 5.6 Edit Profile

1. Click "Editar perfil"
2. Update information (e.g., phone number)
3. Click "Guardar"
4. **Expected:** Changes saved successfully

---

## 🏥 User Story 6: Doctor Dashboard

### 6.1 Access Doctor Dashboard

1. Login as doctor
2. Go to: `http://localhost:3001/doctor`
3. **Expected:** See dashboard with:
   - Welcome message
   - Upcoming appointments
   - Analytics/statistics
   - Quick action buttons

### 6.2 View Appointments

1. Click "Mis citas" or "Appointments"
2. **Expected:** See list of doctor's appointments with:
   - Patient name
   - Date and time
   - Status
   - Action buttons (confirm, complete, etc.)

### 6.3 Confirm Appointment

1. Click on a pending appointment
2. Click "Confirmar cita"
3. **Expected:** Appointment status changes to "Confirmed"

### 6.4 Complete Appointment

1. Click on a confirmed appointment
2. Click "Completar cita"
3. **Expected:** Appointment status changes to "Completed"

### 6.5 Manage Availability

1. Click "Disponibilidad" or "Availability"
2. **Expected:** See calendar/schedule editor with:
   - Days of week
   - Time slots
   - Add/remove availability buttons

### 6.6 Update Availability

1. Select a day (e.g., Monday)
2. Set time: 09:00 - 17:00
3. Click "Guardar"
4. **Expected:** Availability updated successfully

### 6.7 View Profile

1. Click "Mi perfil" or profile icon
2. **Expected:** See doctor profile with:
   - Full name
   - Specialty
   - Bio
   - License number
   - Rating
   - Edit button

### 6.8 Edit Profile

1. Click "Editar perfil"
2. Update information (e.g., bio)
3. Click "Guardar"
4. **Expected:** Changes saved successfully

### 6.9 View Analytics

1. Click "Analítica" or "Analytics"
2. **Expected:** See statistics:
   - Total appointments
   - Completed appointments
   - Ratings
   - Revenue

---

## 👑 User Story 7: Admin Verification

### 7.1 Access Admin Dashboard

1. Login as admin
2. Go to: `http://localhost:3001/admin`
3. **Expected:** See admin dashboard with:
   - Pending doctors count
   - Verification panel
   - Analytics

### 7.2 Access Doctor Verification Panel

1. Click "Verificar doctores" or "Verify Doctors"
2. Go to: `http://localhost:3001/admin/verify`
3. **Expected:** See list of unverified doctors with:
   - Doctor name
   - Specialty
   - Registration date
   - Verify/Reject buttons

### 7.3 Verify Doctor

1. Click on an unverified doctor
2. Review information:
   - Full name
   - License number
   - Specialty
   - Bio
3. Click "Verificar" or "Approve"
4. **Expected:** Doctor status changes to "Verified"
5. **Verify:** Doctor now appears in public doctors list

### 7.4 Reject Doctor

1. Click on an unverified doctor
2. Click "Rechazar" or "Reject"
3. Enter rejection reason (optional)
4. Click "Confirmar"
5. **Expected:** Doctor status changes to "Rejected"

### 7.5 View Admin Analytics

1. Click "Analítica" or "Analytics"
2. **Expected:** See statistics:
   - Total users
   - Total doctors
   - Total appointments
   - Revenue

---

## 💬 User Story 8: Chat System

### 8.1 Access Chat (as Patient)

1. Login as patient
2. Go to: `http://localhost:3001/app/chat`
3. **Expected:** See chat interface with:
   - List of conversations
   - Chat window
   - Message input field

### 8.2 Start Conversation with Doctor

1. Go to doctors list
2. Click on a doctor
3. Click "Enviar mensaje" or "Chat"
4. **Expected:** Chat window opens with doctor

### 8.3 Send Message

1. Type message: `Hello, I have a question about my appointment`
2. Click "Enviar" or press Enter
3. **Expected:** Message appears in chat window

### 8.4 Receive Message (as Doctor)

1. Login as doctor
2. Go to: `http://localhost:3001/doctor/chat`
3. **Expected:** See patient message in conversation

### 8.5 Reply to Message

1. Type reply: `Sure, I'm happy to help`
2. Click "Enviar"
3. **Expected:** Message appears in chat window

---

## 📄 User Story 9: Prescriptions

### 9.1 View Prescriptions (as Patient)

1. Login as patient
2. Go to: `http://localhost:3001/app`
3. Look for "Recetas" or "Prescriptions"
4. **Expected:** See list of prescriptions from completed appointments

### 9.2 View Prescription Details

1. Click on a prescription
2. **Expected:** See:
   - Doctor name
   - Date issued
   - Medications
   - Instructions
   - Download/Print button

### 9.3 Download Prescription

1. Click "Descargar" or "Download"
2. **Expected:** PDF file downloads

### 9.4 Create Prescription (as Doctor)

1. Login as doctor
2. Go to completed appointment
3. Click "Crear receta" or "Create Prescription"
4. **Expected:** Prescription form appears with:
   - Medication list
   - Dosage
   - Instructions
   - Duration

### 9.5 Save Prescription

1. Fill in prescription details
2. Click "Guardar"
3. **Expected:** Prescription saved and sent to patient

---

## ⭐ User Story 10: Reviews & Ratings

### 10.1 View Doctor Reviews

1. Go to: `http://localhost:3001/doctors`
2. Click on a doctor
3. **Expected:** See reviews section with:
   - Average rating (stars)
   - Number of reviews
   - Individual reviews with patient names and comments

### 10.2 Create Review (as Patient)

1. Login as patient
2. Go to completed appointment
3. Click "Dejar reseña" or "Leave Review"
4. **Expected:** Review form appears with:
   - Star rating selector
   - Comment field

### 10.3 Submit Review

1. Select 5 stars
2. Type comment: `Excellent doctor, very professional`
3. Click "Enviar reseña"
4. **Expected:** Review appears in doctor's profile

### 10.4 Edit Review

1. Click on your review
2. Click "Editar"
3. Update rating or comment
4. Click "Guardar"
5. **Expected:** Review updated

### 10.5 Delete Review

1. Click on your review
2. Click "Eliminar"
3. **Expected:** Confirmation dialog
4. Click "Confirmar"
5. **Expected:** Review deleted

---

## 💳 User Story 11: Payment & Billing

### 11.1 View Payment History (as Patient)

1. Login as patient
2. Go to: `http://localhost:3001/app/profile`
3. Click "Historial de pagos" or "Payment History"
4. **Expected:** See list of payments with:
   - Date
   - Doctor name
   - Amount
   - Status

### 11.2 View Invoice

1. Click on a payment
2. **Expected:** See invoice details:
   - Invoice number
   - Date
   - Doctor information
   - Amount
   - Download button

### 11.3 Download Invoice

1. Click "Descargar" or "Download"
2. **Expected:** PDF invoice downloads

### 11.4 View Earnings (as Doctor)

1. Login as doctor
2. Go to: `http://localhost:3001/doctor/finances`
3. **Expected:** See earnings dashboard with:
   - Total earnings
   - Pending payments
   - Completed payments
   - Earnings chart

---

## 🔐 User Story 12: Logout

### 12.1 Logout as Patient

1. Login as patient
2. Click profile icon or menu
3. Click "Cerrar sesión" or "Logout"
4. **Expected:** Redirected to home page
5. **Verify:** Cannot access `/app` without logging in again

### 12.2 Logout as Doctor

1. Login as doctor
2. Click profile icon or menu
3. Click "Cerrar sesión" or "Logout"
4. **Expected:** Redirected to home page
5. **Verify:** Cannot access `/doctor` without logging in again

### 12.3 Logout as Admin

1. Login as admin
2. Click profile icon or menu
3. Click "Cerrar sesión" or "Logout"
4. **Expected:** Redirected to home page
5. **Verify:** Cannot access `/admin` without logging in again

---

## 🔄 User Story 13: Role-Based Access Control

### 13.1 Patient Cannot Access Doctor Routes

1. Login as patient
2. Try to access: `http://localhost:3001/doctor`
3. **Expected:** Redirected to `/app` (patient dashboard)

### 13.2 Doctor Cannot Access Patient Routes

1. Login as doctor
2. Try to access: `http://localhost:3001/app`
3. **Expected:** Redirected to `/doctor` (doctor dashboard)

### 13.3 Non-Admin Cannot Access Admin Routes

1. Login as patient or doctor
2. Try to access: `http://localhost:3001/admin`
3. **Expected:** Redirected to appropriate dashboard or error page

### 13.4 Unauthenticated Cannot Access Protected Routes

1. Logout (or use incognito window)
2. Try to access: `http://localhost:3001/app`
3. **Expected:** Redirected to `/auth/login`

---

## 🐛 Error Handling Tests

### 14.1 Invalid Email Format

1. Go to login page
2. Enter email: `invalid-email`
3. Enter password: `TestPass123!`
4. Click "Iniciar sesión"
5. **Expected:** Error message about invalid email format

### 14.2 Weak Password

1. Go to registration page
2. Enter password: `123`
3. **Expected:** Error message about password strength

### 14.3 Duplicate Email Registration

1. Try to register with: `testpatient2026@doctory.com`
2. **Expected:** Error message: "Email already exists"

### 14.4 Missing Required Fields

1. Go to registration page
2. Leave "Nombre completo" empty
3. Click "Crear cuenta gratis"
4. **Expected:** Error message or field validation

---

## 📊 Performance Tests

### 15.1 Page Load Time

1. Open DevTools (F12)
2. Go to Network tab
3. Visit: `http://localhost:3001/doctors`
4. **Expected:** Page loads in < 3 seconds

### 15.2 API Response Time

1. Open DevTools
2. Go to Network tab
3. Click on `/api/doctors` request
4. **Expected:** Response time < 500ms

### 15.3 Large Data Set

1. Load doctors page with many doctors
2. **Expected:** Page remains responsive

---

## 🔍 Browser Compatibility Tests

### 16.1 Chrome

1. Open in Chrome
2. Test all user stories above
3. **Expected:** All features work correctly

### 16.2 Firefox

1. Open in Firefox
2. Test all user stories above
3. **Expected:** All features work correctly

### 16.3 Safari

1. Open in Safari
2. Test all user stories above
3. **Expected:** All features work correctly

---

## 📱 Responsive Design Tests

### 17.1 Desktop (1920x1080)

1. Resize browser to 1920x1080
2. Test all pages
3. **Expected:** Layout looks good, no overflow

### 17.2 Tablet (768x1024)

1. Resize browser to 768x1024
2. Test all pages
3. **Expected:** Layout adapts, navigation works

### 17.3 Mobile (375x667)

1. Resize browser to 375x667
2. Test all pages
3. **Expected:** Layout adapts, buttons are clickable

---

## ✅ Testing Checklist

Use this checklist to track your testing progress:

- [ ] User Story 1: Patient Registration & Login
- [ ] User Story 2: Doctor Registration & Onboarding
- [ ] User Story 3: Browse Doctors
- [ ] User Story 4: Book Appointment
- [ ] User Story 5: Patient Dashboard
- [ ] User Story 6: Doctor Dashboard
- [ ] User Story 7: Admin Verification
- [ ] User Story 8: Chat System
- [ ] User Story 9: Prescriptions
- [ ] User Story 10: Reviews & Ratings
- [ ] User Story 11: Payment & Billing
- [ ] User Story 12: Logout
- [ ] User Story 13: Role-Based Access Control
- [ ] Error Handling Tests
- [ ] Performance Tests
- [ ] Browser Compatibility Tests
- [ ] Responsive Design Tests

---

## 🆘 Troubleshooting

### Issue: Cannot login

**Solution:** Verify credentials are correct. Check that user exists in
database.

### Issue: Appointment booking fails

**Solution:** Ensure doctor has availability set for the selected date/time.

### Issue: Payment fails

**Solution:** Use valid Stripe test card: `4242 4242 4242 4242`

### Issue: Page not loading

**Solution:** Check that dev server is running on port 3001: `npm run dev`

### Issue: Database connection error

**Solution:** Verify Supabase credentials in `.env.local`

---

## 📞 Support

For issues or questions, contact the development team or check the project
documentation.

**Application URL:** http://localhost:3001 **Dev Server:** Running on port 3001
**Database:** Supabase PostgreSQL
