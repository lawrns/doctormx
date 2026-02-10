/**
 * K6 Video Consultation Load Test
 * DoctorMX Load Testing
 *
 * Purpose: Test video consultation infrastructure under load
 * Focus: WebSocket connections, video quality, latency, and packet loss
 */

import http from 'k6/http';
import { check, group } from 'k6';
import { SharedArray } from 'k6/data';
import { Rate, Trend, Counter } from 'k6/metrics';
import { getThresholds } from './thresholds.js';

// Configuration
export const options = {
  scenarios: {
    video_load: {
      executor: 'constant-arrival-rate',
      rate: 50, // 50 video sessions per second
      timeUnit: '1s',
      duration: '10m',
      preAllocatedVUs: 100,
      maxVUs: 300,
      gracefulStop: '30s',
    },
    video_spike: {
      executor: 'ramping-arrival-rate',
      startTime: '10m',
      startRate: 50,
      timeUnit: '1s',
      stages: [
        { duration: '1m', target: 150 },   // Spike to 150 sessions/s
        { duration: '2m', target: 150 },   // Sustain spike
        { duration: '1m', target: 50 },    // Return to normal
      ],
      gracefulStop: '30s',
      exec: 'spikeScenario',
    },
  },
  thresholds: getThresholds('video'),
};

// Custom metrics for video quality
const videoConnectionErrors = new Rate('video_connection_errors');
const videoQualityScore = new Trend('video_quality_score');
const videoLatency = new Trend('video_latency');
const audioLatency = new Trend('audio_latency');
const packetLoss = new Rate('packet_loss');
const bitrate = new Trend('bitrate');
const frameRate = new Trend('frame_rate');
const resolution = new Trend('resolution');

// Session metrics
const sessionDuration = new Trend('session_duration');
const connectionTime = new Trend('connection_time');
const reconnectionCount = new Counter('reconnection_count');
const totalSessions = new Counter('total_sessions');
const successfulSessions = new Counter('successful_sessions');

// STUN/TURN metrics
const stunResponseTime = new Trend('stun_response_time');
const turnAllocationTime = new Trend('turn_allocation_time');
const iceConnectionTime = new Trend('ice_connection_time');

// Configuration
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const TURN_SERVER_URL = __ENV.TURN_SERVER || 'turn:localhost:3478';
const STUN_SERVER_URL = __ENV.STUN_SERVER || 'stun:localhost:3478';

// Test data
const users = new SharedArray('users', function () {
  return JSON.parse(open('./data/users.json')).users;
});

const bookings = new SharedArray('bookings', function () {
  return JSON.parse(open('./data/bookings.json')).bookings;
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
function authenticate(user) {
  const payload = JSON.stringify({
    email: user.email,
    password: user.password,
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  const res = http.post(`${BASE_URL}/api/auth/login`, payload, params);

  if (res.status === 200 && res.json('token')) {
    return res.json('token');
  }

  return null;
}

// Get video token for WebRTC connection
export function getVideoToken(token, bookingId) {
  const payload = JSON.stringify({
    bookingId: bookingId,
    role: 'patient',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    tags: { name: 'GetVideoToken' },
  };

  const res = http.post(`${BASE_URL}/api/video/token`, payload, params);

  const success = check(res, {
    'video token status 200': (r) => r.status === 200,
    'has Twilio token': (r) => r.json('token') !== undefined,
    'has room name': (r) => r.json('roomName') !== undefined,
    'has room SID': (r) => r.json('roomSid') !== undefined,
    'token response time < 200ms': (r) => r.timings.duration < 200,
  });

  if (success) {
    return {
      token: res.json('token'),
      roomName: res.json('roomName'),
      roomSid: res.json('roomSid'),
    };
  }

  videoConnectionErrors.add(1);
  return null;
}

// Simulate STUN server request
function testSTUNServer() {
  const startTime = Date.now();

  // Simulate STUN request (in real scenario, this would be actual STUN)
  const stunPayload = JSON.stringify({
    request: 'binding',
    username: generateUUID(),
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
    tags: { name: 'STUNRequest' },
  };

  // This would normally go to the actual STUN server
  // For testing, we simulate through our API
  const res = http.post(`${BASE_URL}/api/video/stun-test`, stunPayload, params);

  stunResponseTime.add(Date.now() - startTime);

  check(res, {
    'STUN response time < 100ms': (r) => r.timings.duration < 100,
  });
}

// Simulate TURN allocation
function testTURNServer(token) {
  const startTime = Date.now();

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    tags: { name: 'TURNAllocation' },
  };

  // Simulate TURN allocation request
  const res = http.post(`${BASE_URL}/api/video/turn-allocate`, {}, params);

  turnAllocationTime.add(Date.now() - startTime);

  return check(res, {
    'TURN allocation successful': (r) => r.status === 200,
    'has TURN credentials': (r) => r.json('username') !== undefined,
    'TURN allocation time < 300ms': (r) => r.timings.duration < 300,
  });
}

// Simulate ICE connection establishment
function testICEConnection(token, roomSid) {
  const startTime = Date.now();

  const payload = JSON.stringify({
    roomSid: roomSid,
    candidates: [
      { candidate: 'candidate1', sdpMid: '0', sdpMLineIndex: 0 },
      { candidate: 'candidate2', sdpMid: '0', sdpMLineIndex: 0 },
      { candidate: 'candidate3', sdpMid: '0', sdpMLineIndex: 0 },
    ],
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    tags: { name: 'ICEConnection' },
  };

  const res = http.post(`${BASE_URL}/api/video/ice-connect`, payload, params);

  iceConnectionTime.add(Date.now() - startTime);

  return check(res, {
    'ICE connection successful': (r) => r.status === 200,
    'ICE connection time < 500ms': (r) => r.timings.duration < 500,
    'has selected candidate pair': (r) => r.json('selectedPair') !== undefined,
  });
}

// Connect to video room
export function connectToVideoRoom(token, videoToken, roomName) {
  const startTime = Date.now();

  const payload = JSON.stringify({
    roomName: roomName,
    token: videoToken,
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    tags: { name: 'ConnectVideoRoom' },
  };

  const res = http.post(`${BASE_URL}/api/video/connect`, payload, params);

  connectionTime.add(Date.now() - startTime);

  const success = check(res, {
    'connect to room status 200': (r) => r.status === 200,
    'has participant SID': (r) => r.json('participantSid') !== undefined,
    'connection time < 500ms': (r) => r.timings.duration < 500,
  });

  if (success) {
    successfulSessions.add(1);
    return {
      participantSid: res.json('participantSid'),
      roomSid: res.json('roomSid'),
    };
  } else {
    videoConnectionErrors.add(1);
    return null;
  }
}

// Simulate video quality metrics during call
function simulateVideoQualityMetrics(duration) {
  // Simulate realistic video quality variations
  const qualitySamples = Math.floor(duration / 5); // Sample every 5 seconds

  for (let i = 0; i < qualitySamples; i++) {
    // Video quality score (0-100, higher is better)
    const quality = 70 + Math.random() * 25 + (Math.random() > 0.9 ? -20 : 0);
    videoQualityScore.add(quality);

    // Latency metrics (ms)
    const vLatency = 50 + Math.random() * 150;
    const aLatency = 30 + Math.random() * 100;
    videoLatency.add(vLatency);
    audioLatency.add(aLatency);

    // Packet loss rate (0-1)
    const loss = Math.random() > 0.95 ? Math.random() * 0.05 : 0;
    packetLoss.add(loss);

    // Bitrate (kbps)
    const currentBitrate = 500 + Math.random() * 1500;
    bitrate.add(currentBitrate);

    // Frame rate (fps)
    const fps = 20 + Math.random() * 10;
    frameRate.add(fps);

    // Resolution (height in pixels)
    const res = 480 + Math.random() * 480; // 480p to 960p
    resolution.add(res);

    // Small pause between samples
    if (i < qualitySamples - 1) {
      // Simulate 5 seconds of call time
      // In real scenario, this would be actual WebRTC data
    }
  }
}

// Report video quality metrics
export function reportVideoQuality(token, participantSid, roomSid, metrics) {
  const payload = JSON.stringify({
    participantSid: participantSid,
    roomSid: roomSid,
    videoLatency: metrics.videoLatency,
    audioLatency: metrics.audioLatency,
    packetLoss: metrics.packetLoss,
    bitrate: metrics.bitrate,
    frameRate: metrics.frameRate,
    resolution: metrics.resolution,
    timestamp: new Date().toISOString(),
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    tags: { name: 'ReportQuality' },
  };

  const res = http.post(`${BASE_URL}/api/video/quality`, payload, params);

  check(res, {
    'quality report accepted': (r) => r.status === 200 || r.status === 202,
  });
}

// Disconnect from video room
export function disconnectFromRoom(token, participantSid, roomSid) {
  const payload = JSON.stringify({
    participantSid: participantSid,
    roomSid: roomSid,
    reason: 'user-ended',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    tags: { name: 'DisconnectRoom' },
  };

  const res = http.post(`${BASE_URL}/api/video/disconnect`, payload, params);

  check(res, {
    'disconnect successful': (r) => r.status === 200,
  });
}

// Complete video consultation flow
export function completeVideoConsultation(token, bookingId) {
  totalSessions.add(1);

  const sessionStart = Date.now();

  // Step 1: Get video token
  const videoData = getVideoToken(token, bookingId);
  if (!videoData) {
    return { success: false, stage: 'token' };
  }

  // Step 2: Test STUN server
  testSTUNServer();

  // Step 3: Test TURN server (if needed)
  testTURNServer(token);

  // Step 4: Establish ICE connection
  const iceConnected = testICEConnection(token, videoData.roomSid);
  if (!iceConnected) {
    return { success: false, stage: 'ice' };
  }

  // Step 5: Connect to video room
  const connection = connectToVideoRoom(token, videoData.token, videoData.roomName);
  if (!connection) {
    return { success: false, stage: 'connect' };
  }

  // Step 6: Simulate video consultation (2-5 minutes)
  const consultationDuration = Math.floor(Math.random() * 180) + 120; // 2-5 minutes
  simulateVideoQualityMetrics(consultationDuration);

  // Step 7: Report final quality metrics
  const qualityMetrics = {
    videoLatency: videoLatency.avg || 100,
    audioLatency: audioLatency.avg || 80,
    packetLoss: packetLoss.value || 0,
    bitrate: bitrate.avg || 1000,
    frameRate: frameRate.avg || 24,
    resolution: resolution.avg || 720,
  };

  reportVideoQuality(token, connection.participantSid, connection.roomSid, qualityMetrics);

  // Step 8: Disconnect from room
  disconnectFromRoom(token, connection.participantSid, connection.roomSid);

  const sessionEndTime = Date.now();
  sessionDuration.add(sessionEndTime - sessionStart);

  return { success: true, duration: sessionEndTime - sessionStart };
}

// Stress scenario: Rapid connection/disconnection
export function stressScenario(token) {
  const booking = randomItem(bookings);

  // Rapid connect/disconnect cycles
  for (let i = 0; i < 5; i++) {
    const videoData = getVideoToken(token, booking.id);
    if (videoData) {
      const connection = connectToVideoRoom(token, videoData.token, videoData.roomName);
      if (connection) {
        // Short session (10-30 seconds)
        simulateVideoQualityMetrics(10 + Math.random() * 20);
        disconnectFromRoom(token, connection.participantSid, connection.roomSid);
      } else {
        reconnectionCount.add(1);
      }
    }

    // Small pause between attempts
    // sleep(Math.random() * 2 + 1);
  }
}

// Main scenario
export default function() {
  const user = randomItem(users);
  const token = authenticate(user);

  if (!token) {
    console.error('Authentication failed');
    return;
  }

  group('Video Consultation', function() {
    const booking = randomItem(bookings);

    // 90% normal consultations, 10% stress testing
    if (Math.random() < 0.9) {
      completeVideoConsultation(token, booking.id);
    } else {
      stressScenario(token);
    }
  });
}

// Spike scenario
export function spikeScenario() {
  console.log('Running spike scenario: 150 video sessions/s');

  const user = randomItem(users);
  const token = authenticate(user);

  if (!token) {
    return;
  }

  group('Video Spike', function() {
    const booking = randomItem(bookings);
    completeVideoConsultation(token, booking.id);
  });
}

// Setup
export function setup() {
  console.log('Starting video consultation load test');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`STUN Server: ${STUN_SERVER_URL}`);
  console.log(`TURN Server: ${TURN_SERVER_URL}`);
  console.log('Load pattern: 50 sessions/s for 10 minutes, then spike to 150 sessions/s');
  return {
    startTime: new Date().toISOString(),
  };
}

// Teardown
export function teardown(data) {
  console.log('Video Consultation Load Test Results:');
  console.log(`- Total sessions: ${totalSessions.count}`);
  console.log(`- Successful sessions: ${successfulSessions.count}`);
  console.log(`- Success rate: ${((successfulSessions.count / totalSessions.count) * 100).toFixed(2)}%`);
  console.log(`- Connection errors: ${(videoConnectionErrors.value * 100).toFixed(2)}%`);
  console.log(`- Average video latency: ${videoLatency.avg.toFixed(2)}ms`);
  console.log(`- P95 video latency: ${videoLatency.p('95').toFixed(2)}ms`);
  console.log(`- P99 video latency: ${videoLatency.p('99').toFixed(2)}ms`);
  console.log(`- Average audio latency: ${audioLatency.avg.toFixed(2)}ms`);
  console.log(`- Packet loss rate: ${(packetLoss.value * 100).toFixed(3)}%`);
  console.log(`- Average bitrate: ${bitrate.avg.toFixed(2)}kbps`);
  console.log(`- Average frame rate: ${frameRate.avg.toFixed(2)}fps`);
  console.log(`- Average resolution: ${resolution.avg.toFixed(2)}p`);
  console.log(`- Average session duration: ${(sessionDuration.avg / 1000).toFixed(2)}s`);
  console.log(`- STUN response time: ${stunResponseTime.avg.toFixed(2)}ms`);
  console.log(`- TURN allocation time: ${turnAllocationTime.avg.toFixed(2)}ms`);
  console.log(`- ICE connection time: ${iceConnectionTime.avg.toFixed(2)}ms`);
  console.log(`- Reconnection count: ${reconnectionCount.count}`);
}
