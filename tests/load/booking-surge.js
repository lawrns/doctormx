/**
 * k6 Load Test: Booking Surge Simulation
 *
 * Simulates a sudden surge of appointment bookings during peak hours
 * (e.g., Monday morning rush, promotional campaign launch)
 *
 * Scenarios:
 * - 500 users attempting to book appointments within 2 minutes
 * - Realistic booking flow: search doctors -> check availability -> book -> payment
 *
 * Performance Requirements:
 * - p95 response time < 500ms
 * - p99 response time < 1000ms
 * - Error rate < 1%
 * - Max concurrent bookings handled: 500
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const bookingErrors = new Rate('booking_errors');

// Test configuration
export const options = {
  scenarios: {
    booking_surge: {
      executor: 'ramping-arrival-rate',
      startRate: 10,
      timeUnit: '1s',
      preAllocatedVUs: 100,
      maxVUs: 500,
      stages: [
        { duration: '30s', target: 50 },   // Warm-up: 10 to 50 users/sec
        { duration: '1m', target: 200 },    // Surge: 200 users/sec
        { duration: '30s', target: 500 },   // Peak: 500 users/sec
        { duration: '1m', target: 200 },    // Stabilize: 200 users/sec
        { duration: '30s', target: 10 },    // Cool-down: 10 users/sec
      ],
    },
  },
  thresholds: {
    'http_req_duration': [
      { threshold: 'p(95)<500', abortOnFail: false },  // p95 < 500ms
      { threshold: 'p(99)<1000', abortOnFail: false }, // p99 < 1s
    ],
    'http_req_failed': [
      { threshold: 'rate<0.01', abortOnFail: true },   // < 1% errors
    ],
    'booking_errors': [
      { threshold: 'rate<0.02', abortOnFail: false },  // < 2% booking failures
    ],
    'http_reqs': [
      { threshold: 'rate>100', abortOnFail: false },   // Minimum 100 req/s
    ],
  },
};

// Configuration
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const API_BASE = `${BASE_URL}/api`;

// Test data
const DOCTOR_IDS = [
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440002',
  '550e8400-e29b-41d4-a716-446655440003',
  '550e8400-e29b-41d4-a716-446655440004',
  '550e8400-e29b-41d4-a716-446655440005',
];

const APPOINTMENT_TYPES = ['video', 'in-person'];
const SPECIALTIES = ['general', 'cardiology', 'pediatrics', 'dermatology'];

// Helper: Generate random date within next 30 days
function getRandomDate() {
  const date = new Date();
  date.setDate(date.getDate() + Math.floor(Math.random() * 30) + 1);
  return date.toISOString().split('T')[0];
}

// Helper: Generate random time slot
function getRandomTime() {
  const hours = Math.floor(Math.random() * 10) + 8; // 8-17
  const minutes = Math.random() > 0.5 ? '00' : '30';
  return `${hours.toString().padStart(2, '0')}:${minutes}`;
}

// Helper: Generate user session token
function generateAuthToken(userId) {
  // In real testing, use actual JWT tokens
  // For load testing, we simulate authentication
  return `Bearer test-token-${userId}`;
}

// Step 1: Search available doctors
function searchDoctors() {
  const specialty = SPECIALTIES[Math.floor(Math.random() * SPECIALTIES.length)];
  const params = new URLSearchParams({
    specialty,
    date: getRandomDate(),
  });

  const response = http.get(`${API_BASE}/doctors?${params}`, {
    tags: { name: 'SearchDoctors' },
  });

  check(response, {
    'search_doctors_status_200': (r) => r.status === 200,
    'search_doctors_has_data': (r) => {
      try {
        const body = JSON.parse(r.body);
        return Array.isArray(body.doctors) || Array.isArray(body);
      } catch {
        return false;
      }
    },
  });

  return response;
}

// Step 2: Check doctor availability
function checkAvailability(doctorId) {
  const date = getRandomDate();
  const response = http.get(
    `${API_BASE}/doctors/${doctorId}/slots?date=${date}`,
    { tags: { name: 'CheckAvailability' } }
  );

  check(response, {
    'availability_status_200': (r) => r.status === 200,
    'availability_has_slots': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.slots && body.slots.length > 0;
      } catch {
        return false;
      }
    },
  });

  return response;
}

// Step 3: Create appointment booking
function bookAppointment(doctorId, userId) {
  const date = getRandomDate();
  const time = getRandomTime();

  const payload = {
    doctorId,
    date,
    time,
    appointmentType: APPOINTMENT_TYPES[Math.floor(Math.random() * APPOINTMENT_TYPES.length)],
  };

  const response = http.post(
    `${API_BASE}/appointments`,
    JSON.stringify(payload),
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': generateAuthToken(userId),
      },
      tags: { name: 'BookAppointment' },
    }
  );

  const success = check(response, {
    'booking_status_200': (r) => r.status === 200 || r.status === 201,
    'booking_has_appointment_id': (r) => {
      if (r.status !== 200 && r.status !== 201) return false;
      try {
        const body = JSON.parse(r.body);
        return body.appointmentId || body.id;
      } catch {
        return false;
      }
    },
  });

  bookingErrors.add(!success);

  return response;
}

// Step 4: Initialize payment
function initializePayment(appointmentId, userId) {
  const payload = { appointmentId };

  const response = http.post(
    `${API_BASE}/create-payment-intent`,
    JSON.stringify(payload),
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': generateAuthToken(userId),
      },
      tags: { name: 'InitializePayment' },
    }
  );

  check(response, {
    'payment_status_200': (r) => r.status === 200,
    'payment_has_client_secret': (r) => {
      if (r.status !== 200) return false;
      try {
        const body = JSON.parse(r.body);
        return body.clientSecret || body.paymentIntentId;
      } catch {
        return false;
      }
    },
  });

  return response;
}

// Main test flow
export default function () {
  const userId = `user-${__VU}-${__ITER}`;
  const doctorId = DOCTOR_IDS[Math.floor(Math.random() * DOCTOR_IDS.length)];

  // Complete booking flow
  searchDoctors();
  sleep(Math.random() * 2 + 1); // 1-3s thinking time

  checkAvailability(doctorId);
  sleep(Math.random() + 0.5); // 0.5-1.5s thinking time

  const bookingResponse = bookAppointment(doctorId, userId);
  sleep(Math.random() * 3 + 2); // 2-5s thinking time

  // Only initialize payment if booking succeeded
  if (bookingResponse.status === 200 || bookingResponse.status === 201) {
    try {
      const bookingBody = JSON.parse(bookingResponse.body);
      const appointmentId = bookingBody.appointmentId || bookingBody.id;
      if (appointmentId) {
        initializePayment(appointmentId, userId);
      }
    } catch (e) {
      console.error('Failed to parse booking response:', e);
    }
  }

  // Random rest between iterations
  sleep(Math.random() * 5 + 5); // 5-10s rest
}

// Setup function to initialize test data
export function setup() {
  console.log(`Starting Booking Surge Test against ${BASE_URL}`);
  console.log('Peak load: 500 users/sec');
  console.log('Duration: 3.5 minutes');

  return {
    startTime: new Date().toISOString(),
  };
}

// Teardown function
export function teardown(data) {
  console.log('Booking Surge Test completed');
  console.log(`Test started at: ${data.startTime}`);
  console.log(`Test ended at: ${new Date().toISOString()}`);
}
