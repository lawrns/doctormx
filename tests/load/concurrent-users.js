/**
 * K6 Concurrent Users Test - 1000 Users
 * DoctorMX Load Testing
 *
 * Purpose: Simulate 1000 concurrent users accessing the platform
 * Scenario: Realistic user behavior mix (browsing, booking, consultations)
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';
import { Rate } from 'k6/metrics';
import { getThresholds } from './thresholds.js';

// Configuration
export const options = {
  scenarios: {
    concurrent_users: {
      executor: 'ramping-arrival-rate',
      startRate: 10,
      timeUnit: '1s',
      preAllocatedVUs: 100,
      maxVUs: 1200,
      stages: [
        { duration: '2m', target: 100 },   // Ramp up to 100 users
        { duration: '3m', target: 300 },   // Ramp up to 300 users
        { duration: '5m', target: 500 },   // Ramp up to 500 users
        { duration: '5m', target: 800 },   // Ramp up to 800 users
        { duration: '5m', target: 1000 },  // Ramp up to 1000 users
        { duration: '10m', target: 1000 }, // Sustain 1000 users
        { duration: '5m', target: 500 },   // Ramp down to 500 users
        { duration: '3m', target: 100 },   // Ramp down to 100 users
        { duration: '2m', target: 0 },     // Ramp down to 0
      ],
    },
  },
  thresholds: getThresholds('concurrent'),
};

// Custom metrics
const errorRate = new Rate('errors');
const bookingSuccessRate = new Rate('booking_success');
const authSuccessRate = new Rate('auth_success');

// Test data
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

const users = new SharedArray('users', function () {
  return JSON.parse(open('./data/users.json')).users;
});

const doctors = new SharedArray('doctors', function () {
  return JSON.parse(open('./data/doctors.json')).doctors;
});

const specialties = new SharedArray('specialties', function () {
  return JSON.parse(open('./data/specialties.json')).specialties;
});

// Helper functions
function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

 function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Authentication
function login(user) {
  const payload = JSON.stringify({
    email: user.email,
    password: user.password,
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post(`${BASE_URL}/api/auth/login`, payload, params);

  check(res, {
    'login successful': (r) => r.status === 200,
    'has token': (r) => r.json('token') !== undefined,
  }) || errorRate.add(1);

  if (res.status === 200 && res.json('token')) {
    authSuccessRate.add(1);
    return res.json('token');
  }

  authSuccessRate.add(0);
  return null;
}

// Browse doctors
function browseDoctors(token) {
  const specialty = randomItem(specialties);

  const params = {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    tags: { name: 'BrowseDoctors' },
  };

  const res = http.get(
    `${BASE_URL}/api/doctors?specialty=${encodeURIComponent(specialty)}`,
    params
  );

  check(res, {
    'browse doctors status 200': (r) => r.status === 200,
    'has doctors list': (r) => r.json('doctors') !== undefined,
  }) || errorRate.add(1);

  return res.json('doctors') || [];
}

// View doctor profile
function viewDoctorProfile(token, doctorId) {
  const params = {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    tags: { name: 'ViewDoctorProfile' },
  };

  const res = http.get(`${BASE_URL}/api/doctors/${doctorId}`, params);

  check(res, {
    'profile status 200': (r) => r.status === 200,
    'has profile data': (r) => r.json('id') === doctorId,
  }) || errorRate.add(1);

  return res.status === 200 ? res.json() : null;
}

// Check availability
function checkAvailability(token, doctorId) {
  const today = new Date();
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  const params = {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    tags: { name: 'CheckAvailability' },
  };

  const res = http.get(
    `${BASE_URL}/api/doctors/${doctorId}/availability?start=${today.toISOString()}&end=${nextWeek.toISOString()}`,
    params
  );

  check(res, {
    'availability status 200': (r) => r.status === 200,
    'has time slots': (r) => r.json('slots') !== undefined,
  }) || errorRate.add(1);

  return res.status === 200 ? res.json('slots') : [];
}

// Create booking
function createBooking(token, doctorId) {
  const slots = checkAvailability(token, doctorId);

  if (slots.length === 0) {
    return null;
  }

  const slot = randomItem(slots.filter(s => s.available));

  if (!slot) {
    return null;
  }

  const payload = JSON.stringify({
    doctorId: doctorId,
    patientId: generateUUID(),
    startTime: slot.start,
    endTime: slot.end,
    type: 'consultation',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    tags: { name: 'CreateBooking' },
  };

  const res = http.post(`${BASE_URL}/api/bookings`, payload, params);

  const success = check(res, {
    'booking status 201': (r) => r.status === 201,
    'has booking ID': (r) => r.json('id') !== undefined,
  });

  if (success) {
    bookingSuccessRate.add(1);
    return res.json('id');
  } else {
    bookingSuccessRate.add(0);
    errorRate.add(1);
    return null;
  }
}

// List my bookings
function listMyBookings(token) {
  const params = {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    tags: { name: 'ListBookings' },
  };

  const res = http.get(`${BASE_URL}/api/bookings/my`, params);

  check(res, {
    'bookings list status 200': (r) => r.status === 200,
    'has bookings array': (r) => Array.isArray(r.json('bookings')),
  }) || errorRate.add(1);

  return res.json('bookings') || [];
}

// Get medical records
function getMedicalRecords(token) {
  const params = {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    tags: { name: 'MedicalRecords' },
  };

  const res = http.get(`${BASE_URL}/api/medical-records`, params);

  check(res, {
    'medical records status 200': (r) => r.status === 200,
    'has records': (r) => Array.isArray(r.json('records')),
  }) || errorRate.add(1);
}

// Upload document (simulation)
function uploadDocument(token) {
  const params = {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    tags: { name: 'UploadDocument' },
  };

  const res = http.post(
    `${BASE_URL}/api/documents/upload`,
    {
      file: http.file('./data/sample-document.pdf'),
      type: 'lab-result',
    },
    params
  );

  check(res, {
    'upload status 200 or 201': (r) => r.status === 200 || r.status === 201,
  }) || errorRate.add(1);
}

// View notifications
function viewNotifications(token) {
  const params = {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    tags: { name: 'Notifications' },
  };

  const res = http.get(`${BASE_URL}/api/notifications`, params);

  check(res, {
    'notifications status 200': (r) => r.status === 200,
  }) || errorRate.add(1);
}

// User behavior scenarios
const USER_BEHAVIORS = {
  casual_browser: {
    weight: 40, // 40% of users
    actions: function(token) {
      browseDoctors(token);
      sleep(Math.random() * 3 + 2);
      viewDoctorProfile(token, randomItem(doctors).id);
      sleep(Math.random() * 3 + 2);
    },
  },
  active_seeker: {
    weight: 30, // 30% of users
    actions: function(token) {
      browseDoctors(token);
      sleep(Math.random() * 2 + 1);
      const doctor = randomItem(doctors);
      viewDoctorProfile(token, doctor.id);
      sleep(Math.random() * 2 + 1);
      checkAvailability(token, doctor.id);
      sleep(Math.random() * 2 + 1);
    },
  },
  booker: {
    weight: 20, // 20% of users
    actions: function(token) {
      browseDoctors(token);
      sleep(Math.random() * 2 + 1);
      const doctor = randomItem(doctors);
      viewDoctorProfile(token, doctor.id);
      sleep(Math.random() * 1 + 1);
      checkAvailability(token, doctor.id);
      sleep(Math.random() * 2 + 1);
      createBooking(token, doctor.id);
      sleep(Math.random() * 3 + 2);
      listMyBookings(token);
    },
  },
  returning_patient: {
    weight: 10, // 10% of users
    actions: function(token) {
      listMyBookings(token);
      sleep(Math.random() * 2 + 1);
      getMedicalRecords(token);
      sleep(Math.random() * 2 + 1);
      viewNotifications(token);
      sleep(Math.random() * 2 + 1);
      browseDoctors(token);
    },
  },
};

// Main scenario
export default function() {
  const user = randomItem(users);
  const token = login(user);

  if (!token) {
    sleep(5);
    return;
  }

  // Select user behavior based on weights
  const totalWeight = Object.values(USER_BEHAVIORS).reduce((sum, behavior) => sum + behavior.weight, 0);
  let randomWeight = Math.random() * totalWeight;

  for (const [name, behavior] of Object.entries(USER_BEHAVIORS)) {
    randomWeight -= behavior.weight;
    if (randomWeight <= 0) {
      behavior.actions(token);
      break;
    }
  }

  // Random pause between iterations (5-15 seconds)
  sleep(Math.random() * 10 + 5);
}

// Setup function
export function setup() {
  console.log(`Starting concurrent users test with 1000 users`);
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Total VUs: ${__ENV.VUS || 1200}`);
  return { timestamp: new Date().toISOString() };
}

// Teardown function
export function teardown(data) {
  console.log(`Test completed at ${new Date().toISOString()}`);
  console.log(`Error rate: ${errorRate.value * 100}%`);
  console.log(`Booking success rate: ${bookingSuccessRate.value * 100}%`);
  console.log(`Auth success rate: ${authSuccessRate.value * 100}%`);
}
