// API connectivity test with built-in fetch
const https = require('https');
const http = require('http');

// Test configuration
const TEST_CONFIG = {
  localServerURL: 'http://localhost:5173', // Typical Vite dev server
  netlifyDevServer: 'http://localhost:8888', // Typical Netlify dev server
  productionURL: 'https://doctormx.netlify.app',
  endpoints: [
    '/api/v1/standard-model',
    '/.netlify/functions/standard-model'
  ],
  testMessage: 'Hola doctor, tengo dolor de cabeza'
};

function makeRequest(url, method, data) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https:');
    const lib = isHttps ? https : http;
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const req = lib.request(options, (res) => {
      let responseBody = '';
      
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: responseBody
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testEndpoint(baseURL, endpoint) {
  const url = `${baseURL}${endpoint}`;
  console.log(`Testing endpoint: ${url}`);
  
  try {
    const response = await makeRequest(url, 'POST', {
      message: TEST_CONFIG.testMessage
    });
    
    console.log(`Status: ${response.statusCode}`);
    
    if (response.statusCode >= 200 && response.statusCode < 300) {
      let data;
      try {
        data = JSON.parse(response.body);
        console.log('Response:', JSON.stringify(data).substring(0, 200) + '...');
      } catch (e) {
        console.log('Response (not JSON):', response.body.substring(0, 200) + '...');
      }
      return true;
    } else {
      console.error('Error response:', response.body);
      return false;
    }
  } catch (error) {
    console.error(`Failed to connect to ${url}:`, error.message);
    return false;
  }
}

async function runTests() {
  console.log('=== API CONNECTIVITY TESTS ===');
  
  // Test production endpoints
  console.log('\n--- PRODUCTION TESTS ---');
  for (const endpoint of TEST_CONFIG.endpoints) {
    await testEndpoint(TEST_CONFIG.productionURL, endpoint);
  }
  
  // Test local server if running
  console.log('\n--- LOCAL DEV SERVER TESTS ---');
  for (const endpoint of TEST_CONFIG.endpoints) {
    await testEndpoint(TEST_CONFIG.localServerURL, endpoint);
  }
  
  // Test local Netlify server if running
  console.log('\n--- LOCAL NETLIFY SERVER TESTS ---');
  for (const endpoint of TEST_CONFIG.endpoints) {
    await testEndpoint(TEST_CONFIG.netlifyDevServer, endpoint);
  }
  
  console.log('\n=== TESTS COMPLETED ===');
}

// Run all tests
runTests();