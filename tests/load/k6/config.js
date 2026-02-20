/**
 * K6 Configuration
 * Centralized configuration for all load tests
 */

// Base URL configuration
export const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Environment detection
export const ENVIRONMENT = __ENV.ENVIRONMENT || 'development';

// Test durations
export const DURATIONS = {
  smoke: __ENV.SMOKE_DURATION || '1m',
  load: __ENV.LOAD_DURATION || '5m',
  stress: __ENV.STRESS_DURATION || '10m',
  spike: __ENV.SPIKE_DURATION || '5m',
};

// User counts
export const USER_COUNTS = {
  smoke: parseInt(__ENV.SMOKE_USERS) || 1,
  load: parseInt(__ENV.LOAD_USERS) || 100,
  stress: parseInt(__ENV.STRESS_USERS) || 500,
  spike: parseInt(__ENV.SPIKE_USERS) || 1000,
};

// Request rates (requests per second)
export const REQUEST_RATES = {
  smoke: parseInt(__ENV.SMOKE_RPS) || 1,
  load: parseInt(__ENV.LOAD_RPS) || 50,
  stress: parseInt(__ENV.STRESS_RPS) || 200,
  spike: parseInt(__ENV.SPIKE_RPS) || 500,
};

// Thresholds configuration
export const THRESHOLDS = {
  smoke: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.01'],
    checks: ['rate>0.99'],
  },
  load: {
    http_req_duration: ['p(95)<600', 'p(99)<1200'],
    http_req_failed: ['rate<0.02'],
    http_reqs: ['rate>50'],
    checks: ['rate>0.95'],
  },
  stress: {
    http_req_duration: ['p(95)<1000', 'p(99)<2000'],
    http_req_failed: ['rate<0.05'],
    http_reqs: ['rate>100'],
    checks: ['rate>0.90'],
  },
  spike: {
    http_req_duration: ['p(95)<1500', 'p(99)<3000'],
    http_req_failed: ['rate<0.10'],
    checks: ['rate>0.85'],
  },
};

// Endpoint-specific thresholds
export const ENDPOINT_THRESHOLDS = {
  health: {
    http_req_duration: ['p(95)<200', 'p(99)<500'],
    http_req_failed: ['rate<0.001'],
  },
  doctors: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.01'],
  },
  appointments: {
    http_req_duration: ['p(95)<800', 'p(99)<1500'],
    http_req_failed: ['rate<0.02'],
  },
  auth: {
    http_req_duration: ['p(95)<400', 'p(99)<800'],
    http_req_failed: ['rate<0.01'],
  },
  chat: {
    http_req_duration: ['p(95)<300', 'p(99)<600'],
    http_req_failed: ['rate<0.01'],
  },
};

// Helper function to get threshold for test type
export function getThresholds(testType, endpoint = null) {
  if (endpoint && ENDPOINT_THRESHOLDS[endpoint]) {
    return {
      ...THRESHOLDS[testType],
      ...ENDPOINT_THRESHOLDS[endpoint],
    };
  }
  return THRESHOLDS[testType] || THRESHOLDS.load;
}

// Test data paths
export const TEST_DATA_PATHS = {
  users: './data/users.json',
  doctors: './data/doctors.json',
  specialties: './data/specialties.json',
  bookings: './data/bookings.json',
  testData: './data/test-data.json',
};

// Export configuration
export default {
  BASE_URL,
  ENVIRONMENT,
  DURATIONS,
  USER_COUNTS,
  REQUEST_RATES,
  THRESHOLDS,
  ENDPOINT_THRESHOLDS,
  getThresholds,
  TEST_DATA_PATHS,
};
