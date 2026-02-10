# K6 Load Testing Suite - DoctorMX

Comprehensive load testing suite using K6 for performance testing of the DoctorMX telemedicine platform.

## Prerequisites

```bash
# Install K6
# macOS
brew install k6

# Linux
sudo apt-get install k6

# Windows
choco install k6

# Or download from: https://k6.io/
```

## Test Configuration

### Environment Variables

```bash
# Set the base URL for testing
export BASE_URL="http://localhost:3000"           # Development
export BASE_URL="https://staging.doctormx.com"    # Staging
export BASE_URL="https://doctormx.com"            # Production

# Optional: Video servers
export TURN_SERVER="turn:your-turn-server.com:3478"
export STUN_SERVER="stun:your-stun-server.com:3478"
```

## Test Scripts

### 1. Concurrent Users Test (`concurrent-users.js`)

**Purpose**: Simulate 1000 concurrent users with realistic behavior patterns.

**Features**:
- Ramping from 10 to 1000 users
- Multiple user behaviors: casual browser, active seeker, booker, returning patient
- Realistic think times between actions
- Comprehensive metrics collection

**Run**:
```bash
k6 run tests/load/concurrent-users.js

# With custom URL
BASE_URL=https://staging.doctormx.com k6 run tests/load/concurrent-users.js

# With output to file
k6 run --out json=results.json tests/load/concurrent-users.js
```

**Load Pattern**:
- 2min: 10 → 100 users
- 3min: 100 → 300 users
- 5min: 300 → 500 users
- 5min: 500 → 800 users
- 5min: 800 → 1000 users
- 10min: Sustain 1000 users
- Gradual ramp down

**Metrics**:
- Error rate (target: < 1.5%)
- Booking success rate (target: > 95%)
- Response times (p95 target: < 600ms)

---

### 2. API Load Test (`api-load.js`)

**Purpose**: Test all API endpoints under sustained load with traffic spikes.

**Features**:
- 100 requests/second baseline
- Spike to 300 requests/second
- Endpoint-specific metrics
- Authentication, bookings, video, medical records

**Run**:
```bash
k6 run tests/load/api-load.js

# With cloud execution
k6 cloud tests/load/api-load.js
```

**Load Pattern**:
- 10min: 100 RPS sustained
- 3min: Spike to 300 RPS
- Comprehensive endpoint coverage

**Metrics**:
- API error rate (target: < 1%)
- Response times by endpoint
- Throughput (requests/second)

---

### 3. Booking Surge Test (`booking-surge.js`)

**Purpose**: Simulate sudden surge in appointment bookings (peak hours, campaigns).

**Features**:
- Realistic booking pipeline
- Double booking prevention
- Availability locking mechanism
- Database transaction integrity

**Run**:
```bash
k6 run tests/load/booking-surge.js
```

**Load Pattern**:
- 2min: Baseline (50 bookings/min)
- 1min: Surge (200 bookings/min)
- 3min: Sustain surge
- 1min: Extreme surge (400 bookings/min)
- 2min: Sustain extreme
- Gradual recovery

**Metrics**:
- Booking success rate (target: > 90% during surge)
- Double booking errors
- Availability sync errors
- Database transaction errors

---

### 4. Video Consultation Test (`video-consultation.js`)

**Purpose**: Test video infrastructure quality under load.

**Features**:
- WebRTC connection testing
- STUN/TURN server testing
- Video quality metrics
- Audio latency measurement
- Packet loss tracking

**Run**:
```bash
k6 run tests/load/video-consultation.js
```

**Load Pattern**:
- 10min: 50 video sessions/second
- Spike: 150 sessions/second for 4 minutes

**Metrics**:
- Video latency (p95 target: < 200ms)
- Audio latency
- Packet loss rate (target: < 1%)
- Bitrate and frame rate
- Connection success rate

---

### 5. Thresholds Configuration (`thresholds.js`)

Centralized threshold definitions for all tests.

**Performance Targets**:
- p95 response time: < 500ms
- p99 response time: < 1000ms
- Error rate: < 1%
- Video latency: < 200ms

**Environment-Specific**:
- Development: p95 < 800ms
- Staging: p95 < 500ms
- Production: p95 < 300ms

---

## Test Data

Test data files are located in `tests/load/data/`:

- `users.json` - Test user credentials
- `doctors.json` - Doctor profiles and IDs
- `specialties.json` - Medical specialties list
- `time-slots.json` - Available appointment time slots
- `bookings.json` - Existing bookings for video tests
- `test-data.json` - General test configuration
- `sample-document.pdf` - Document upload test file

---

## Running All Tests

```bash
# Run all load tests sequentially
npm run test:load:all

# Or individually
npm run test:load:concurrent
npm run test:load:api
npm run test:load:booking
npm run test:load:video
```

---

## Output and Reporting

### HTML Report
```bash
k6 run --out json=results.json tests/load/concurrent-users.js
# Then use a tool like https://k6.io/blog/html-report-for-k6/
```

### Cloud Execution
```bash
k6 cloud tests/load/concurrent-users.js
```

### InfluxDB + Grafana
```bash
k6 run \
  --out influxdb=http://localhost:8086/k6 \
  tests/load/concurrent-users.js
```

---

## Performance Benchmarks

### Expected Performance Targets

| Metric | Target | Alert |
|--------|--------|-------|
| p95 Response Time | < 500ms | > 600ms |
| p99 Response Time | < 1000ms | > 1200ms |
| Error Rate | < 1% | > 2% |
| Booking Success Rate | > 95% | < 90% |
| Video Latency (p95) | < 200ms | > 300ms |
| Packet Loss | < 1% | > 2% |

### Capacity Planning

| Concurrent Users | Target RPS | Expected p95 |
|-----------------|------------|--------------|
| 100 | 20 | < 200ms |
| 500 | 100 | < 400ms |
| 1000 | 200 | < 600ms |
| 2000 | 400 | < 800ms |

---

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Load Tests

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM
  workflow_dispatch:

jobs:
  load-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install k6
        run: |
          sudo gpg -k
          sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
          echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
          sudo apt-get update
          sudo apt-get install k6
      - name: Run API Load Test
        run: k6 run tests/load/api-load.js
        env:
          BASE_URL: ${{ secrets.STAGING_URL }}
```

---

## Troubleshooting

### High Error Rates
1. Check server logs for errors
2. Verify database connection pool size
3. Check rate limiting configuration
4. Review CDN/proxy configuration

### Slow Response Times
1. Check database query performance
2. Review API endpoint optimization
3. Check caching strategy
4. Verify server resources (CPU, memory)

### Video Quality Issues
1. Test STUN/TURN server connectivity
2. Check bandwidth capacity
3. Review WebRTC configuration
4. Verify codec settings

---

## Best Practices

1. **Run tests during off-peak hours** for production
2. **Always test against staging** before production
3. **Monitor system resources** during tests
4. **Review database locks** and slow queries
5. **Test with realistic data volumes**
6. **Validate results** against business requirements
7. **Document findings** and track improvements

---

## License

Internal use for DoctorMX platform testing.
