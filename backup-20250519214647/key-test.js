const { OpenAI } = require('openai');

// The hardcoded key from the Netlify functions
const API_KEY = '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';

async function testKey() {
  console.log('Testing OpenAI API key...');
  
  try {
    // Create OpenAI instance with the key
    const openai = new OpenAI({ apiKey: API_KEY });
    
    // Make a simple completions request
    console.log('Sending test request to OpenAI API...');
    const result = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Say hello world.' }
      ],
      max_tokens: 10
    });
    
    console.log('API Response:', JSON.stringify(result, null, 2));
    console.log('SUCCESS: API key is valid and working!');
    return true;
  } catch (error) {
    console.error('ERROR: API key test failed:', error);
    if (error.response) {
      console.error('Error details:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    }
    return false;
  }
}

// Run the test
testKey();