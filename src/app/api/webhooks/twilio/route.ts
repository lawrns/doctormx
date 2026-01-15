import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import {
    createSession,
    addMessage,
    routeHandoff,
    type TriageSummary,
} from '@/lib/whatsapp'
import { generateDrSimeonResponse, isTriageComplete } from '@/lib/ai/drSimeon'

/**
 * POST /api/webhooks/twilio
 * Handle incoming WhatsApp messages from Twilio
 */
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const phoneNumber = formData.get('From') as string
        const messageBody = formData.get('Body') as string
        const mediaUrl = formData.get('MediaUrl0') as string | null
        const mediaType = formData.get('MediaContentType0') as string | null

        if (!phoneNumber || !messageBody) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Get or create session
        const supabase = createServiceClient()
        const { data: existingSession } = await supabase
            .from('whatsapp_sessions')
            .select('*')
            .eq('phone_number', phoneNumber)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

        let sessionId: string

        if (existingSession && existingSession.state !== 'completed') {
            sessionId = existingSession.id
        } else {
            // Create new session
            const newSession = await createSession(phoneNumber)
            sessionId = newSession.sessionId
        }

        // Store incoming message
        await addMessage(
            sessionId,
            messageBody,
            'inbound',
            'patient',
            undefined,
            mediaUrl || undefined,
            mediaType || undefined
        )

        // Get session details
        const { data: session } = await supabase
            .from('whatsapp_sessions')
            .select('*')
            .eq('id', sessionId)
            .single()

        if (!session) {
            throw new Error('Session not found')
        }

        // Get conversation history
        const { data: messages } = await supabase
            .from('whatsapp_messages')
            .select('*')
            .eq('session_id', sessionId)
            .order('created_at', { ascending: true })

        const conversationHistory = (messages || []).map((m: { sender_type: string; body: string }) => ({
            role: (m.sender_type === 'patient' ? 'user' : 'assistant') as 'user' | 'assistant',
            content: m.body as string,
        }))

        let responseMessage: string
        let triageComplete = false
        let triageSummary: TriageSummary | null = null

        // Conduct triage
        if (session.state === 'triage') {
            // Generate AI response
            responseMessage = await generateDrSimeonResponse(
                messageBody,
                conversationHistory
            )

            // Check if triage is complete
            triageComplete = await isTriageComplete(conversationHistory)

            if (triageComplete) {
                // Conduct full OPQRST assessment
                const { conductOPQRSTAssessment } = await import('@/lib/ai/drSimeon')
                const drSimeonSummary = await conductOPQRSTAssessment(conversationHistory)

                // Convert drSimeon summary to whatsapp TriageSummary
                triageSummary = {
                    chiefComplaint: drSimeonSummary.chiefComplaint,
                    symptoms: drSimeonSummary.symptoms,
                    urgencyLevel: drSimeonSummary.urgencyLevel,
                    suggestedSpecialty: drSimeonSummary.suggestedSpecialty,
                    recommendedAction: drSimeonSummary.urgencyLevel === 'red' ? 'emergency_redirect' : 'book_consultation',
                    aiConfidence: drSimeonSummary.aiConfidence,
                }

                // Route to doctor if appropriate
                if (triageSummary.urgencyLevel !== 'red') {
                    const handoff = await routeHandoff(sessionId, triageSummary)
                    if (handoff.success) {
                        responseMessage = `Perfecto. Te conectaremos con un médico especialista. Aquí está el enlace para agendar: ${handoff.bookingLink}\n\nRecuerda: La IA asiste, no diagnostica.`
                    }
                } else if (triageSummary) {
                    // Emergency - provide emergency instructions
                    responseMessage = `⚠️ EMERGENCIA DETECTADA\n\n${drSimeonSummary.redFlags.join('\n')}\n\nLlama al 911 o ve a la sala de emergencias más cercana inmediatamente.`
                }
            }
        } else if (session.state === 'with_doctor') {
            // Message from patient to doctor - forward to doctor
            responseMessage = 'Tu mensaje ha sido enviado al médico. Espera su respuesta.'
        } else {
            responseMessage = 'Lo siento, no puedo procesar tu mensaje en este momento.'
        }

        // Store AI response
        await addMessage(
            sessionId,
            responseMessage,
            'outbound',
            'ai'
        )

        // Update session if triage complete
        if (triageComplete && triageSummary) {
            await supabase
                .from('whatsapp_sessions')
                .update({
                    triage_summary: triageSummary,
                    state: triageSummary.urgencyLevel === 'red' ? 'escalated' : 'awaiting_handoff',
                })
                .eq('id', sessionId)
        }

        // Return Twilio response
        const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${escapeXml(responseMessage)}</Message>
</Response>`

        return new NextResponse(twimlResponse, {
            headers: {
                'Content-Type': 'application/xml',
            },
        })
    } catch (error) {
        console.error('Error processing WhatsApp message:', error)

        const errorResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Lo siento, hubo un error procesando tu mensaje. Por favor intenta de nuevo.</Message>
</Response>`

        return new NextResponse(errorResponse, {
            headers: {
                'Content-Type': 'application/xml',
            },
        })
    }
}

/**
 * Escape XML special characters
 */
function escapeXml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
}
