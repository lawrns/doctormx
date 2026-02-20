/**
 * K6 Booking Flow Load Test
 * 
 * Simulates complete booking flow under load
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';
import { config } from '../config.js';
import { auth, data, assertions } from '../utils/helpers.js';

// Custom metrics
const bookingSuccess = new Rate('booking_success');
const bookingDuration = new Trend('booking_duration');
const stepErrors = new Counter('step_errors');

export const options = {
  scenarios: {
    booking_flow: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 10 },
        { duration: '5m', target: 20 },
        { duration: '5m', target: 20 },
        { duration: '2m', target: 0 },
      ],
      gracefulRampDown: '30s',
    },
  },
  thresholds: {
    booking_success: ['rate>0.95'],
    booking_duration: ['p(95)<10000'],
    http_req_duration: ['p(95)<1000'],
  },
};

export function setup() {
  const authToken = auth.getAuthToken();
  return { authToken };
}

export default function (data) {
  const baseUrl = config.baseUrl;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${data.authToken}`,
  };
  
  const bookingStart = Date.now();
  let success = true;
  
  group('Booking Flow', () => {
    // Step 1: Search doctors
    const doctorId = searchDoctors(baseUrl, headers);
    if (!doctorId) {
      stepErrors.add(1);
      success = false;
      return;
    }
    sleep(2);
    
    // Step 2: Get available slots
    const slot = getAvailableSlots(baseUrl, headers, doctorId);
    if (!slot) {
      stepErrors.add(1);
      success = false;
      return;
    }
    sleep(1);
    
    // Step 3: Create booking
    const booking = createBooking(baseUrl, headers, doctorId, slot);
    if (!booking) {
      stepErrors.add(1);
      success = false;
      return;
    }
    sleep(2);
    
    // Step 4: Confirm payment
    const confirmed = confirmPayment(baseUrl, headers, booking.id);
    if (!confirmed) {
      stepErrors.add(1);
      success = false;
      return;
    }
  });
  
  const bookingEnd = Date.now();
  bookingDuration.add(bookingEnd - bookingStart);
  bookingSuccess.add(success);
}

function searchDoctors(baseUrl, headers) {
  const response = http.get(`${baseUrl}/api/doctores?specialty=cardiologia`, { headers });
  
  const success = check(response, {
    'search doctors success': (r) => r.status === 200,
    'search returns doctors': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.data && body.data.length > 0;
      } catch {
        return false;
      }
    },
  });
  
  if (!success) return null;
  
  const body = JSON.parse(response.body);
  return body.data[0].id;
}

function getAvailableSlots(baseUrl, headers, doctorId) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = tomorrow.toISOString().split('T')[0];
  
  const response = http.get(
    `${baseUrl}/api/doctores/${doctorId}/slots?date=${dateStr}`,
    { headers }
  );
  
  const success = check(response, {
    'get slots success': (r) => r.status === 200,
    'slots returned': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.slots && body.slots.length > 0;
      } catch {
        return false;
      }
    },
  });
  
  if (!success) return null;
  
  const body = JSON.parse(response.body);
  return body.slots[0];
}

function createBooking(baseUrl, headers, doctorId, slot) {
  const payload = JSON.stringify({
    doctorId,
    slotId: slot.id,
    patientName: 'Test Patient',
    patientEmail: `test_${Date.now()}@example.com`,
    reason: 'Consulta general',
  });
  
  const response = http.post(`${baseUrl}/api/appointments`, payload, { headers });
  
  const success = check(response, {
    'create booking success': (r) => r.status === 201 || r.status === 200,
  });
  
  if (!success) return null;
  
  return JSON.parse(response.body);
}

function confirmPayment(baseUrl, headers, appointmentId) {
  const payload = JSON.stringify({
    appointmentId,
    paymentMethod: 'card',
  });
  
  const response = http.post(`${baseUrl}/api/payments/confirm`, payload, { headers });
  
  return check(response, {
    'confirm payment success': (r) => r.status === 200,
  });
}
