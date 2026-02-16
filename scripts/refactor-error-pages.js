#!/usr/bin/env node

/**
 * Error Page Unifier Script for DoctorMX
 * 
 * This script replaces all 71 error.tsx files with simplified wrappers
 * that use the unified ErrorPage component.
 */

const fs = require('fs');
const path = require('path');

// Configuration for each error file
const errorFiles = [
  // Root
  { path: 'src/app/error.tsx', title: 'Algo salió mal', variant: 'default', context: 'Root' },
  
  // Admin routes
  { path: 'src/app/admin/error.tsx', title: 'Error en el panel de administración', variant: 'admin', context: 'Admin' },
  { path: 'src/app/admin/ai-dashboard/error.tsx', title: 'Error en AI Dashboard', variant: 'admin', context: 'AI Dashboard' },
  { path: 'src/app/admin/analytics/error.tsx', title: 'Error en Analytics', variant: 'admin', context: 'Admin Analytics' },
  { path: 'src/app/admin/pharmacy/error.tsx', title: 'Error en Farmacias', variant: 'admin', context: 'Admin Pharmacy' },
  { path: 'src/app/admin/premium/error.tsx', title: 'Error en Premium', variant: 'admin', context: 'Admin Premium' },
  { path: 'src/app/admin/verify/error.tsx', title: 'Error en Verificación', variant: 'admin', context: 'Admin Verify' },
  
  // AI Consulta
  { path: 'src/app/ai-consulta/error.tsx', title: 'Error en consulta AI', variant: 'medical', context: 'AI Consulta' },
  
  // App (Patient Portal)
  { path: 'src/app/app/error.tsx', title: 'Error en la aplicación', variant: 'patient', context: 'Patient App' },
  { path: 'src/app/app/ai-consulta/error.tsx', title: 'Error en consulta AI', variant: 'patient', context: 'Patient AI Consulta' },
  { path: 'src/app/app/appointments/[id]/video/error.tsx', title: 'Error en videollamada', variant: 'patient', context: 'Video Appointment' },
  { path: 'src/app/app/chat/error.tsx', title: 'Error en chat', variant: 'patient', context: 'Patient Chat' },
  { path: 'src/app/app/consent/error.tsx', title: 'Error en consentimientos', variant: 'patient', context: 'Patient Consent' },
  { path: 'src/app/app/consent/new/error.tsx', title: 'Error al crear consentimiento', variant: 'patient', context: 'Patient Consent New' },
  { path: 'src/app/app/consent/[id]/error.tsx', title: 'Error en consentimiento', variant: 'patient', context: 'Patient Consent Detail' },
  { path: 'src/app/app/data-rights/error.tsx', title: 'Error en derechos de datos', variant: 'patient', context: 'Patient Data Rights' },
  { path: 'src/app/app/data-rights/[id]/error.tsx', title: 'Error en solicitud', variant: 'patient', context: 'Patient Data Rights Detail' },
  { path: 'src/app/app/followups/error.tsx', title: 'Error en seguimientos', variant: 'patient', context: 'Patient Followups' },
  { path: 'src/app/app/premium/error.tsx', title: 'Error en Premium', variant: 'patient', context: 'Patient Premium' },
  { path: 'src/app/app/profile/error.tsx', title: 'Error en perfil', variant: 'patient', context: 'Patient Profile' },
  { path: 'src/app/app/second-opinion/error.tsx', title: 'Error en segunda opinión', variant: 'patient', context: 'Patient Second Opinion' },
  { path: 'src/app/app/second-opinion/[id]/error.tsx', title: 'Error en segunda opinión', variant: 'patient', context: 'Patient Second Opinion Detail' },
  { path: 'src/app/app/upload-image/error.tsx', title: 'Error al subir imagen', variant: 'patient', context: 'Patient Upload Image' },
  
  // Appointments
  { path: 'src/app/appointments/error.tsx', title: 'Error en citas', variant: 'medical', context: 'Appointments' },
  
  // Assistant
  { path: 'src/app/assistant/error.tsx', title: 'Error en asistente', variant: 'default', context: 'Assistant' },
  
  // Auth routes
  { path: 'src/app/auth/error.tsx', title: 'Error de autenticación', variant: 'auth', context: 'Auth' },
  { path: 'src/app/auth/complete-profile/error.tsx', title: 'Error al completar perfil', variant: 'auth', context: 'Auth Complete Profile' },
  { path: 'src/app/auth/forgot-password/error.tsx', title: 'Error en recuperación', variant: 'auth', context: 'Auth Forgot Password' },
  { path: 'src/app/auth/login/error.tsx', title: 'Error al iniciar sesión', variant: 'auth', context: 'Auth Login' },
  { path: 'src/app/auth/register/error.tsx', title: 'Error al registrarse', variant: 'auth', context: 'Auth Register' },
  { path: 'src/app/auth/reset-password/error.tsx', title: 'Error al restablecer', variant: 'auth', context: 'Auth Reset Password' },
  
  // Book
  { path: 'src/app/book/[doctorId]/error.tsx', title: 'Error al agendar cita', variant: 'medical', context: 'Book Appointment' },
  
  // Chat
  { path: 'src/app/chat/[conversationId]/error.tsx', title: 'Error en conversación', variant: 'medical', context: 'Chat Conversation' },
  
  // Checkout
  { path: 'src/app/checkout/[appointmentId]/error.tsx', title: 'Error en pago', variant: 'medical', context: 'Checkout' },
  
  // Claim
  { path: 'src/app/claim/[doctorId]/error.tsx', title: 'Error al reclamar perfil', variant: 'medical', context: 'Claim Profile' },
  
  // Consultation
  { path: 'src/app/consultation/[appointmentId]/error.tsx', title: 'Error en consulta', variant: 'medical', context: 'Consultation' },
  
  // Contact
  { path: 'src/app/contact/error.tsx', title: 'Error en contacto', variant: 'default', context: 'Contact' },
  
  // Doctor routes
  { path: 'src/app/doctor/error.tsx', title: 'Error en el portal de médicos', variant: 'doctor-portal', context: 'Doctor Portal' },
  { path: 'src/app/doctor/analytics/error.tsx', title: 'Error en analytics', variant: 'doctor-portal', context: 'Doctor Analytics' },
  { path: 'src/app/doctor/analytics-ai/error.tsx', title: 'Error en AI Analytics', variant: 'doctor-portal', context: 'Doctor AI Analytics' },
  { path: 'src/app/doctor/appointments/error.tsx', title: 'Error en citas', variant: 'doctor-portal', context: 'Doctor Appointments' },
  { path: 'src/app/doctor/availability/error.tsx', title: 'Error en disponibilidad', variant: 'doctor-portal', context: 'Doctor Availability' },
  { path: 'src/app/doctor/chat/error.tsx', title: 'Error en chat', variant: 'doctor-portal', context: 'Doctor Chat' },
  { path: 'src/app/doctor/consultation/[appointmentId]/error.tsx', title: 'Error en consulta', variant: 'doctor-portal', context: 'Doctor Consultation' },
  { path: 'src/app/doctor/finances/error.tsx', title: 'Error en finanzas', variant: 'doctor-portal', context: 'Doctor Finances' },
  { path: 'src/app/doctor/followups/error.tsx', title: 'Error en seguimientos', variant: 'doctor-portal', context: 'Doctor Followups' },
  { path: 'src/app/doctor/images/[analysisId]/error.tsx', title: 'Error en análisis', variant: 'doctor-portal', context: 'Doctor Image Analysis' },
  { path: 'src/app/doctor/onboarding/error.tsx', title: 'Error en onboarding', variant: 'doctor-portal', context: 'Doctor Onboarding' },
  { path: 'src/app/doctor/pharmacy/error.tsx', title: 'Error en farmacia', variant: 'doctor-portal', context: 'Doctor Pharmacy' },
  { path: 'src/app/doctor/prescription/[appointmentId]/error.tsx', title: 'Error en receta', variant: 'doctor-portal', context: 'Doctor Prescription' },
  { path: 'src/app/doctor/pricing/error.tsx', title: 'Error en precios', variant: 'doctor-portal', context: 'Doctor Pricing' },
  { path: 'src/app/doctor/profile/error.tsx', title: 'Error en perfil', variant: 'doctor-portal', context: 'Doctor Profile' },
  { path: 'src/app/doctor/subscription/error.tsx', title: 'Error en suscripción', variant: 'doctor-portal', context: 'Doctor Subscription' },
  { path: 'src/app/doctor/[specialty]/error.tsx', title: 'Error al cargar especialidad', variant: 'doctor-portal', context: 'Doctor Specialty' },
  { path: 'src/app/doctor/[specialty]/[city]/error.tsx', title: 'Error al cargar especialidad', variant: 'doctor-portal', context: 'Doctor Specialty City' },
  
  // Doctores (Public)
  { path: 'src/app/doctores/error.tsx', title: 'Error al cargar doctores', variant: 'medical', context: 'Doctores List' },
  { path: 'src/app/doctores/[id]/error.tsx', title: 'Error al cargar doctor', variant: 'medical', context: 'Doctor Detail' },
  
  // Followups
  { path: 'src/app/followups/error.tsx', title: 'Error en seguimientos', variant: 'medical', context: 'Followups' },
  
  // For Doctors
  { path: 'src/app/for-doctors/error.tsx', title: 'Error al cargar página', variant: 'default', context: 'For Doctors' },
  
  // Help
  { path: 'src/app/help/error.tsx', title: 'Error en ayuda', variant: 'default', context: 'Help' },
  
  // Payment Success
  { path: 'src/app/payment-success/error.tsx', title: 'Error en pago', variant: 'medical', context: 'Payment Success' },
  
  // Pharmacy
  { path: 'src/app/pharmacy/affiliate/error.tsx', title: 'Error en farmacia', variant: 'medical', context: 'Pharmacy Affiliate' },
  { path: 'src/app/pharmacy/affiliate/[pharmacyId]/error.tsx', title: 'Error en farmacia', variant: 'medical', context: 'Pharmacy Affiliate Detail' },
  
  // Pricing
  { path: 'src/app/pricing/error.tsx', title: 'Error en precios', variant: 'default', context: 'Pricing' },
  
  // Privacy
  { path: 'src/app/privacy/error.tsx', title: 'Error al cargar página', variant: 'default', context: 'Privacy' },
  
  // Profile (Public)
  { path: 'src/app/profile/error.tsx', title: 'Error al cargar perfil', variant: 'default', context: 'Public Profile' },
  
  // SOAP Demo
  { path: 'src/app/soap-demo/error.tsx', title: 'Error en demo SOAP', variant: 'medical', context: 'SOAP Demo' },
  
  // Specialties
  { path: 'src/app/specialties/error.tsx', title: 'Error en especialidades', variant: 'medical', context: 'Specialties' },
  
  // Terms
  { path: 'src/app/terms/error.tsx', title: 'Error al cargar página', variant: 'default', context: 'Terms' },
  
  // Unauthorized
  { path: 'src/app/unauthorized/error.tsx', title: 'Acceso no autorizado', variant: 'auth', context: 'Unauthorized' },
];

// Generate wrapper content for an error file
function generateWrapper(config) {
  return `'use client'

import { ErrorPage } from '@/components/ui/error/ErrorPage'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <ErrorPage
      title="${config.title}"
      error={error}
      reset={reset}
      variant="${config.variant}"
      context="${config.context}"
    />
  )
}
`;
}

// Main function
async function main() {
  const results = {
    success: [],
    errors: [],
    skipped: [],
  };

  console.log('🚀 Starting Error Page Unification...\n');
  console.log(`📊 Total files to process: ${errorFiles.length}\n`);

  for (const config of errorFiles) {
    const fullPath = path.join(process.cwd(), config.path);
    
    try {
      // Check if directory exists
      const dir = path.dirname(fullPath);
      if (!fs.existsSync(dir)) {
        results.errors.push({ path: config.path, error: 'Directory does not exist' });
        console.log(`❌ ${config.path} - Directory does not exist`);
        continue;
      }

      // Generate and write new content
      const content = generateWrapper(config);
      fs.writeFileSync(fullPath, content, 'utf8');
      
      results.success.push(config.path);
      console.log(`✅ ${config.path}`);
    } catch (error) {
      results.errors.push({ path: config.path, error: error.message });
      console.log(`❌ ${config.path} - ${error.message}`);
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📋 SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Successfully updated: ${results.success.length}`);
  console.log(`❌ Errors: ${results.errors.length}`);
  console.log(`⏭️  Skipped: ${results.skipped.length}`);
  console.log('='.repeat(60));

  // Write report
  const report = `# Error Page Unification Report

## Summary
- **Total Files**: ${errorFiles.length}
- **Successfully Updated**: ${results.success.length}
- **Errors**: ${results.errors.length}
- **Skipped**: ${results.skipped.length}

## Successfully Updated Files
${results.success.map(f => `- ✅ ${f}`).join('\n')}

${results.errors.length > 0 ? `## Errors
${results.errors.map(e => `- ❌ ${e.path}: ${e.error}`).join('\n')}
` : ''}

## Variants Used
${Object.entries(errorFiles.reduce((acc, f) => {
  acc[f.variant] = (acc[f.variant] || 0) + 1;
  return acc;
}, {})).map(([variant, count]) => `- **${variant}**: ${count} files`).join('\n')}
`;

  const reportPath = path.join(process.cwd(), 'error-page-refactor.md');
  fs.writeFileSync(reportPath, report, 'utf8');
  console.log(`\n📝 Report written to: error-page-refactor.md`);

  return results;
}

main().catch(console.error);
