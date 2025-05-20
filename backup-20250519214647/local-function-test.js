// Simple test server that directly invokes the OpenAI API
const http = require('http');
const { OpenAI } = require('openai');

// The API key from the .env file
const OPENAI_API_KEY = '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';

// Doctor instructions
const defaultInstructions = 'Eres un médico virtual compasivo y profesional. Tu objetivo es ayudar a los pacientes a entender sus síntomas y brindarles orientación médica preliminar.';

// Create a simple HTTP server
const server = http.createServer(async (req, res) => {
  console.log(`Received request: ${req.method} ${req.url}`);
  
  // Only handle POST requests to the root path
  if (req.method === 'POST' && req.url === '/') {
    // Collect request body
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        // Parse the JSON body
        const parsedBody = JSON.parse(body);
        const userMessage = parsedBody.message || 'Hola doctor, ¿cómo estás?';
        
        console.log('Processing message:', userMessage);
        
        // Call OpenAI API directly
        try {
          console.log('Creating OpenAI instance...');
          const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
          
          console.log('Sending request to OpenAI with model: gpt-3.5-turbo');
          const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: defaultInstructions },
              { role: 'user', content: userMessage }
            ],
            temperature: 0.7
          });
          
          const text = response.choices?.[0]?.message?.content || '';
          console.log('OpenAI response received. Length:', text.length);
          
          // Send success response
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ 
            text,
            model: 'gpt-3.5-turbo',
            success: true
          }));
        } catch (error) {
          console.error('OpenAI error:', error);
          
          // Send error response
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ 
            error: error.message || 'Internal Error',
            errorType: error.type || error.code || 'unknown',
            success: false,
            fallbackText: "Estoy teniendo problemas con mi conexión a la base de conocimiento médico. Por favor intenta nuevamente en unos momentos."
          }));
        }
      } catch (error) {
        console.error('Error processing request:', error);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ 
          error: 'Internal Server Error',
          details: error.message
        }));
      }
    });
  } else {
    // Handle invalid requests
    res.statusCode = 404;
    res.end('Not Found - Use POST / with JSON body { "message": "Your message here" }');
  }
});

// Start the server
const PORT = 3333;
server.listen(PORT, () => {
  console.log(`
=================================================
Direct OpenAI API test server running on port ${PORT}
=================================================

Test with curl:
curl -X POST http://localhost:${PORT} -H "Content-Type: application/json" -d '{"message":"Hola doctor, tengo dolor de cabeza"}'

This server skips the Netlify functions and calls OpenAI directly.
`);
});