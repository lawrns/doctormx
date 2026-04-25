// WhatsApp outbound pipeline for doctor acquisition
// Input: Scraped Doctoralia leads → Enrich → Send personalized WhatsApp
// Output: Lead tracking with conversion funnel

import { createServiceClient } from '@/lib/supabase/server'

export const OUTBOUND_CONFIG = {
  maxDailyMessages: 250,
  messageDelayMs: 3000,
  templateMessage: (name: string, specialty: string) =>
    `Dr. ${name}, vi tu perfil en Doctoralia. ¿Sabías que puedes tener tu propio perfil verificado en Doctor.mx por $499/mes en lugar de $2,400? Incluye:\n\n✅ IA para tus notas clínicas (SOAP)\n✅ Pacientes por WhatsApp\n✅ Videoconsultas integradas\n✅ Verificación de cédula SEP\n\nPrueba 14 días gratis sin tarjeta: doctor.mx/connect\n\n¿Te interesa?`,
}

export interface OutboundLead {
  id: string
  name: string
  specialty: string | null
  city: string | null
  phone: string | null
  email: string | null
  source: string
  status: 'new' | 'contacted' | 'responded' | 'converted' | 'unsubscribed'
  whatsapp_message_id: string | null
  notes: string | null
  created_at: string
  contacted_at: string | null
  converted_at: string | null
}

export async function addLead(
  lead: Omit<OutboundLead, 'id' | 'status' | 'created_at' | 'contacted_at' | 'converted_at' | 'whatsapp_message_id' | 'notes'>
): Promise<void> {
  const supabase = createServiceClient()

  const { error } = await supabase
    .from('outbound_leads')
    .insert({
      name: lead.name,
      specialty: lead.specialty || null,
      city: lead.city || null,
      phone: lead.phone || null,
      email: lead.email || null,
      source: lead.source || 'doctoralia_scrape',
      status: 'new',
    })

  if (error) {
    console.error('Error adding outbound lead:', error)
    throw new Error(`Failed to add lead: ${error.message}`)
  }
}

export async function getLeads(status?: string): Promise<OutboundLead[]> {
  const supabase = createServiceClient()

  let query = supabase
    .from('outbound_leads')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500)

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching outbound leads:', error)
    return []
  }

  return (data || []) as OutboundLead[]
}

export async function markContacted(
  leadId: string,
  whatsappMessageId?: string
): Promise<void> {
  const supabase = createServiceClient()

  const { error } = await supabase
    .from('outbound_leads')
    .update({
      status: 'contacted',
      contacted_at: new Date().toISOString(),
      whatsapp_message_id: whatsappMessageId || null,
    })
    .eq('id', leadId)

  if (error) {
    console.error('Error marking lead as contacted:', error)
    throw new Error(`Failed to update lead: ${error.message}`)
  }
}

export async function updateLeadStatus(
  leadId: string,
  status: 'contacted' | 'responded' | 'converted' | 'unsubscribed',
  notes?: string
): Promise<void> {
  const supabase = createServiceClient()

  const updateData: Record<string, unknown> = { status }
  if (notes) updateData.notes = notes
  if (status === 'converted') updateData.converted_at = new Date().toISOString()

  const { error } = await supabase
    .from('outbound_leads')
    .update(updateData)
    .eq('id', leadId)

  if (error) {
    console.error('Error updating lead status:', error)
    throw new Error(`Failed to update lead: ${error.message}`)
  }
}

export async function getOutboundStats(): Promise<{
  total: number
  new: number
  contacted: number
  responded: number
  converted: number
  unsubscribed: number
  conversionRate: number
}> {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('outbound_leads')
    .select('status')

  if (error) {
    console.error('Error fetching outbound stats:', error)
    return { total: 0, new: 0, contacted: 0, responded: 0, converted: 0, unsubscribed: 0, conversionRate: 0 }
  }

  const leads = data || []
  const total = leads.length
  const stats = { new: 0, contacted: 0, responded: 0, converted: 0, unsubscribed: 0 }

  for (const lead of leads) {
    const s = lead.status as keyof typeof stats
    if (s in stats) stats[s]++
  }

  const contactedTotal = stats.contacted + stats.responded + stats.converted
  const conversionRate = contactedTotal > 0 ? (stats.converted / contactedTotal) * 100 : 0

  return {
    total,
    ...stats,
    conversionRate: Math.round(conversionRate * 10) / 10,
  }
}

export async function bulkImportLeads(
  leads: Array<{ name: string; specialty?: string; city?: string; phone?: string; email?: string }>
): Promise<{ imported: number; skipped: number }> {
  const supabase = createServiceClient()
  let imported = 0
  let skipped = 0

  for (const lead of leads) {
    if (!lead.name) {
      skipped++
      continue
    }

    const { error } = await supabase
      .from('outbound_leads')
      .insert({
        name: lead.name,
        specialty: lead.specialty || null,
        city: lead.city || null,
        phone: lead.phone || null,
        email: lead.email || null,
        source: 'csv_import',
        status: 'new',
      })

    if (error) {
      skipped++
    } else {
      imported++
    }
  }

  return { imported, skipped }
}
