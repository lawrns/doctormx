/**
 * Auth Endpoint Load Test
 * 
 * Tests authentication endpoints under load
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter } from 'k6/metrics';

const authErrors = new Counter('auth_errors');

export const options = {
  stages: [
    { duration: '1m', target: 50 },
    { duration: '3m', target: 50 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    auth_errors: ['count<10'],
  },
};

const BASE_URL = 'http://localhost:3000';

export default function () {
  // Test login endpoint
  testLogin();
  sleep(1);
  
  // Test register endpoint
  testRegister();
  sleep(1);
  
  // Test session endpoint
  testSession();
  sleep(1);
}

function testLogin() {
  const payload = JSON.stringify({
    email: `loadtest_${__VU}_${Date.now()}@example.com`,
    password: 'TestPassword123!',
  });
  
  const response = http.post(`${BASE_URL}/api/auth/login`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });
  
  const success = check(response, {
    'login status is 200 or 401': (r) => r.status === 200 || r.status === 401,
    'login response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  if (!success) {
    authErrors.add(1);
  }
}

function testRegister() {
  const payload = JSON.stringify({
    email: `newuser_${__VU}_${Date.now()}@example.com`,
    password: 'TestPassword123!',
    name: 'Load Test User',
    userType: 'patient',
  });
  
  const response = http.post(`${BASE_URL}/api/auth/register`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });
  
  const success = check(response, {
    'register status is 201 or 400': (r) => r.status === 201 || r.status === 400,
    'register response time < 800ms': (r) => r.timings.duration < 800,
  });
  
  if (!success) {
    authErrors.add(1);
  }
}

function testSession() {
  const response = http.get(`${BASE_URL}/api/auth/session`);
  
  const success = check(response, {
    'session status is 200': (r) => r.status === 200,
    'session response time < 200ms': (r) => r.timings.duration < 200,
  });
  
  if (!success) {
    authErrors.add(1);
  }
}
