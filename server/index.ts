import dotenv from 'dotenv';

// IMPORTANTE: Configurar dotenv ANTES de cualquier otra importación
dotenv.config();

import express from 'express';
import cors from 'cors';
import { evaluateRedFlags } from './triage.js';
import { doctorReply } from './providers/openai.js';
import { findSpecialists, validateSearchParams } from './providers/orchestrator.js';
import { verifyWebhook, handleWebhook, healthCheck } from './services/whatsapp/webhook.js';
import { validateWhatsAppConfig } from './services/whatsapp/config.js';
import { getActiveSessionCount } from './services/whatsapp/conversationHandler.js';

const app = express();
app.use(cors());
app.use(express.json());

// Validate WhatsApp configuration on startup
if (validateWhatsAppConfig()) {
  console.log('✅ WhatsApp Cloud API configured');
} else {
  console.warn('⚠️  WhatsApp Cloud API not fully configured - check .env file');
}

app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [], intake } = req.body || {};
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'message requerido' });
    }

    const red = evaluateRedFlags({ message, intake });
    if (red.triggered) {
      const msg = `Con tus datos hay señales de alarma. Motivo: ${red.reasons.join('; ')}. Te recomiendo acudir a urgencias ahora mismo.\n\nEsto no sustituye una evaluación médica profesional.`;
      return res.json({ careLevel: red.action || 'ER', redFlags: red, message: msg });
    }

    const reply = await doctorReply({ history: [...history, { role: 'user', content: message }], redFlags: red });
    res.json({ careLevel: 'PRIMARY', redFlags: red, message: reply });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/api/specialists', async (req, res) => {
  try {
    const params = validateSearchParams(req.body);
    if (!params) {
      return res.status(400).json({
        error: 'Parámetros inválidos. Se requiere specialty.'
      });
    }

    console.log('Búsqueda de especialistas solicitada:', params);
    const result = await findSpecialists(params);

    res.json(result);
  } catch (e) {
    console.error('Error en /api/specialists:', e);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// WhatsApp Cloud API Webhook endpoints
app.get('/api/whatsapp/webhook', verifyWebhook);
app.post('/api/whatsapp/webhook', handleWebhook);

// Health check and monitoring
app.get('/api/health', healthCheck);
app.get('/api/whatsapp/status', (req, res) => {
  res.json({
    status: 'online',
    activeSessions: getActiveSessionCount(),
    timestamp: new Date().toISOString(),
  });
});

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => {
  console.log(`🚀 Doctor.mx API running on http://localhost:${PORT}`);
  console.log(`📞 WhatsApp webhook: http://localhost:${PORT}/api/whatsapp/webhook`);
});