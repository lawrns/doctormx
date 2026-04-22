// WhatsApp Doctor System
// Input: Phone number, messages
// Process: Triage conversation → Route to doctor → Track handoffs
// Output: Session with routing decision

import { createServiceClient } from '@/lib/supabase/server'
import { evaluateHardSafety } from '@/lib/ai/safety'

export type TriageOutcome = 'book_consultation' | 'refer_pharmacy' | 'emergency_redirect'

export type TriageSummary = {
    chiefComplaint: string
    symptoms: string[]
    urgencyLevel: 'green' | 'yellow' | 'orange' | 'red'
    suggestedSpecialty?: string
    recommendedAction: TriageOutcome
    aiConfidence: number
}

/**
 * Create a new WhatsApp session
 * Input: phoneNumber
 * Process: Create session record → Initialize state
 * Output: Session ID
 */
export async function createSession(phoneNumber: string) {
    const supabase = createServiceClient()

    try {
        const { data: session, error } = await supabase
            .from('whatsapp_sessions')
            .insert({
                phone_number: phoneNumber,
                state: 'triage',
            })
            .select()
            .single()

        if (error) {
            throw new Error(`Failed to create session: ${error.message}`)
        }

        return {
            success: true,
            sessionId: session.id,
            session,
        }
    } catch (error) {
        console.error('Error creating WhatsApp session:', error)
        throw error
    }
}

/**
 * Add message to WhatsApp session
 * Input: sessionId, message, direction, senderType
 * Process: Store message → Update session
 * Output: Message record
 */
export async function addMessage(
    sessionId: string,
    body: string,
    direction: 'inbound' | 'outbound',
    senderType: 'patient' | 'ai' | 'doctor',
    senderId?: string,
    mediaUrl?: string,
    mediaType?: string,
    whatsappMessageId?: string
) {
    const supabase = createServiceClient()

    try {
        const { data: message, error } = await supabase
            .from('whatsapp_messages')
            .insert({
                session_id: sessionId,
                body,
                direction,
                sender_type: senderType,
                sender_id: senderId,
                media_url: mediaUrl,
                media_type: mediaType,
                whatsapp_message_id: whatsappMessageId,
            })
            .select()
            .single()

        if (error) {
            throw new Error(`Failed to add message: ${error.message}`)
        }

        return {
            success: true,
            message,
        }
    } catch (error) {
        console.error('Error adding WhatsApp message:', error)
        throw error
    }
}

/**
 * Conduct AI triage conversation
 * Input: sessionId, userMessage
 * Process: Analyze symptoms → Determine urgency → Generate response
 * Output: AI response and triage summary if complete
 */
export async function conductTriage(
    sessionId: string,
    userMessage: string
): Promise<{
    success: boolean
    aiResponse: string
    triageComplete: boolean
    summary?: TriageSummary
    error?: string
}> {
    const supabase = createServiceClient()

    try {
        const { data: session, error: sessionError } = await supabase
            .from('whatsapp_sessions')
            .select('*')
            .eq('id', sessionId)
            .single()

        if (sessionError || !session) {
            throw new Error('Session not found')
        }

        const { data: messages, error: messagesError } = await supabase
            .from('whatsapp_messages')
            .select('*')
            .eq('session_id', sessionId)
            .order('created_at', { ascending: true })

        if (messagesError) {
            throw new Error('Failed to fetch conversation history')
        }

        const conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = (messages || []).map(m => ({
            role: m.sender_type === 'patient' ? 'user' : 'assistant',
            content: m.body,
        }))

        const hardSafety = evaluateHardSafety([
            ...conversationHistory.map((message) => ({ content: message.content })),
            { content: userMessage },
        ])
        if (hardSafety.triggered) {
            const aiResponse = hardSafety.response || 'Llama al 911 o acude a urgencias ahora.'
            const summary: TriageSummary = {
                chiefComplaint: 'Posible emergencia',
                symptoms: [hardSafety.category || 'hard_safety_trigger'],
                urgencyLevel: 'red',
                suggestedSpecialty: 'urgencias',
                recommendedAction: 'emergency_redirect',
                aiConfidence: 1,
            }

            await addMessage(sessionId, aiResponse, 'outbound', 'ai')
            await supabase
                .from('whatsapp_sessions')
                .update({
                    triage_summary: summary,
                    state: 'escalated',
                })
                .eq('id', sessionId)

            return {
                success: true,
                aiResponse,
                triageComplete: true,
                summary,
            }
        }

        const { generateDrSimeonResponse, isTriageComplete: checkTriageComplete, conductOPQRSTAssessment } = await import('@/lib/ai/drSimeon')

        const aiResponse = await generateDrSimeonResponse(userMessage, conversationHistory)

        const triageComplete = await checkTriageComplete(conversationHistory)

        let summary: TriageSummary | undefined

        if (triageComplete) {
            const drSimeonSummary = await conductOPQRSTAssessment(conversationHistory)

            summary = {
                chiefComplaint: drSimeonSummary.chiefComplaint,
                symptoms: drSimeonSummary.symptoms,
                urgencyLevel: drSimeonSummary.urgencyLevel,
                suggestedSpecialty: drSimeonSummary.suggestedSpecialty,
                recommendedAction: drSimeonSummary.urgencyLevel === 'red' ? 'emergency_redirect' : 'book_consultation',
                aiConfidence: drSimeonSummary.aiConfidence,
            }
        }

        await addMessage(sessionId, aiResponse, 'outbound', 'ai')

        if (triageComplete && summary) {
            const action = summary.recommendedAction
            await supabase
                .from('whatsapp_sessions')
                .update({
                    triage_summary: summary,
                    state: action === 'emergency_redirect' ? 'escalated' : 'awaiting_handoff',
                })
                .eq('id', sessionId)
        }

        return {
            success: true,
            aiResponse,
            triageComplete,
            summary,
        }
    } catch (error) {
        console.error('Error conducting triage:', error)
        return {
            success: false,
            aiResponse: 'Lo siento, hubo un error. Por favor intenta de nuevo.',
            triageComplete: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        }
    }
}

/**
 * Route handoff to appropriate doctor
 * Input: sessionId, triageSummary
 * Process: Find available doctor → Check handoff limit → Assign
 * Output: Doctor assignment or error
 */
export async function routeHandoff(
    sessionId: string,
    summary: TriageSummary
): Promise<{
    success: boolean
    doctorId?: string
    bookingLink?: string
    error?: string
}> {
    const supabase = createServiceClient()

    try {
        // Get session
        const { data: session, error: sessionError } = await supabase
            .from('whatsapp_sessions')
            .select('*')
            .eq('id', sessionId)
            .single()

        if (sessionError || !session) {
            throw new Error('Session not found')
        }

        // Find available doctors with active subscriptions
        // Prioritize by specialty if suggested
        const query = supabase
            .from('doctors')
            .select(`
        id,
        bio,
        doctor_subscriptions (
          id,
          status,
          current_period_end
        ),
        whatsapp_handoff_limits (
          handoffs_used,
          handoffs_limit
        )
      `)
            .eq('status', 'approved')
            .eq('is_listed', true)

        if (summary.suggestedSpecialty) {
            // Filter by specialty if available
            // This would require joining with doctor_specialties table
        }

        const { data: doctors, error: doctorsError } = await query.limit(10)

        if (doctorsError || !doctors || doctors.length === 0) {
            throw new Error('No available doctors found')
        }

        // Find doctor with available handoff capacity
        let selectedDoctor = null
        for (const doctor of doctors) {
            const subscription = doctor.doctor_subscriptions?.[0]
            if (!subscription || subscription.status !== 'active') {
                continue
            }

            if (new Date(subscription.current_period_end) <= new Date()) {
                continue
            }

            const limits = doctor.whatsapp_handoff_limits?.[0]
            if (limits && limits.handoffs_used >= limits.handoffs_limit) {
                continue
            }

            selectedDoctor = doctor
            break
        }

        if (!selectedDoctor) {
            throw new Error('No doctors available for handoff')
        }

        // Assign doctor to session
        const { error: updateError } = await supabase
            .from('whatsapp_sessions')
            .update({
                assigned_doctor_id: selectedDoctor.id,
                state: 'with_doctor',
                handoff_at: new Date(),
            })
            .eq('id', sessionId)

        if (updateError) {
            throw new Error(`Failed to assign doctor: ${updateError.message}`)
        }

        // Increment handoff counter
        const limits = selectedDoctor.whatsapp_handoff_limits?.[0] as { id: string; handoffs_used: number; handoffs_limit: number } | undefined
        if (limits) {
            await supabase
                .from('whatsapp_handoff_limits')
                .update({
                    handoffs_used: limits.handoffs_used + 1,
                })
                .eq('id', limits.id)
        }

        // Generate booking link with pre-filled triage summary
        const bookingLink = `/book/${selectedDoctor.id}?triage=${encodeURIComponent(JSON.stringify(summary))}`

        return {
            success: true,
            doctorId: selectedDoctor.id,
            bookingLink,
        }
    } catch (error) {
        console.error('Error routing handoff:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        }
    }
}

/**
 * Link WhatsApp session to patient profile
 * Input: sessionId, patientId
 * Process: Update session with patient ID
 * Output: Updated session
 */
export async function linkSessionToPatient(
    sessionId: string,
    patientId: string
) {
    const supabase = createServiceClient()

    try {
        const { data: session, error } = await supabase
            .from('whatsapp_sessions')
            .update({
                patient_id: patientId,
            })
            .eq('id', sessionId)
            .select()
            .single()

        if (error) {
            throw new Error(`Failed to link session: ${error.message}`)
        }

        return {
            success: true,
            session,
        }
    } catch (error) {
        console.error('Error linking session to patient:', error)
        throw error
    }
}

/**
 * Get session details
 * Input: sessionId
 * Process: Query session with full context
 * Output: Session with messages and summary
 */
export async function getSessionDetails(sessionId: string) {
    const supabase = createServiceClient()

    try {
        const { data: session, error: sessionError } = await supabase
            .from('whatsapp_sessions')
            .select('*')
            .eq('id', sessionId)
            .single()

        if (sessionError || !session) {
            return null
        }

        const { data: messages, error: messagesError } = await supabase
            .from('whatsapp_messages')
            .select('*')
            .eq('session_id', sessionId)
            .order('created_at', { ascending: true })

        if (messagesError) {
            return null
        }

        return {
            ...session,
            messages: messages || [],
        }
    } catch (error) {
        console.error('Error getting session details:', error)
        return null
    }
}

/**
 * Complete WhatsApp session
 * Input: sessionId, outcome
 * Process: Mark session as completed
 * Output: Updated session
 */
export async function completeSession(
    sessionId: string,
    outcome: 'completed' | 'escalated'
) {
    const supabase = createServiceClient()

    try {
        const { data: session, error } = await supabase
            .from('whatsapp_sessions')
            .update({
                state: outcome,
                updated_at: new Date(),
            })
            .eq('id', sessionId)
            .select()
            .single()

        if (error) {
            throw new Error(`Failed to complete session: ${error.message}`)
        }

        return {
            success: true,
            session,
        }
    } catch (error) {
        console.error('Error completing session:', error)
        throw error
    }
}
