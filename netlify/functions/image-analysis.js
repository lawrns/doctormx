const OpenAIpkg = require('openai');
const OpenAI = OpenAIpkg.default || OpenAIpkg;

// Environment variable for OpenAI API key
const openaiKey = process.env.OPENAI_API_KEY;

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  try {
    const { imageUrl, symptoms } = JSON.parse(event.body);
    if (!imageUrl) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing imageUrl' }) };
    }
    // Build prompt for vision-capable model with embedded image markdown
    const prompt = [
      { role: 'system', content: process.env.VITE_DOCTOR_INSTRUCTIONS || 'Eres un médico virtual compasivo y profesional. Proporciona un análisis de imágenes médicas.' },
      { role: 'user', content: `Analiza la siguiente imagen y describe los hallazgos:

![imagen](${imageUrl})${symptoms ? `

Síntomas: ${symptoms}` : ''}` }
    ];
    const openai = new OpenAI({ apiKey: openaiKey });
    const completion = await openai.chat.completions.create({
      model: process.env.VITE_IMAGE_ANALYSIS_MODEL || 'gpt-4o-mini',
      messages: prompt,
      temperature: 0.7
    });
    const analysis = completion.choices?.[0]?.message?.content || '';
    return { statusCode: 200, body: JSON.stringify({ analysis }) };
  } catch (error) {
    console.error('Image analysis error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message || 'Internal Error' }) };
  }
};