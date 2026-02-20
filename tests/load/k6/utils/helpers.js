/**
 * K6 Helper Functions
 * Common utilities for load testing scripts
 */

import { check, sleep } from 'k6';
import http from 'k6/http';
import { SharedArray } from 'k6/data';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
export const errorRate = new Rate('errors');
export const successRate = new Rate('success');
export const responseTime = new Trend('response_time');
export const requestCount = new Counter('requests');

/**
 * Make an HTTP request with error handling and metrics
 */
export function makeRequest(method, url, data = null, headers = {}, tags = {}) {
  const startTime = Date.now();
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...headers,
  };

  const params = {
    headers: defaultHeaders,
    tags: { ...tags, name: tags.name || url },
  };

  let res;
  
  try {
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
        throw new Error(`Unknown HTTP method: ${method}`);
    }

    const duration = Date.now() - startTime;
    responseTime.add(duration);
    requestCount.add(1);

    return res;
  } catch (error) {
    errorRate.add(1);
    console.error(`Request failed: ${method} ${url} - ${error.message}`);
    throw error;
  }
}

/**
 * Check response and record metrics
 */
export function checkResponse(res, checks, tags = {}) {
  const passed = check(res, checks);
  
  if (passed) {
    successRate.add(1);
  } else {
    errorRate.add(1);
  }
  
  return passed;
}

/**
 * Generate random integer between min and max
 */
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Get random item from array
 */
export function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Generate UUID v4
 */
export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Random sleep between min and max seconds
 */
export function randomSleep(min, max) {
  sleep(Math.random() * (max - min) + min);
}

/**
 * Load test data from JSON file
 */
export function loadTestData(path) {
  try {
    return new SharedArray('testData', function() {
      return JSON.parse(open(path));
    });
  } catch (error) {
    console.error(`Failed to load test data from ${path}: ${error.message}`);
    return [];
  }
}

/**
 * Create authentication headers
 */
export function authHeaders(token) {
  return {
    'Authorization': `Bearer ${token}`,
  };
}

/**
 * Parse JSON response safely
 */
export function safeJsonParse(res, defaultValue = null) {
  try {
    return res.json();
  } catch (error) {
    console.error(`Failed to parse JSON response: ${error.message}`);
    return defaultValue;
  }
}

/**
 * Log test progress
 */
export function logProgress(message, data = {}) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    message,
    ...data,
  }));
}

/**
 * Calculate percentile from array of numbers
 */
export function calculatePercentile(arr, percentile) {
  const sorted = arr.slice().sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[index];
}

/**
 * Format duration in milliseconds to human readable string
 */
export function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
  return `${(ms / 60000).toFixed(2)}m`;
}

/**
 * Retry a request with exponential backoff
 */
export function retryRequest(fn, maxRetries = 3, baseDelay = 1) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      sleep(baseDelay * Math.pow(2, i));
    }
  }
}

/**
 * Validate response structure
 */
export function validateResponseStructure(res, requiredFields) {
  const body = safeJsonParse(res, {});
  const missing = requiredFields.filter(field => !(field in body));
  
  if (missing.length > 0) {
    console.error(`Missing required fields: ${missing.join(', ')}`);
    return false;
  }
  
  return true;
}

/**
 * Generate test user credentials
 */
export function generateTestUser(index) {
  return {
    email: `loadtest${index}@doctormx.com`,
    password: `TestPass${index}!@#`,
    firstName: `Test${index}`,
    lastName: 'User',
  };
}

/**
 * Generate random date within range
 */
export function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

/**
 * Generate future date for appointments
 */
export function generateFutureDate(daysFromNow = 7) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(randomInt(9, 17), [0, 30][randomInt(0, 1)], 0, 0);
  return date.toISOString();
}

export default {
  makeRequest,
  checkResponse,
  randomInt,
  randomItem,
  generateUUID,
  randomSleep,
  loadTestData,
  authHeaders,
  safeJsonParse,
  logProgress,
  calculatePercentile,
  formatDuration,
  retryRequest,
  validateResponseStructure,
  generateTestUser,
  randomDate,
  generateFutureDate,
  errorRate,
  successRate,
  responseTime,
  requestCount,
};
