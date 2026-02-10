/**
 * K6 API Load Test
 * DoctorMX Load Testing
 *
 * Purpose: Test all API endpoints under sustained load
 * Focus: Response times, error rates, and throughput
 */

import http from 'k6/http';
import { check, group } from 'k6';
import { SharedArray } from 'k6/data';
import { Rate, Trend, Counter } from 'k6/metrics';
import { getThresholds } from './thresholds.js';

// Configuration
export const options = {
  scenarios: {
    api_load: {
      executor: 'constant-arrival-rate',
      rate: 100, // 100 requests per second
      timeUnit: '1s',
      duration: '10m',
      preAllocatedVUs: 50,
      maxVUs: 200,
    },
    spike_test: {
      executor: 'constant-arrival-rate',
      startTime: '10m',
      rate: 300, // Spike to 300 requests per second
      timeUnit: '1s',
      duration: '3m',
      preAllocatedVUs: 100,
      maxVUs: 400,
      exec: 'spikeScenario',
    },
  },
  thresholds: getThresholds('api_load'),
};

// Custom metrics
const apiErrors = new Rate('api_errors');
const responseTime = new Trend('api_response_time');
const requestCount = new Counter('api_requests');

// Endpoint-specific metrics
const authMetrics = {
  login: new Trend('auth_login_duration'),
  register: new Trend('auth_register_duration'),
  refresh: new Trend('auth_refresh_duration'),
};

const bookingMetrics = {
  create: new Trend('booking_create_duration'),
  list: new Trend('booking_list_duration'),
  cancel: new Trend('booking_cancel_duration'),
};

const doctorMetrics = {
  list: new Trend('doctor_list_duration'),
  profile: new Trend('doctor_profile_duration'),
  availability: new Trend('doctor_availability_duration'),
};

const videoMetrics = {
  token: new Trend('video_token_duration'),
  connect: new Trend('video_connect_duration'),
};

// Configuration
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Test data
const testData = new SharedArray('testData', function () {
  return JSON.parse(open('./data/test-data.json'));
});

// Helper functions
function makeRequest(method, endpoint, data = null, token = null, tags = {}) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const params = {
    headers,
    tags: { ...tags, name: tags.name || endpoint },
  };

  const url = `${BASE_URL}${endpoint}`;

  let res;
  const startTime = Date.now();

  switch (method.toUpperCase()) {
    case 'GET':
      res = http.get(url, params);
      break;
    case 'POST':
      res = http.post(url, JSON.stringify(data), params);
      break;
    case 'PUT':
      res = http.put(url, JSON.stringify(data), params);
      break;
    case 'PATCH':
      res = http.patch(url, JSON.stringify(data), params);
      break;
    case 'DELETE':
      res = http.del(url, null, params);
      break;
    default:
      throw new Error(`Unknown method: ${method}`);
  }

  const duration = Date.now() - startTime;
  responseTime.add(duration);
  requestCount.add(1);

  return res;
}

// Authentication endpoints
export function testAuthentication() {
  group('Authentication', function() {
    // Login
    group('POST /api/auth/login', function() {
      const res = makeRequest('POST', '/api/auth/login', {
        email: testData.user.email,
        password: testData.user.password,
      }, null, { name: 'AuthLogin' });

      authMetrics.login.add(res.timings.duration);

      check(res, {
        'POST /api/auth/login status 200': (r) => r.status === 200,
        'POST /api/auth/login has token': (r) => r.json('token') !== undefined,
        'POST /api/auth/login response time < 300ms': (r) => r.timings.duration < 300,
      }) || apiErrors.add(1);

      testData.token = res.json('token');
    });

    // Refresh token
    if (testData.token) {
      group('POST /api/auth/refresh', function() {
        const res = makeRequest('POST', '/api/auth/refresh', {
          refreshToken: testData.refreshToken,
        }, null, { name: 'AuthRefresh' });

        authMetrics.refresh.add(res.timings.duration);

        check(res, {
          'POST /api/auth/refresh status 200': (r) => r.status === 200,
          'POST /api/auth/refresh response time < 200ms': (r) => r.timings.duration < 200,
        }) || apiErrors.add(1);
      });
    }
  });
}

// Doctor endpoints
export function testDoctors() {
  group('Doctors', function() {
    // List doctors
    group('GET /api/doctors', function() {
      const res = makeRequest('GET', '/api/doctors', null, testData.token, {
        name: 'DoctorsList'
      });

      doctorMetrics.list.add(res.timings.duration);

      check(res, {
        'GET /api/doctors status 200': (r) => r.status === 200,
        'GET /api/doctors has doctors array': (r) => Array.isArray(r.json('doctors')),
        'GET /api/doctors response time < 400ms': (r) => r.timings.duration < 400,
      }) || apiErrors.add(1);
    });

    // Filter by specialty
    group('GET /api/doctors?specialty=cardiology', function() {
      const res = makeRequest('GET', '/api/doctors?specialty=cardiology', null, testData.token, {
        name: 'DoctorsFilter'
      });

      check(res, {
        'GET /api/doctors?specialty status 200': (r) => r.status === 200,
        'GET /api/doctors?specialty response time < 400ms': (r) => r.timings.duration < 400,
      }) || apiErrors.add(1);
    });

    // Get doctor profile
    if (testData.doctorId) {
      group('GET /api/doctors/:id', function() {
        const res = makeRequest('GET', `/api/doctors/${testData.doctorId}`, null, testData.token, {
          name: 'DoctorProfile'
        });

        doctorMetrics.profile.add(res.timings.duration);

        check(res, {
          'GET /api/doctors/:id status 200': (r) => r.status === 200,
          'GET /api/doctors/:id has profile': (r) => r.json('id') === testData.doctorId,
          'GET /api/doctors/:id response time < 300ms': (r) => r.timings.duration < 300,
        }) || apiErrors.add(1);
      });
    }

    // Check availability
    if (testData.doctorId) {
      group('GET /api/doctors/:id/availability', function() {
        const today = new Date();
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

        const res = makeRequest(
          'GET',
          `/api/doctors/${testData.doctorId}/availability?start=${today.toISOString()}&end=${nextWeek.toISOString()}`,
          null,
          testData.token,
          { name: 'DoctorAvailability' }
        );

        doctorMetrics.availability.add(res.timings.duration);

        check(res, {
          'GET /api/doctors/:id/availability status 200': (r) => r.status === 200,
          'GET /api/doctors/:id/availability has slots': (r) => r.json('slots') !== undefined,
          'GET /api/doctors/:id/availability response time < 500ms': (r) => r.timings.duration < 500,
        }) || apiErrors.add(1);
      });
    }
  });
}

// Booking endpoints
export function testBookings() {
  group('Bookings', function() {
    // Create booking
    group('POST /api/bookings', function() {
      const bookingData = {
        doctorId: testData.doctorId,
        patientId: testData.patientId,
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
        type: 'consultation',
      };

      const res = makeRequest('POST', '/api/bookings', bookingData, testData.token, {
        name: 'BookingCreate'
      });

      bookingMetrics.create.add(res.timings.duration);

      const success = check(res, {
        'POST /api/bookings status 201': (r) => r.status === 201,
        'POST /api/bookings has booking ID': (r) => r.json('id') !== undefined,
        'POST /api/bookings response time < 600ms': (r) => r.timings.duration < 600,
      });

      if (success) {
        testData.bookingId = res.json('id');
      } else {
        apiErrors.add(1);
      }
    });

    // List bookings
    group('GET /api/bookings/my', function() {
      const res = makeRequest('GET', '/api/bookings/my', null, testData.token, {
        name: 'BookingList'
      });

      bookingMetrics.list.add(res.timings.duration);

      check(res, {
        'GET /api/bookings/my status 200': (r) => r.status === 200,
        'GET /api/bookings/my has bookings': (r) => Array.isArray(r.json('bookings')),
        'GET /api/bookings/my response time < 400ms': (r) => r.timings.duration < 400,
      }) || apiErrors.add(1);
    });

    // Cancel booking (if we have one)
    if (testData.bookingId && Math.random() > 0.7) {
      group('DELETE /api/bookings/:id', function() {
        const res = makeRequest('DELETE', `/api/bookings/${testData.bookingId}`, null, testData.token, {
          name: 'BookingCancel'
        });

        bookingMetrics.cancel.add(res.timings.duration);

        check(res, {
          'DELETE /api/bookings/:id status 200 or 204': (r) => r.status === 200 || r.status === 204,
          'DELETE /api/bookings/:id response time < 500ms': (r) => r.timings.duration < 500,
        }) || apiErrors.add(1);
      });
    }
  });
}

// Video consultation endpoints
export function testVideoConsultation() {
  group('Video Consultation', function() {
    // Get video token
    group('POST /api/video/token', function() {
      const res = makeRequest('POST', '/api/video/token', {
        bookingId: testData.bookingId,
      }, testData.token, { name: 'VideoToken' });

      videoMetrics.token.add(res.timings.duration);

      check(res, {
        'POST /api/video/token status 200': (r) => r.status === 200,
        'POST /api/video/token has token': (r) => r.json('token') !== undefined,
        'POST /api/video/token response time < 200ms': (r) => r.timings.duration < 200,
      }) || apiErrors.add(1);
    });

    // Connect to video room
    if (testData.bookingId) {
      group('POST /api/video/connect', function() {
        const res = makeRequest('POST', '/api/video/connect', {
          bookingId: testData.bookingId,
        }, testData.token, { name: 'VideoConnect' });

        videoMetrics.connect.add(res.timings.duration);

        check(res, {
          'POST /api/video/connect status 200': (r) => r.status === 200,
          'POST /api/video/connect has room info': (r) => r.json('roomId') !== undefined,
          'POST /api/video/connect response time < 300ms': (r) => r.timings.duration < 300,
        }) || apiErrors.add(1);
      });
    }
  });
}

// Medical records endpoints
export function testMedicalRecords() {
  group('Medical Records', function() {
    const res = makeRequest('GET', '/api/medical-records', null, testData.token, {
      name: 'MedicalRecords'
    });

    check(res, {
      'GET /api/medical-records status 200': (r) => r.status === 200,
      'GET /api/medical-records has records': (r) => Array.isArray(r.json('records')),
      'GET /api/medical-records response time < 400ms': (r) => r.timings.duration < 400,
    }) || apiErrors.add(1);
  });
}

// Notifications endpoint
export function testNotifications() {
  group('Notifications', function() {
    const res = makeRequest('GET', '/api/notifications', null, testData.token, {
      name: 'Notifications'
    });

    check(res, {
      'GET /api/notifications status 200': (r) => r.status === 200,
      'GET /api/notifications has notifications': (r) => Array.isArray(r.json('notifications')),
      'GET /api/notifications response time < 300ms': (r) => r.timings.duration < 300,
    }) || apiErrors.add(1);
  });
}

// Main scenario
export default function() {
  testAuthentication();
  testDoctors();
  testBookings();
  testVideoConsultation();
  testMedicalRecords();
  testNotifications();
}

// Spike scenario
export function spikeScenario() {
  console.log('Running spike scenario with 300 RPS');
  group('Spike Test', function() {
    testAuthentication();
    testDoctors();
    testBookings();
  });
}

// Setup
export function setup() {
  console.log('Starting API load test');
  console.log(`Base URL: ${BASE_URL}`);
  console.log('Target rate: 100 RPS (10 minutes) + 300 RPS spike (3 minutes)');
  return {
    startTime: new Date().toISOString(),
  };
}

// Teardown
export function teardown(data) {
  console.log(`Test completed at ${new Date().toISOString()}`);
  console.log(`Total requests: ${requestCount.count}`);
  console.log(`API error rate: ${(apiErrors.value * 100).toFixed(2)}%`);
  console.log(`Average response time: ${responseTime.avg.toFixed(2)}ms`);
  console.log(`P95 response time: ${responseTime.p('95').toFixed(2)}ms`);
  console.log(`P99 response time: ${responseTime.p('99').toFixed(2)}ms`);
}
