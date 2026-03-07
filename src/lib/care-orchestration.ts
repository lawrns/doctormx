// Care Orchestration Service
// Input: Care case mutations (create, triage, route, assign, close, escalate)
// Process: State-machine transitions + audit trail
// Output: Updated CareCase / CareEvent records

import { createServiceClient } from '@/lib/supabase/server'
import type {
  CareCase,
  CareEvent,
  CareEventType,
  CareMemoryItem,
  CareRouteReason,
  CareRouting,
  CareStatus,
  CareTriage,
  CreateCareCaseInput,
  FamilyCareProfile,
  PartnerHandoff,
  PartnerType,
  RouteCaseInput,
  RoutingDecision,
  UpdateCaseTriageInput,
} from '@/lib/types/care-case'

// ---------------------------------------------------------------------------
// Row → domain mappers
// ---------------------------------------------------------------------------

interface CareCaseRow {
  id: string
  patient_id: string | null
  phone_number: string | null
  channel: string
  status: string
  chief_complaint: string | null
  symptoms: string[] | null
  urgency: string | null
  specialty: string | null
  specialty_confidence: number | null
  red_flags: string[] | null
  recommended_action: string | null
  routed_to: string | null
  assigned_doctor_id: string | null
  created_at: string
  updated_at: string
  closed_at: string | null
}

interface CareEventRow {
  id: string
  care_case_id: string
  event_type: string
  actor_type: string | null
  actor_id: string | null
  payload: Record<string, unknown> | null
  created_at: string
}

interface FamilyCareProfileRow {
  id: string
  owner_patient_id: string
  related_patient_id: string | null
  relationship: string
  display_name: string
  birth_date: string | null
  sex: string | null
  blood_type: string | null
  allergies: string[] | null
  chronic_conditions: string[] | null
  medications: string[] | null
  notes: string | null
  created_at: string
  updated_at: string
}

interface CareMemoryItemRow {
  id: string
  care_case_id: string | null
  patient_id: string | null
  family_profile_id: string | null
  title: string
  summary: string
  tags: string[] | null
  source_type: string
  source_id: string | null
  created_at: string
  updated_at: string
}

interface PartnerHandoffRow {
  id: string
  care_case_id: string
  partner_type: string
  partner_id: string | null
  status: string
  reason: string
  metadata: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

function toCareCase(row: CareCaseRow): CareCase {
  const hasTriage = row.chief_complaint !== null

  const triage: CareTriage | null = hasTriage
    ? {
        chiefComplaint: row.chief_complaint!,
        symptoms: row.symptoms ?? [],
        urgency: row.urgency as CareTriage['urgency'],
        specialty: row.specialty as CareTriage['specialty'],
        specialtyConfidence: row.specialty_confidence ?? 0,
        redFlags: row.red_flags ?? [],
        recommendedAction: row.recommended_action as CareTriage['recommendedAction'],
      }
    : null

  return {
    id: row.id,
    patientId: row.patient_id,
    phoneNumber: row.phone_number,
    channel: row.channel as CareCase['channel'],
    status: row.status as CareStatus,
    triage,
    routedTo: row.routed_to as RoutingDecision | null,
    assignedDoctorId: row.assigned_doctor_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    closedAt: row.closed_at,
  }
}

function toCareEvent(row: CareEventRow): CareEvent {
  return {
    id: row.id,
    careCaseId: row.care_case_id,
    eventType: row.event_type as CareEventType,
    actorType: row.actor_type as CareEvent['actorType'],
    actorId: row.actor_id,
    payload: row.payload,
    createdAt: row.created_at,
  }
}

function toFamilyCareProfile(row: FamilyCareProfileRow): FamilyCareProfile {
  return {
    id: row.id,
    ownerPatientId: row.owner_patient_id,
    relatedPatientId: row.related_patient_id,
    relationship: row.relationship as FamilyCareProfile['relationship'],
    displayName: row.display_name,
    birthDate: row.birth_date,
    sex: row.sex,
    bloodType: row.blood_type,
    allergies: row.allergies ?? [],
    chronicConditions: row.chronic_conditions ?? [],
    medications: row.medications ?? [],
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function toCareMemoryItem(row: CareMemoryItemRow): CareMemoryItem {
  return {
    id: row.id,
    careCaseId: row.care_case_id,
    patientId: row.patient_id,
    familyProfileId: row.family_profile_id,
    title: row.title,
    summary: row.summary,
    tags: row.tags ?? [],
    sourceType: row.source_type as CareMemoryItem['sourceType'],
    sourceId: row.source_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function toPartnerHandoff(row: PartnerHandoffRow): PartnerHandoff {
  return {
    id: row.id,
    careCaseId: row.care_case_id,
    partnerType: row.partner_type as PartnerType,
    partnerId: row.partner_id,
    status: row.status as PartnerHandoff['status'],
    reason: row.reason,
    metadata: row.metadata,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function deriveCareRouting(triage: CareTriage): CareRouting {
  const hasHighRiskFlags = triage.redFlags.length > 0

  if (triage.urgency === 'emergency') {
    return {
      decision: 'emergency',
      specialty: triage.specialty,
      urgency: triage.urgency,
      reason: 'red-flag-emergency',
      notes: triage.reasoning,
    }
  }

  if (triage.recommendedAction === 'pharmacy') {
    return {
      decision: 'pharmacy',
      specialty: triage.specialty,
      urgency: triage.urgency,
      reason: 'medication-fulfillment',
      recommendedPartnerType: 'pharmacy',
      notes: triage.reasoning,
    }
  }

  if (triage.recommendedAction === 'lab') {
    return {
      decision: 'lab',
      specialty: triage.specialty,
      urgency: triage.urgency,
      reason: 'diagnostic-workup',
      recommendedPartnerType: 'lab',
      notes: triage.reasoning,
    }
  }

  if (triage.urgency === 'high' && hasHighRiskFlags) {
    return {
      decision: 'doctor',
      specialty: triage.specialty,
      urgency: triage.urgency,
      reason: 'urgent-symptom-pattern',
      notes: triage.reasoning,
    }
  }

  if (triage.recommendedAction === 'self-care' && !hasHighRiskFlags) {
    return {
      decision: 'self-care',
      specialty: triage.specialty,
      urgency: triage.urgency,
      reason: 'patient-request',
      notes: triage.reasoning,
    }
  }

  return {
    decision: 'doctor',
    specialty: triage.specialty,
    urgency: triage.urgency,
    reason: 'specialty-match',
    notes: triage.reasoning,
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Create a new care case at the start of any interaction */
export async function createCareCase(input: CreateCareCaseInput): Promise<CareCase> {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('care_cases')
    .insert({
      channel: input.channel,
      patient_id: input.patientId ?? null,
      phone_number: input.phoneNumber ?? null,
      status: 'open' satisfies CareStatus,
    })
    .select()
    .single()

  if (error) throw new Error(`Failed to create care case: ${error.message}`)

  const careCase = toCareCase(data as CareCaseRow)

  await appendCareEvent(careCase.id, 'created', 'system', null, {
    channel: input.channel,
  })

  return careCase
}

export async function routeCaseWithContext(input: {
  careCaseId: string
  routing: CareRouting
}): Promise<CareCase> {
  const careCase = await routeCase({
    careCaseId: input.careCaseId,
    decision: input.routing.decision,
    assignedDoctorId: input.routing.assignedDoctorId ?? undefined,
  })

  await appendCareEvent(careCase.id, 'routed', 'system', null, {
    reason: input.routing.reason satisfies CareRouteReason,
    specialty: input.routing.specialty,
    urgency: input.routing.urgency,
    recommendedPartnerType: input.routing.recommendedPartnerType ?? null,
    recommendedPartnerId: input.routing.recommendedPartnerId ?? null,
    notes: input.routing.notes ?? null,
  })

  return careCase
}

/** Get care case by ID */
export async function getCareCase(id: string): Promise<CareCase | null> {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('care_cases')
    .select()
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // not found
    throw new Error(`Failed to get care case: ${error.message}`)
  }

  return toCareCase(data as CareCaseRow)
}

/** Get open/triaged case for a WhatsApp phone number */
export async function getActiveCareCase(phoneNumber: string): Promise<CareCase | null> {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('care_cases')
    .select()
    .eq('phone_number', phoneNumber)
    .in('status', ['open', 'triaged', 'routed', 'in_care'] satisfies CareStatus[])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw new Error(`Failed to get active care case: ${error.message}`)

  return data ? toCareCase(data as CareCaseRow) : null
}

/** Get open/triaged case for an authenticated patient */
export async function getActiveCareCaseForPatient(patientId: string): Promise<CareCase | null> {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('care_cases')
    .select()
    .eq('patient_id', patientId)
    .in('status', ['open', 'triaged', 'routed', 'in_care'] satisfies CareStatus[])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw new Error(`Failed to get active care case for patient: ${error.message}`)

  return data ? toCareCase(data as CareCaseRow) : null
}

/** Update triage results -- transitions status to 'triaged' */
export async function updateCaseTriage(input: UpdateCaseTriageInput): Promise<CareCase> {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('care_cases')
    .update({
      status: 'triaged' satisfies CareStatus,
      chief_complaint: input.triage.chiefComplaint,
      symptoms: input.triage.symptoms,
      urgency: input.triage.urgency,
      specialty: input.triage.specialty,
      specialty_confidence: input.triage.specialtyConfidence,
      red_flags: input.triage.redFlags,
      recommended_action: input.triage.recommendedAction,
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.careCaseId)
    .select()
    .single()

  if (error) throw new Error(`Failed to update triage: ${error.message}`)

  const careCase = toCareCase(data as CareCaseRow)

  await appendCareEvent(careCase.id, 'triage_completed', 'ai', null, {
    urgency: input.triage.urgency,
    specialty: input.triage.specialty,
    recommendedAction: input.triage.recommendedAction,
  })

  return careCase
}

/** Record routing decision -- transitions status to 'routed' */
export async function routeCase(input: RouteCaseInput): Promise<CareCase> {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('care_cases')
    .update({
      status: 'routed' satisfies CareStatus,
      routed_to: input.decision,
      assigned_doctor_id: input.assignedDoctorId ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.careCaseId)
    .select()
    .single()

  if (error) throw new Error(`Failed to route case: ${error.message}`)

  const careCase = toCareCase(data as CareCaseRow)

  await appendCareEvent(careCase.id, 'routed', 'system', null, {
    decision: input.decision,
    assignedDoctorId: input.assignedDoctorId ?? null,
  })

  return careCase
}

/** Assign doctor -- transitions status to 'in_care' */
export async function assignDoctor(careCaseId: string, doctorId: string): Promise<CareCase> {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('care_cases')
    .update({
      status: 'in_care' satisfies CareStatus,
      assigned_doctor_id: doctorId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', careCaseId)
    .select()
    .single()

  if (error) throw new Error(`Failed to assign doctor: ${error.message}`)

  const careCase = toCareCase(data as CareCaseRow)

  await appendCareEvent(careCase.id, 'doctor_assigned', 'system', doctorId)

  return careCase
}

/** Close a case */
export async function closeCase(careCaseId: string): Promise<CareCase> {
  const supabase = createServiceClient()
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('care_cases')
    .update({
      status: 'closed' satisfies CareStatus,
      updated_at: now,
      closed_at: now,
    })
    .eq('id', careCaseId)
    .select()
    .single()

  if (error) throw new Error(`Failed to close case: ${error.message}`)

  const careCase = toCareCase(data as CareCaseRow)

  await appendCareEvent(careCase.id, 'closed', 'system', null)

  return careCase
}

/** Escalate to emergency */
export async function escalateCase(careCaseId: string, reason: string): Promise<CareCase> {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('care_cases')
    .update({
      status: 'escalated' satisfies CareStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', careCaseId)
    .select()
    .single()

  if (error) throw new Error(`Failed to escalate case: ${error.message}`)

  const careCase = toCareCase(data as CareCaseRow)

  await appendCareEvent(careCase.id, 'escalated', 'system', null, { reason })

  return careCase
}

/** Append to audit trail */
export async function appendCareEvent(
  careCaseId: string,
  eventType: CareEventType,
  actorType: 'patient' | 'ai' | 'doctor' | 'system',
  actorId: string | null,
  payload?: Record<string, unknown>
): Promise<CareEvent> {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('care_case_events')
    .insert({
      care_case_id: careCaseId,
      event_type: eventType,
      actor_type: actorType,
      actor_id: actorId,
      payload: payload ?? null,
    })
    .select()
    .single()

  if (error) throw new Error(`Failed to append care event: ${error.message}`)

  return toCareEvent(data as CareEventRow)
}

// ---------------------------------------------------------------------------
// Link existing sessions
// ---------------------------------------------------------------------------

/** Link a pre-consulta session to a care case */
export async function linkPreConsultaSession(sessionId: string, careCaseId: string): Promise<void> {
  const supabase = createServiceClient()

  const { error } = await supabase
    .from('pre_consulta_sessions')
    .update({ care_case_id: careCaseId })
    .eq('id', sessionId)

  if (error) throw new Error(`Failed to link pre-consulta session: ${error.message}`)
}

/** Link an appointment to a care case */
export async function linkAppointment(appointmentId: string, careCaseId: string): Promise<void> {
  const supabase = createServiceClient()

  const { error } = await supabase
    .from('appointments')
    .update({ care_case_id: careCaseId })
    .eq('id', appointmentId)

  if (error) throw new Error(`Failed to link appointment: ${error.message}`)
}

/** Link a followup to a care case */
export async function linkFollowup(followupId: string, careCaseId: string): Promise<void> {
  const supabase = createServiceClient()

  const { error } = await supabase
    .from('followups')
    .update({ care_case_id: careCaseId })
    .eq('id', followupId)

  if (error) throw new Error(`Failed to link followup: ${error.message}`)
}

export async function linkSecondOpinionRequest(requestId: string, careCaseId: string): Promise<void> {
  await appendCareEvent(careCaseId, 'routed', 'system', null, {
    secondOpinionRequestId: requestId,
    workflow: 'second-opinion',
  })
}

export async function createPartnerHandoff(input: {
  careCaseId: string
  partnerType: PartnerType
  partnerId?: string | null
  reason: string
  metadata?: Record<string, unknown>
}): Promise<PartnerHandoff> {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('care_partner_handoffs')
    .insert({
      care_case_id: input.careCaseId,
      partner_type: input.partnerType,
      partner_id: input.partnerId ?? null,
      status: 'recommended',
      reason: input.reason,
      metadata: input.metadata ?? null,
    })
    .select()
    .single()

  if (error) throw new Error(`Failed to create partner handoff: ${error.message}`)

  await appendCareEvent(input.careCaseId, 'routed', 'system', null, {
    partnerType: input.partnerType,
    partnerId: input.partnerId ?? null,
    handoffReason: input.reason,
  })

  return toPartnerHandoff(data as PartnerHandoffRow)
}

export async function createFamilyCareProfile(input: {
  ownerPatientId: string
  relatedPatientId?: string | null
  relationship: FamilyCareProfile['relationship']
  displayName: string
  birthDate?: string | null
  sex?: string | null
  bloodType?: string | null
  allergies?: string[]
  chronicConditions?: string[]
  medications?: string[]
  notes?: string | null
}): Promise<FamilyCareProfile> {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('family_care_profiles')
    .insert({
      owner_patient_id: input.ownerPatientId,
      related_patient_id: input.relatedPatientId ?? null,
      relationship: input.relationship,
      display_name: input.displayName,
      birth_date: input.birthDate ?? null,
      sex: input.sex ?? null,
      blood_type: input.bloodType ?? null,
      allergies: input.allergies ?? [],
      chronic_conditions: input.chronicConditions ?? [],
      medications: input.medications ?? [],
      notes: input.notes ?? null,
    })
    .select()
    .single()

  if (error) throw new Error(`Failed to create family care profile: ${error.message}`)

  return toFamilyCareProfile(data as FamilyCareProfileRow)
}

export async function addCareMemory(input: {
  title: string
  summary: string
  sourceType: CareMemoryItem['sourceType']
  sourceId?: string | null
  careCaseId?: string | null
  patientId?: string | null
  familyProfileId?: string | null
  tags?: string[]
}): Promise<CareMemoryItem> {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('care_memory_items')
    .insert({
      care_case_id: input.careCaseId ?? null,
      patient_id: input.patientId ?? null,
      family_profile_id: input.familyProfileId ?? null,
      title: input.title,
      summary: input.summary,
      source_type: input.sourceType,
      source_id: input.sourceId ?? null,
      tags: input.tags ?? [],
    })
    .select()
    .single()

  if (error) throw new Error(`Failed to create care memory item: ${error.message}`)

  return toCareMemoryItem(data as CareMemoryItemRow)
}

export async function getDoctorInboxCases(doctorId: string): Promise<CareCase[]> {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('care_cases')
    .select()
    .eq('assigned_doctor_id', doctorId)
    .in('status', ['routed', 'in_care'] satisfies CareStatus[])
    .order('updated_at', { ascending: false })

  if (error) throw new Error(`Failed to get doctor inbox cases: ${error.message}`)

  return (data as CareCaseRow[]).map(toCareCase)
}

// ---------------------------------------------------------------------------
// History
// ---------------------------------------------------------------------------

/** Get full history for a care case */
export async function getCaseHistory(
  careCaseId: string
): Promise<{ careCase: CareCase; events: CareEvent[] }> {
  const supabase = createServiceClient()

  const [caseResult, eventsResult] = await Promise.all([
    supabase.from('care_cases').select().eq('id', careCaseId).single(),
    supabase
      .from('care_case_events')
      .select()
      .eq('care_case_id', careCaseId)
      .order('created_at', { ascending: true }),
  ])

  if (caseResult.error) throw new Error(`Failed to get care case: ${caseResult.error.message}`)
  if (eventsResult.error) throw new Error(`Failed to get care events: ${eventsResult.error.message}`)

  return {
    careCase: toCareCase(caseResult.data as CareCaseRow),
    events: (eventsResult.data as CareEventRow[]).map(toCareEvent),
  }
}
