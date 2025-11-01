import { Request, Response } from 'express';
import { supabase, supabaseAdmin } from '../lib/supabase.js';
import OpenAI from 'openai';
import multer from 'multer';
import crypto from 'crypto';
import sharp from 'sharp';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Configure multer for image uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5, // Max 5 images per message
  },
  fileFilter: (req: any, file: any, cb: any) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/heic', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido. Use JPG, PNG, HEIC o WEBP.'));
    }
  },
});

// Red flags for emergency triage
const RED_FLAGS = [
  'dolor de pecho',
  'dolor en el pecho',
  'dificultad para respirar',
  'no puedo respirar',
  'sangrado severo',
  'sangrado abundante',
  'pérdida de consciencia',
  'perdí el conocimiento',
  'convulsiones',
  'convulsión',
  'dolor intenso',
  'dolor insoportable',
  'visión borrosa repentina',
  'parálisis',
  'no puedo mover',
  'vomito sangre',
  'sangre en vómito',
  'dolor abdominal severo',
  'confusión severa',
  'fiebre muy alta',
  'fiebre mayor a 40',
];

interface VisionAnalysis {
  type: string;
  description: string;
  findings: string[];
  risk: 'low' | 'moderate' | 'high';
  recommendations: string[];
}

interface TriageResult {
  careLevel: 'ER' | 'URGENT' | 'PRIMARY' | 'SELFCARE';
  redFlags: string[];
  severity: number;
}

/**
 * Perform red flag detection on user input
 */
function detectRedFlags(text: string): string[] {
  const textLower = text.toLowerCase();
  return RED_FLAGS.filter(flag => textLower.includes(flag));
}

/**
 * Triage patient based on symptoms
 */
function triagePatient(text: string, severity?: number): TriageResult {
  const redFlags = detectRedFlags(text);
  
  if (redFlags.length > 0) {
    return {
      careLevel: 'ER',
      redFlags,
      severity: 10,
    };
  }
  
  // Check for urgent keywords
  const urgentKeywords = ['fiebre alta', 'dolor fuerte', 'vómito', 'diarrea severa', 'sangrado'];
  const hasUrgent = urgentKeywords.some(keyword => text.toLowerCase().includes(keyword));
  
  if (hasUrgent || (severity && severity >= 7)) {
    return {
      careLevel: 'URGENT',
      redFlags: [],
      severity: severity || 7,
    };
  }
  
  if (severity && severity >= 4) {
    return {
      careLevel: 'PRIMARY',
      redFlags: [],
      severity,
    };
  }
  
  return {
    careLevel: 'SELFCARE',
    redFlags: [],
    severity: severity || 2,
  };
}

/**
 * Analyze images using OpenAI Vision API
 */
async function analyzeImages(imageUrls: string[], context: string): Promise<VisionAnalysis[]> {
  const analyses: VisionAnalysis[] = [];
  
  for (const imageUrl of imageUrls) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'system',
            content: `Eres un asistente médico que analiza imágenes. Proporciona un análisis objetivo y estructurado. 
            IMPORTANTE: Nunca des un diagnóstico definitivo. Usa términos como "posible", "podría indicar", "sugiere".
            Siempre recomienda consultar con un profesional de la salud.`,
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analiza esta imagen médica. Contexto del paciente: ${context}. Proporciona:
                1. Descripción visual objetiva
                2. Posibles hallazgos (sin diagnóstico definitivo)
                3. Nivel de riesgo (bajo, moderado, alto)
                4. Recomendaciones claras`,
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
        max_tokens: 500,
      });
      
      const content = response.choices[0].message.content || '';
      
      // Parse response into structured format
      analyses.push({
        type: 'general',
        description: content.substring(0, 200),
        findings: [content],
        risk: 'moderate', // Default, should be extracted from response
        recommendations: ['Consultar con un profesional de la salud para evaluación completa'],
      });
    } catch (error) {
      console.error('Vision API error:', error);
      analyses.push({
        type: 'error',
        description: 'No se pudo analizar la imagen',
        findings: [],
        risk: 'moderate',
        recommendations: ['Consultar con un profesional de la salud'],
      });
    }
  }
  
  return analyses;
}

/**
 * Generate AI response using GPT-4
 */
async function generateAIResponse(
  text: string,
  visionFindings: VisionAnalysis[] | null,
  careLevel: string
): Promise<string> {
  const systemPrompt = `Eres el Dr. Simeon, un asistente médico virtual amable y profesional para pacientes en México.

REGLAS CRÍTICAS:
1. NUNCA des diagnósticos definitivos
2. Usa lenguaje comprensible para pacientes
3. Siempre recomienda consultar un profesional cuando sea apropiado
4. Si detectas síntomas graves, recomienda atención inmediata
5. Sé empático pero profesional

${visionFindings ? `ANÁLISIS DE IMÁGENES: ${JSON.stringify(visionFindings, null, 2)}` : ''}

Nivel de atención sugerido: ${careLevel}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: text },
    ],
    max_tokens: 800,
    temperature: 0.7,
  });
  
  return response.choices[0].message.content || 'Lo siento, no pude generar una respuesta. Por favor, intenta de nuevo.';
}

/**
 * Main chat endpoint with image support
 */
export async function chatWithImages(req: any, res: Response) {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'No autenticado' });
    }
    
    const { message, consultId, severity } = req.body;
    const files = (req.files || []) as any[];
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Mensaje requerido' });
    }
    
    // Check free questions
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('free_questions_remaining')
      .eq('id', userId)
      .single();
    
    if (userError || !user) {
      return res.status(500).json({ error: 'Error al verificar usuario' });
    }
    
    if (user.free_questions_remaining <= 0) {
      return res.status(402).json({
        error: 'Sin preguntas gratis',
        needsPayment: true,
        message: 'Has usado tus 5 preguntas gratuitas. Adquiere más consultas para continuar.',
      });
    }
    
    // Triage
    const triage = triagePatient(message, severity);
    
    // If ER, return immediately
    if (triage.careLevel === 'ER') {
      // Log red flag
      await supabaseAdmin.from('red_flags_detected').insert({
        user_id: userId,
        flag_type: 'emergency',
        flag_text: message.substring(0, 500),
        severity: 'critical',
        action_taken: 'emergency_alert_shown',
      });
      
      return res.json({
        careLevel: 'ER',
        redFlags: triage.redFlags,
        message: `🚨 **ATENCIÓN INMEDIATA REQUERIDA**

Tus síntomas requieren atención médica urgente. Por favor:

1. **Llama al 911 inmediatamente**
2. O ve a la sala de urgencias más cercana
3. No esperes - busca ayuda ahora

Este no es un diagnóstico, pero tus síntomas sugieren que necesitas evaluación médica inmediata.`,
        emergency: true,
      });
    }
    
    // Create or get consult
    let currentConsultId = consultId;
    
    if (!currentConsultId) {
      const { data: newConsult, error: consultError } = await supabaseAdmin
        .from('consults')
        .insert({
          user_id: userId,
          care_level: triage.careLevel,
          status: 'active',
          severity: triage.severity,
          chief_complaint: message.substring(0, 200),
        })
        .select()
        .single();
      
      if (consultError || !newConsult) {
        return res.status(500).json({ error: 'Error al crear consulta' });
      }
      
      currentConsultId = newConsult.id;
    }
    
    // Save user message
    const { data: userMessage, error: messageError } = await supabaseAdmin
      .from('messages')
      .insert({
        consult_id: currentConsultId,
        role: 'user',
        content: message,
      })
      .select()
      .single();
    
    if (messageError || !userMessage) {
      return res.status(500).json({ error: 'Error al guardar mensaje' });
    }
    
    // Process images if present
    let visionAnalyses: VisionAnalysis[] | null = null;
    const imageUrls: string[] = [];
    
    if (files && files.length > 0) {
      for (const file of files) {
        // Generate SHA256
        const hash = crypto.createHash('sha256').update(file.buffer).digest('hex');
        
        // Optimize image
        const optimized = await sharp(file.buffer)
          .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 85 })
          .toBuffer();
        
        // Upload to Supabase Storage
        const fileName = `${userId}/${Date.now()}-${hash.substring(0, 8)}.jpg`;
        const { data: uploadData, error: uploadError } = await supabaseAdmin
          .storage
          .from('consult-images')
          .upload(fileName, optimized, {
            contentType: 'image/jpeg',
            cacheControl: '3600',
          });
        
        if (uploadError) {
          console.error('Upload error:', uploadError);
          continue;
        }
        
        // Get signed URL
        const { data: urlData } = await supabaseAdmin
          .storage
          .from('consult-images')
          .createSignedUrl(fileName, 3600 * 24); // 24 hours
        
        if (urlData) {
          imageUrls.push(urlData.signedUrl);
          
          // Save image metadata
          await supabaseAdmin.from('message_images').insert({
            message_id: userMessage.id,
            storage_path: fileName,
            mime_type: 'image/jpeg',
            file_size: optimized.length,
            sha256: hash,
          });
        }
      }
      
      // Run vision analysis
      if (imageUrls.length > 0) {
        visionAnalyses = await analyzeImages(imageUrls, message);
      }
    }
    
    // Generate AI response
    const aiResponse = await generateAIResponse(message, visionAnalyses, triage.careLevel);
    
    // Save AI message
    await supabaseAdmin.from('messages').insert({
      consult_id: currentConsultId,
      role: 'assistant',
      content: aiResponse,
      metadata: {
        vision_analyses: visionAnalyses,
        care_level: triage.careLevel,
      },
    });
    
    // Decrement free questions
    await supabaseAdmin.rpc('decrement_free_questions', { user_id_param: userId });
    
    // Return response
    res.json({
      consultId: currentConsultId,
      messageId: userMessage.id,
      careLevel: triage.careLevel,
      redFlags: triage.redFlags,
      visionFindings: visionAnalyses,
      aiReply: aiResponse,
      imagesProcessed: imageUrls.length,
      questionsRemaining: user.free_questions_remaining - 1,
    });
    
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: 'Error al procesar mensaje',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export const uploadMiddleware = upload.array('images', 5);
