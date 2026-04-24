import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface SOAPNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

/**
 * AI-powered SOAP structuring endpoint
 * Takes raw dictation text and structures it into proper SOAP format
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { rawText, currentSOAP = {}, appointmentId } = await request.json();
    
    if (!rawText || rawText.length < 10) {
      return NextResponse.json(
        { error: 'Insufficient text for structuring' },
        { status: 400 }
      );
    }

    if (!appointmentId || typeof appointmentId !== 'string') {
      return NextResponse.json(
        { error: 'appointmentId is required' },
        { status: 400 }
      );
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'doctor') {
      return NextResponse.json({ error: 'Only doctors can structure SOAP notes' }, { status: 403 });
    }

    const { data: appointment } = await supabase
      .from('appointments')
      .select('id')
      .eq('id', appointmentId)
      .eq('doctor_id', user.id)
      .single();

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // Use AI to structure the dictation
    const structured = await structureWithAI(rawText, currentSOAP);
    
    return NextResponse.json(structured);
  } catch (error) {
    console.error('SOAP structuring error:', error);
    return NextResponse.json(
      { error: 'Failed to structure SOAP note' },
      { status: 500 }
    );
  }
}

async function structureWithAI(rawText: string, currentSOAP: Partial<SOAPNote>): Promise<Partial<SOAPNote>> {
  // Check if OpenAI API key is available
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    // Fallback: Basic keyword-based structuring
    return fallbackStructure(rawText, currentSOAP);
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Eres un asistente médico experto en estructurar notas SOAP a partir de dictados de voz.
            
Analiza el texto médico dictado y clasifícalo en las 4 secciones SOAP:
- **Subjetivo (S)**: Síntomas reportados por el paciente, dolor, historia
- **Objetivo (O)**: Hallazgos del examen físico, signos vitales, resultados de laboratorio
- **Análisis (A)**: Diagnóstico, impresión clínica, diferenciales
- **Plan (P)**: Tratamiento, medicamentos, estudios solicitados, seguimiento

Responde ÚNICAMENTE en JSON con este formato:
{
  "subjective": "texto clasificado",
  "objective": "texto clasificado", 
  "assessment": "texto clasificado",
  "plan": "texto clasificado"
}

Si una sección no tiene contenido, usa string vacío.`
          },
          {
            role: 'user',
            content: `Texto dictado:\n${rawText}\n\nContenido actual SOAP:\n${JSON.stringify(currentSOAP, null, 2)}`
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (content) {
      const parsed = JSON.parse(content);
      return {
        subjective: parsed.subjective || currentSOAP.subjective || '',
        objective: parsed.objective || currentSOAP.objective || '',
        assessment: parsed.assessment || currentSOAP.assessment || '',
        plan: parsed.plan || currentSOAP.plan || '',
      };
    }
  } catch (error) {
    console.error('AI structuring failed, using fallback:', error);
  }

  return fallbackStructure(rawText, currentSOAP);
}

function fallbackStructure(rawText: string, currentSOAP: Partial<SOAPNote>): Partial<SOAPNote> {
  const text = rawText.toLowerCase();
  const result: Partial<SOAPNote> = { ...currentSOAP };

  // Keywords for each section
  const subjectiveKeywords = ['dolor', 'molestia', 'siente', 'sintoma', 'paciente refiere', 'queja', 'malestar', 'nausea', 'fiebre', 'tos'];
  const objectiveKeywords = ['examen', 'signos vitales', 'presion', 'temperatura', 'ausculta', 'palpa', 'observa', 'hallazgo', 'examinacion'];
  const assessmentKeywords = ['diagnostico', 'diagnóstico', 'impresion', 'clinica', 'parece ser', 'probablemente', 'sospecha', 'considero'];
  const planKeywords = ['receto', 'medicamento', 'tratamiento', 'indico', 'solicito', 'orden', 'seguimiento', 'cita', 'control'];

  // Score each sentence for section
  const sentences = rawText.split(/[.!?]+/).filter(s => s.trim().length > 5);
  
  const sectionScores = {
    subjective: [] as string[],
    objective: [] as string[],
    assessment: [] as string[],
    plan: [] as string[],
  };

  for (const sentence of sentences) {
    const lowerSentence = sentence.toLowerCase();
    let scores = { subjective: 0, objective: 0, assessment: 0, plan: 0 };

    subjectiveKeywords.forEach(kw => { if (lowerSentence.includes(kw)) scores.subjective += 1; });
    objectiveKeywords.forEach(kw => { if (lowerSentence.includes(kw)) scores.objective += 1; });
    assessmentKeywords.forEach(kw => { if (lowerSentence.includes(kw)) scores.assessment += 1; });
    planKeywords.forEach(kw => { if (lowerSentence.includes(kw)) scores.plan += 1; });

    const maxScore = Math.max(...Object.values(scores));
    if (maxScore > 0) {
      const section = Object.entries(scores).find(([_, s]) => s === maxScore)?.[0] as keyof typeof sectionScores;
      sectionScores[section].push(sentence.trim());
    }
  }

  // Merge with existing content
  if (sectionScores.subjective.length > 0) {
    result.subjective = [currentSOAP.subjective, ...sectionScores.subjective].filter(Boolean).join('. ');
  }
  if (sectionScores.objective.length > 0) {
    result.objective = [currentSOAP.objective, ...sectionScores.objective].filter(Boolean).join('. ');
  }
  if (sectionScores.assessment.length > 0) {
    result.assessment = [currentSOAP.assessment, ...sectionScores.assessment].filter(Boolean).join('. ');
  }
  if (sectionScores.plan.length > 0) {
    result.plan = [currentSOAP.plan, ...sectionScores.plan].filter(Boolean).join('. ');
  }

  return result;
}
