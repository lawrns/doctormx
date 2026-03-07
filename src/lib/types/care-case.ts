/**
 * Unified CareCa (Care Case) domain types for Doctor.mx
 *
 * These canonical types replace the divergent TriageResult (web)
 * and TriageSummary (WhatsApp) with a single domain model that
 * works across all channels.
 */

// -- Enums / unions --------------------------------------------------------

/** Channel through which the patient entered */
export type CareChannel = 'whatsapp' | 'web' | 'voice';

/** State-machine status for a care case */
export type CareStatus =
  | 'open'       // intake in progress
  | 'triaged'    // triage complete, summary generated
  | 'routed'     // routing decision made
  | 'in_care'    // assigned to doctor / care in progress
  | 'closed'     // resolved
  | 'escalated'; // emergency escalation triggered

/** Canonical urgency levels (replaces green/yellow/orange/red AND low/medium/high/emergency) */
export type UrgencyLevel = 'low' | 'medium' | 'high' | 'emergency';

/** Where the patient should be routed after triage */
export type RoutingDecision =
  | 'self-care'
  | 'emergency'
  | 'doctor'
  | 'pharmacy'
  | 'lab';

/** Specialty slugs currently supported by Doctor.mx */
export type SpecialtySlug =
  | 'medicina-general'
  | 'pediatria'
  | 'ginecologia'
  | 'dermatologia'
  | 'salud-mental'
  | 'gastroenterologia'
  | 'cardiologia'
  | 'neurologia'
  | 'ortopedia'
  | 'oftalmologia'
  | string; // extensible for future specialties

// -- Core domain objects ---------------------------------------------------

/** Unified triage summary -- replaces both TriageResult and WhatsApp TriageSummary */
export interface CareTriage {
  chiefComplaint: string;
  symptoms: string[];
  urgency: UrgencyLevel;
  specialty: SpecialtySlug;
  specialtyConfidence: number;       // 0-1
  redFlags: string[];
  recommendedAction: RoutingDecision;
  reasoning?: string;                // LLM explanation
}

/** The central domain object -- one per patient interaction */
export interface CareCase {
  id: string;
  patientId: string | null;          // null for anonymous
  phoneNumber: string | null;        // for WhatsApp cases
  channel: CareChannel;
  status: CareStatus;
  triage: CareTriage | null;         // null until triage complete
  routedTo: RoutingDecision | null;
  assignedDoctorId: string | null;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
}

// -- Audit trail -----------------------------------------------------------

export type CareEventType =
  | 'created'
  | 'message'
  | 'triage_completed'
  | 'routed'
  | 'doctor_assigned'
  | 'appointment_booked'
  | 'appointment_completed'
  | 'follow_up_sent'
  | 'closed'
  | 'escalated';

export interface CareEvent {
  id: string;
  careCaseId: string;
  eventType: CareEventType;
  actorType: 'patient' | 'ai' | 'doctor' | 'system' | null;
  actorId: string | null;
  payload: Record<string, unknown> | null;
  createdAt: string;
}

// -- Mutation inputs -------------------------------------------------------

export interface CreateCareCaseInput {
  channel: CareChannel;
  patientId?: string;
  phoneNumber?: string;
}

export interface UpdateCaseTriageInput {
  careCaseId: string;
  triage: CareTriage;
}

export interface RouteCaseInput {
  careCaseId: string;
  decision: RoutingDecision;
  assignedDoctorId?: string;
}
