#!/usr/bin/env node

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOTS = ['src/app', 'src/components']

const PATTERNS = [
  { id: 'oversized-icon-16', regex: /\b(?:w-16 h-16|h-16 w-16|size-16)\b/ },
  { id: 'oversized-icon-20', regex: /\b(?:w-20 h-20|h-20 w-20|size-20)\b/ },
  { id: 'oversized-icon-24', regex: /\b(?:w-24 h-24|h-24 w-24|size-24)\b/ },
  { id: 'bloated-radius', regex: /\b(?:rounded-2xl|rounded-3xl|rounded-\[2rem\])\b/ },
  { id: 'heavy-shadow', regex: /\b(?:shadow-2xl|shadow-dx-[12])\b/ },
  { id: 'purple-pink-gradient', regex: /from-purple-|to-pink-|from-pink-|to-purple-/ },
]

const APPROVED_FILES = new Set([
  'src/components/ui/avatar.tsx',
  'src/components/Avatar.tsx',
  'src/components/AvatarUpload.tsx',
  'src/components/Skeleton.tsx',
  'src/components/animations/advanced-animations.tsx',
  'src/components/animations/index.tsx',
])

const LEGACY_ALLOWED_PREFIXES = [
  'src/app/admin/',
  'src/app/app/ai-consulta/',
  'src/app/app/chat/',
  'src/app/app/followups/',
  'src/app/app/intake/',
  'src/app/app/premium/',
  'src/app/app/profile/',
  'src/app/app/second-opinion/',
  'src/app/app/upload-image/',
  'src/app/app/appointments/[id]/video/',
  'src/app/app/page',
  'src/app/auth/complete-profile/',
  'src/app/auth/forgot-password/',
  'src/app/auth/login/',
  'src/app/auth/reset-password/',
  'src/app/doctor/analytics',
  'src/app/doctor/appointments/loading',
  'src/app/doctor/availability',
  'src/app/doctor/chat',
  'src/app/doctor/finances',
  'src/app/doctor/followups',
  'src/app/doctor/images',
  'src/app/doctor/intake-forms',
  'src/app/doctor/loading',
  'src/app/doctor/pharmacy',
  'src/app/doctor/prescription',
  'src/app/doctor/pricing',
  'src/app/doctor/profile/loading',
  'src/app/doctor/reminders',
  'src/app/doctor/widget',
  'src/app/doctor/appointments/page',
  'src/app/doctor/page',
  'src/app/chat/',
  'src/app/clinica/',
  'src/app/clinicas/',
  'src/app/consulta-online/',
  'src/app/consultation/',
  'src/app/doctors/[id]/',
  'src/app/enfermedades/',
  'src/app/faq/',
  'src/app/payment-success/',
  'src/app/pharmacy/',
  'src/app/preguntas-respuestas/',
  'src/app/privacy/',
  'src/app/terms/',
  'src/app/tratamientos-servicios/',
  'src/app/widget/',
  'src/components/ClinicalCopilot.tsx',
  'src/components/BookingWidget.tsx',
  'src/components/ChatList.tsx',
  'src/components/DoctorReviews.tsx',
  'src/components/EmailCapture.tsx',
  'src/components/EmergencyAlert.tsx',
  'src/components/ImageUploader.tsx',
  'src/components/OnboardingChecklist.tsx',
  'src/components/PatientDashboardContent.tsx',
  'src/components/PreConsultaChat.tsx',
  'src/components/PremiumUpgradeModal.tsx',
  'src/components/PricingBadge.tsx',
  'src/components/ReasoningVisualizer.tsx',
  'src/components/StatCard.tsx',
  'src/components/WhatsAppShare.tsx',
  'src/components/ai-consulta/',
  'src/components/doctor/',
  'src/components/healthcare/DoctorCard.tsx',
  'src/components/referrals/',
  'src/components/soap/',
  'src/components/support/',
]

const EXTENSIONS = new Set(['.tsx', '.ts', '.jsx', '.js'])

function isAllowedLegacy(path) {
  return APPROVED_FILES.has(path) || LEGACY_ALLOWED_PREFIXES.some((prefix) => path.startsWith(prefix))
}

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    const stats = statSync(path)
    if (stats.isDirectory()) {
      walk(path, files)
      continue
    }
    const ext = path.slice(path.lastIndexOf('.'))
    if (EXTENSIONS.has(ext)) files.push(path)
  }
  return files
}

const findings = []

for (const root of ROOTS) {
  for (const file of walk(root)) {
    const rel = relative(process.cwd(), file)
    const text = readFileSync(file, 'utf8')
    const lines = text.split('\n')

    lines.forEach((line, index) => {
      PATTERNS.forEach((pattern) => {
        if (!pattern.regex.test(line)) return
        findings.push({
          path: rel,
          line: index + 1,
          id: pattern.id,
          allowed: isAllowedLegacy(rel),
          text: line.trim().slice(0, 160),
        })
      })
    })
  }
}

const newFindings = findings.filter((finding) => !finding.allowed)
const legacyFindings = findings.filter((finding) => finding.allowed)

if (newFindings.length > 0) {
  console.error(`UI density audit failed: ${newFindings.length} unapproved bulky UI pattern(s).`)
  newFindings.slice(0, 80).forEach((finding) => {
    console.error(`${finding.path}:${finding.line} [${finding.id}] ${finding.text}`)
  })
  if (newFindings.length > 80) console.error(`...and ${newFindings.length - 80} more.`)
  process.exit(1)
}

console.log(`UI density audit passed. ${legacyFindings.length} known legacy exception(s) remain allowlisted.`)
