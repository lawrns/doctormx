const OpenAIpkg = require('openai');
const OpenAI = OpenAIpkg.default || OpenAIpkg;
const { createClient } = require('@supabase/supabase-js');

// Environment variables for Supabase and OpenAI
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const openaiKey = process.env.OPENAI_API_KEY;
const defaultInstructions = process.env.VITE_DOCTOR_INSTRUCTIONS ||
  'Eres un médico virtual compasivo y profesional. Tu objetivo es ayudar a los pacientes a entender sus síntomas y brindarles orientación médica preliminar.';

// Initialize Supabase client (if needed for future enhancements)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  let params;
  try {
    params = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }
  const { message } = params;
  try {
    const openai = new OpenAI({ apiKey: openaiKey });
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: defaultInstructions },
        { role: 'user', content: message }
      ],
      temperature: 0.7
    });
    const text = response.choices?.[0]?.message?.content || '';
    return {
      statusCode: 200,
      body: JSON.stringify({ text })
    };
  } catch (error) {
    console.error('OpenAI error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Internal Error' })
    };
  }
};