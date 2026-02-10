/**
 * K6 Thresholds Configuration
 * DoctorMX Load Testing Thresholds
 *
 * Performance targets:
 * - p95 < 500ms for API responses
 * - p99 < 1000ms for critical endpoints
 * - Error rate < 1%
 * - Video latency < 200ms
 */

export const THRESHOLDS = {
  // HTTP request thresholds
  http_req_duration: ['p(95)<500', 'p(99)<1000', 'avg<300'],
  http_req_failed: ['rate<0.01'], // Less than 1% failure rate

  // Requesting thresholds
  http_reqs: ['rate>10'], // At least 10 requests per second

  // Response thresholds
  http_req_waiting: ['p(95)<400'],
  http_req_connecting: ['p(95)<100'],

  // Video consultation specific thresholds
  video_latency: ['p(95)<200', 'p(99)<400'],
  video_packet_loss: ['rate<0.01'],

  // Booking system thresholds
  booking_success_rate: ['rate>0.95'],
  booking_response_time: ['p(95)<600'],

  // WebSocket/Real-time thresholds
  ws_connecting: ['p(95)<300'],
  ws_messages: ['rate>5'],
};

/**
 * Environment-specific thresholds
 */
export const ENVIRONMENT_THRESHOLDS = {
  development: {
    http_req_duration: ['p(95)<800', 'p(99)<1500'],
    http_req_failed: ['rate<0.05'],
  },
  staging: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.01'],
  },
  production: {
    http_req_duration: ['p(95)<300', 'p(99)<600'],
    http_req_failed: ['rate<0.005'],
  },
};

/**
 * Custom threshold groups for different test types
 */
export const THRESHOLD_GROUPS = {
  surge: {
    http_req_duration: ['p(95)<700', 'p(99)<1200'],
    http_req_failed: ['rate<0.02'],
    booking_success_rate: ['rate>0.90'],
  },
  api_load: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.01'],
  },
  video: {
    video_latency: ['p(95)<200', 'p(99)<400'],
    video_packet_loss: ['rate<0.01'],
    http_req_duration: ['p(95)<300'],
  },
  concurrent: {
    http_req_duration: ['p(95)<600', 'p(99)<1200'],
    http_req_failed: ['rate<0.015'],
    http_reqs: ['rate>100'],
  },
};

/**
 * Get thresholds based on test type
 */
export function getThresholds(testType = 'api_load') {
  return THRESHOLD_GROUPS[testType] || THRESHOLD_GROUPS.api_load;
}

/**
 * Custom metrics for monitoring
 */
export const CUSTOM_METRICS = {
  // Response time by endpoint
  bookingResponseTime: new Map([
    ['/api/bookings', 'p(95)<600'],
    ['/api/appointments', 'p(95)<500'],
    ['/api/availability', 'p(95)<400'],
  ]),

  // Authentication metrics
  authResponseTime: new Map([
    ['/api/auth/login', 'p(95)<300'],
    ['/api/auth/register', 'p(95)<400'],
    ['/api/auth/refresh', 'p(95)<200'],
  ]),

  // Video consultation metrics
  videoMetrics: new Map([
    ['/api/video/token', 'p(95)<200'],
    ['/api/video/connect', 'p(95)<300'],
    ['/api/video/quality', 'p(95)<500'],
  ]),
};

export default THRESHOLDS;
