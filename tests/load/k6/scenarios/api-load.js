/**
 * K6 API Load Test Scenarios
 * 
 * Simulates various load patterns for API endpoints
 * @see https://k6.io/docs/using-k6/scenarios/
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';
import { config } from '../config.js';
import { auth, errors, assertions } from '../utils/helpers.js';

// Custom metrics
const apiErrors = new Counter('api_errors');
const responseTime = new Trend('response_time');
const successRate = new Rate('success_rate');

/**
 * K6 configuration options
 */
export const options = {
  scenarios: {
    // Smoke test - quick verification
    smoke: {
      executor: 'constant-vus',
      vus: 1,
      duration: '1m',
      tags: { scenario: 'smoke' },
      gracefulStop: '30s',
    },
    
    // Load test - normal traffic
    load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '5m', target: 50 },  // Ramp up
        { duration: '10m', target: 50 }, // Stay at peak
        { duration: '5m', target: 0 },   // Ramp down
      ],
      tags: { scenario: 'load' },
      gracefulRampDown: '30s',
    },
    
    // Stress test - find breaking point
    stress: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '5m', target: 100 },
        { duration: '5m', target: 200 },
        { duration: '5m', target: 400 },
        { duration: '10m', target: 400 },
        { duration: '5m', target: 0 },
      ],
      tags: { scenario: 'stress' },
      gracefulRampDown: '30s',
    },
    
    // Spike test - sudden traffic increase
    spike: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 500 },  // Sudden spike
        { duration: '5m', target: 500 },  // Maintain
        { duration: '1m', target: 0 },    // Quick drop
      ],
      tags: { scenario: 'spike' },
      gracefulRampDown: '30s',
    },
    
    // Soak test - endurance
    soak: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10m', target: 30 },
        { duration: '4h', target: 30 },   // Extended period
        { duration: '10m', target: 0 },
      ],
      tags: { scenario: 'soak' },
      gracefulRampDown: '30s',
    },
  },
  
  // Thresholds for all scenarios
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% under 500ms
    http_req_failed: ['rate<0.1'],     // Less than 0.1% errors
    success_rate: ['rate>0.99'],       // 99% success rate
  },
};

/**
 * Setup function - runs once before all iterations
 */
export function setup() {
  const authToken = auth.getAuthToken();
  return { authToken };
}

/**
 * Default function - runs for each VU iteration
 */
export default function (data) {
  const baseUrl = config.baseUrl;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${data.authToken}`,
  };
  
  // Execute API calls
  testHealthEndpoint(baseUrl, headers);
  testDoctorsEndpoint(baseUrl, headers);
  testAppointmentsEndpoint(baseUrl, headers);
  testChatEndpoint(baseUrl, headers);
  
  sleep(1);
}

/**
 * Test health endpoint
 */
function testHealthEndpoint(baseUrl, headers) {
  const start = Date.now();
  const response = http.get(`${baseUrl}/api/health`, { headers });
  const duration = Date.now() - start;
  
  responseTime.add(duration);
  
  const success = check(response, {
    'health status is 200': (r) => r.status === 200,
    'health response time < 200ms': (r) => r.timings.duration < 200,
  });
  
  successRate.add(success);
  
  if (!success) {
    apiErrors.add(1);
    errors.logError('Health check failed', response);
  }
}

/**
 * Test doctors endpoint
 */
function testDoctorsEndpoint(baseUrl, headers) {
  const start = Date.now();
  const response = http.get(`${baseUrl}/api/doctores?limit=10`, { headers });
  const duration = Date.now() - start;
  
  responseTime.add(duration);
  
  const success = check(response, {
    'doctors status is 200': (r) => r.status === 200,
    'doctors response has data': (r) => {
      try {
        const body = JSON.parse(r.body);
        return Array.isArray(body.data);
      } catch {
        return false;
      }
    },
    'doctors response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  successRate.add(success);
  
  if (!success) {
    apiErrors.add(1);
  }
}

/**
 * Test appointments endpoint
 */
function testAppointmentsEndpoint(baseUrl, headers) {
  const start = Date.now();
  const response = http.get(`${baseUrl}/api/patient/appointments`, { headers });
  const duration = Date.now() - start;
  
  responseTime.add(duration);
  
  const success = check(response, {
    'appointments status is 200 or 401': (r) => r.status === 200 || r.status === 401,
    'appointments response time < 300ms': (r) => r.timings.duration < 300,
  });
  
  successRate.add(success);
  
  if (!success) {
    apiErrors.add(1);
  }
}

/**
 * Test chat endpoint
 */
function testChatEndpoint(baseUrl, headers) {
  const payload = JSON.stringify({
    message: 'Hola, tengo una pregunta',
    conversationId: null,
  });
  
  const start = Date.now();
  const response = http.post(`${baseUrl}/api/chat/messages`, payload, { headers });
  const duration = Date.now() - start;
  
  responseTime.add(duration);
  
  const success = check(response, {
    'chat status is 200 or 401': (r) => r.status === 200 || r.status === 401,
    'chat response time < 1000ms': (r) => r.timings.duration < 1000,
  });
  
  successRate.add(success);
  
  if (!success) {
    apiErrors.add(1);
  }
}

/**
 * Teardown function - runs once after all iterations
 */
export function teardown(data) {
  console.log('Load test completed');
}
