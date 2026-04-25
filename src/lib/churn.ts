// Churn prevention - identify at-risk doctors and automate re-engagement
// Input: Doctor activity data (logins, appointments, subscription)
// Process: Score risk → Trigger re-engagement → Track outcomes
// Output: ChurnRisk[] with risk levels and recommended actions

import { createServiceClient } from '@/lib/supabase/server'
import { cache } from '@/lib/cache'
import { sendWhatsAppNotification } from '@/lib/whatsapp-notifications'
import { sendEmail } from '@/lib/notifications'
import { logger } from '@/lib/observability/logger'

export interface ChurnRisk {
  doctorId: string
  doctorName: string
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  factors: string[]
  lastActivity: string | null
  appointmentsThisMonth: number
  subscriptionRenewalDate: string | null
}

const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

export async function identifyAtRiskDoctors(): Promise<ChurnRisk[]> {
  const supabase = createServiceClient()

  try {
    // Fetch all approved doctors with subscriptions
    const { data: doctors, error } = await supabase
      .from('doctors')
      .select(`
        id,
        status,
        doctor_subscriptions (
          id,
          status,
          current_period_end
        ),
        profiles!doctors_id_fkey (
          id,
          full_name
        )
      `)
      .eq('status', 'approved')
      .eq('is_listed', true)

    if (error || !doctors) {
      logger.error('Churn identification - failed to fetch doctors', { error: error?.message })
      return []
    }

    // Collect all doctor IDs for batch queries
    const doctorIds = doctors.map((d: { id: string }) => d.id)

    // Batch: get last activity for all doctors (from chat_messages, appointments table)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const now = new Date()
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()

    // Get appointments this month per doctor
    const { data: currentMonthAppts } = await supabase
      .from('appointments')
      .select('doctor_id, id')
      .in('doctor_id', doctorIds)
      .gte('start_ts', currentMonthStart)
      .neq('status', 'cancelled')

    // Get appointments last month per doctor
    const { data: previousMonthAppts } = await supabase
      .from('appointments')
      .select('doctor_id, id')
      .in('doctor_id', doctorIds)
      .gte('start_ts', previousMonthStart)
      .lt('start_ts', currentMonthStart)
      .neq('status', 'cancelled')

    // Get last login activity from profiles (use updated_at as proxy for last activity)
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, updated_at')
      .in('id', doctorIds)

    // Get platform fee disputes (refunds)
    const { data: feeDisputes } = await supabase
      .from('payments')
      .select('doctor_id, id')
      .in('doctor_id', doctorIds)
      .eq('status', 'refunded')
      .gte('created_at', thirtyDaysAgo)

    // Build lookup maps
    const apptCountThisMonth = new Map<string, number>()
    const apptCountLastMonth = new Map<string, number>()
    const profileActivity = new Map<string, string | null>()
    const hasFeeDispute = new Set<string>()

    for (const a of (currentMonthAppts || [])) {
      apptCountThisMonth.set(a.doctor_id, (apptCountThisMonth.get(a.doctor_id) || 0) + 1)
    }
    for (const a of (previousMonthAppts || [])) {
      apptCountLastMonth.set(a.doctor_id, (apptCountLastMonth.get(a.doctor_id) || 0) + 1)
    }
    for (const p of (profiles || [])) {
      profileActivity.set(p.id, p.updated_at)
    }
    for (const f of (feeDisputes || [])) {
      hasFeeDispute.add(f.doctor_id)
    }

    // Assess risk for each doctor
    const results: ChurnRisk[] = []

    for (const doctor of doctors) {
      const typedDoctor = doctor as {
        id: string
        status: string
        doctor_subscriptions: Array<{ id: string; status: string; current_period_end: string }> | null
        profiles: Array<{ id: string; full_name: string }> | null
      }
      const subs = typedDoctor.doctor_subscriptions || []
      const activeSub = subs.find((s: { status: string }) => s.status === 'active')
      const profileData = typedDoctor.profiles?.[0]

      const doctorId = typedDoctor.id
      const factors: string[] = []
      let riskLevel: ChurnRisk['riskLevel'] = 'low'
      const lastActivity = profileActivity.get(doctorId) || null
      const appointmentsThisMonth = apptCountThisMonth.get(doctorId) || 0
      const appointmentsLastMonth = apptCountLastMonth.get(doctorId) || 0
      const subRenewal = activeSub?.current_period_end || null

      // Check: No login in 14 days
      if (lastActivity) {
        const daysSinceActivity = (Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24)
        if (daysSinceActivity >= 14) {
          factors.push('Sin actividad en 14 días')
          riskLevel = 'high'
        } else if (daysSinceActivity >= 7) {
          factors.push('Inactividad por 7 días')
          if (riskLevel === 'low') riskLevel = 'medium'
        }
      } else {
        factors.push('Sin registro de actividad')
        if (riskLevel === 'low') riskLevel = 'medium'
      }

      // Check: 0 appointments in 30 days
      if (appointmentsThisMonth === 0) {
        factors.push('Sin consultas este mes')
        if (riskLevel === 'low' || riskLevel === 'medium') riskLevel = 'high'
      }

      // Check: Declining appointment volume (50%+ drop)
      if (appointmentsLastMonth > 0 && appointmentsThisMonth < appointmentsLastMonth * 0.5) {
        factors.push('Baja de consultas >50% vs mes anterior')
        if (riskLevel === 'low') riskLevel = 'medium'
      }

      // Check: Subscription expiring in 7 days with no activity
      if (subRenewal) {
        const daysToRenewal = (new Date(subRenewal).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        if (daysToRenewal <= 7 && appointmentsThisMonth === 0) {
          factors.push('Suscripción por vencer con 0 consultas')
          riskLevel = 'critical'
        } else if (daysToRenewal <= 7) {
          factors.push('Suscripción por vencer en 7 días')
          if (riskLevel === 'low') riskLevel = 'medium'
        }
      }

      // Check: Platform fee disputes
      if (hasFeeDispute.has(doctorId)) {
        factors.push('Disputa de comisiones')
        if (riskLevel === 'low') riskLevel = 'medium'
      }

      // Only include doctors with at least one risk factor
      if (factors.length > 0) {
        results.push({
          doctorId,
          doctorName: profileData?.full_name || `Doctor ${doctorId.slice(0, 8)}`,
          riskLevel,
          factors,
          lastActivity,
          appointmentsThisMonth,
          subscriptionRenewalDate: subRenewal,
        })
      }
    }

    // Sort by risk level (critical first)
    const riskOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 }
    results.sort((a, b) => riskOrder[a.riskLevel] - riskOrder[b.riskLevel])

    // Cache for 5 minutes
    await cache.set('churn:at-risk', results, 300)

    return results
  } catch (error) {
    logger.error('Churn identification error', { error: error instanceof Error ? error.message : 'unknown' })
    return []
  }
}

export async function getDoctorChurnRisk(doctorId: string): Promise<ChurnRisk | null> {
  // Try cached batch first
  const cachedBatch = await cache.get<ChurnRisk[]>('churn:at-risk')
  if (cachedBatch) {
    return cachedBatch.find(r => r.doctorId === doctorId) || null
  }

  // Fallback: run full analysis
  const all = await identifyAtRiskDoctors()
  return all.find(r => r.doctorId === doctorId) || null
}

export async function triggerReengagement(
  doctorId: string,
  type: 'email' | 'whatsapp'
): Promise<{ success: boolean }> {
  const supabase = createServiceClient()

  try {
    // Get doctor profile info
    const { data: doctor, error } = await supabase
      .from('doctors')
      .select(`
        id,
        profiles!doctors_id_fkey (
          id,
          full_name,
          email,
          phone
        ),
        doctor_specialties (
          specialty:specialties (
            name
          )
        )
      `)
      .eq('id', doctorId)
      .single()

    if (error || !doctor) {
      logger.error('Re-engagement - doctor not found', { doctorId })
      return { success: false }
    }

    const typedDoctor = doctor as {
      id: string
      profiles: Array<{ id: string; full_name: string; email: string | null; phone: string | null }>
      doctor_specialties: Array<{ specialty: Array<{ name: string }> | null }> | null
    }
    const profile = typedDoctor.profiles?.[0]
    const doctorName = profile?.full_name || 'Doctor'
    const specialty = typedDoctor.doctor_specialties?.find(ds => ds.specialty && ds.specialty.length > 0)?.specialty?.[0]?.name || 'tu especialidad'

    if (type === 'whatsapp' && profile?.phone) {
      await sendWhatsAppNotification(profile.phone, 'doctor_available', {
        doctorName,
        specialty,
        bookingLink: `${process.env.NEXT_PUBLIC_APP_URL || 'https://doctory.mx'}/doctor`,
      })
    } else if (type === 'email' && profile?.email) {
      await sendDoctorReengagementEmail(doctorName, 0, specialty, profile.email)
    } else {
      return { success: false }
    }

    await recordRetentionEvent(doctorId, 'reengagement_sent')
    return { success: true }
  } catch (error) {
    logger.error('Re-engagement trigger error', { error: error instanceof Error ? error.message : 'unknown', doctorId })
    return { success: false }
  }
}

export async function recordRetentionEvent(
  doctorId: string,
  event: 'at_risk_identified' | 'reengagement_sent' | 'reengaged' | 'churned' | 'saved',
  riskLevel?: ChurnRisk['riskLevel'],
  details?: Record<string, unknown>
): Promise<void> {
  const supabase = createServiceClient()

  try {
    await supabase.from('retention_events').insert({
      doctor_id: doctorId,
      event_type: event,
      risk_level: riskLevel || null,
      details: details || null,
    })
  } catch (error) {
    logger.error('Retention event recording error', { error: error instanceof Error ? error.message : 'unknown', doctorId, event })
  }
}

// Re-engagement templates
export async function sendDoctorReengagementEmail(
  doctorName: string,
  appointmentCount: number,
  specialty: string,
  email: string
): Promise<void> {
  const importNotifications = await import('@/lib/notifications')
  const { getEmailTemplate } = importNotifications

  const content = `
<p style="margin:0 0 16px;color:#1f2937;font-size:16px;line-height:1.5;">
  Hace tiempo que no te vemos en Doctor.mx. Queremos saber si todo está bien.
</p>
<table role="presentation" style="width:100%;border-collapse:collapse;margin-bottom:20px;">
  <tr>
    <td style="padding:16px;background-color:#f0f9ff;border-radius:6px;border-left:4px solid #0066cc;">
      <p style="margin:0 0 8px;color:#0369a1;font-size:14px;font-weight:600;">Tus estadísticas recientes</p>
      <p style="margin:0;color:#1f2937;font-size:14px;">
        Consultas este mes: <strong>${appointmentCount || 0}</strong><br/>
        Especialidad: <strong>${specialty}</strong>
      </p>
    </td>
  </tr>
</table>
<p style="margin:0 0 16px;color:#1f2937;font-size:16px;line-height:1.5;">
  Tenemos nuevos pacientes en ${specialty} buscando consulta. 
  Tu perfil está activo y listo para recibir pacientes.
</p>
<table role="presentation" style="width:100%;border-collapse:collapse;margin-bottom:20px;">
  <tr>
    <td align="center" style="padding:8px;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://doctory.mx'}/doctor" 
         style="display:inline-block;padding:12px 24px;background-color:#0066cc;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;font-size:16px;">
        Ir al panel médico
      </a>
    </td>
  </tr>
</table>
<p style="margin:0;color:#6b7280;font-size:14px;line-height:1.5;">
  Si tienes dudas sobre la plataforma o necesitas ayuda, responde a este correo.
</p>
`

  await sendEmail({
    to: email,
    subject: `${doctorName}, ¿todo bien? Hay pacientes esperando en Doctor.mx`,
    html: getEmailTemplate(content, doctorName),
    tags: [{ name: 'type', value: 'doctor_reengagement' }],
  })
}
