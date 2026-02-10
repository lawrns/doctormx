# K6 Load Testing - Quick Start Guide

## Installation

```bash
# Install K6 based on your OS

# macOS
brew install k6

# Linux (Ubuntu/Debian)
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6

# Windows (Chocolatey)
choco install k6

# Or download binary from https://k6.io/
```

## Verify Installation

```bash
k6 version
```

## Quick Test Run

### 1. Set Target Environment

```bash
# Development (default)
export BASE_URL="http://localhost:3000"

# Staging
export BASE_URL="https://staging.doctormx.com"

# Production
export BASE_URL="https://doctormx.com"
```

### 2. Run Individual Tests

```bash
# Test 1: Concurrent Users (1000 users)
k6 run tests/load/concurrent-users.js

# Test 2: API Load Test
k6 run tests/load/api-load.js

# Test 3: Booking Surge Test
k6 run tests/load/booking-surge.js

# Test 4: Video Consultation Test
k6 run tests/load/video-consultation.js
```

### 3. Run with NPM Scripts

```bash
# Install dependencies first
npm install

# Run all tests
npm run test:load:all

# Or run individually
npm run test:load:concurrent
npm run test:load:api
npm run test:load:booking
npm run test:load:video
```

## Understanding the Output

### Console Output

```
✓ status 200
✓ has token
✓ response time < 500ms

checks.........................: 98.5% ✓ 1970  ✗ 30
data_received..................: 15 MB 250 kB/s
data_sent......................: 2.0 MB 33 kB/s
http_req_blocked...............: avg=150ms min=10ms med=120ms max=500ms p(95)=200ms p(99)=250ms
http_req_connecting............: avg=100ms min=5ms med=80ms max=300ms p(95)=150ms p(99)=180ms
http_req_duration..............: avg=350ms min=50ms med=300ms max=800ms p(95)=450ms p(99)=550ms
```

### Key Metrics

| Metric | Description | Target |
|--------|-------------|--------|
| `http_req_duration` | Total request time | p95 < 500ms |
| `http_req_failed` | Failed request rate | < 1% |
| `checks` | Assertion pass rate | > 99% |
| `vus` | Active virtual users | - |
| `vus_max` | Max virtual users created | - |

## Export Results

### JSON Output

```bash
k6 run --out json=results.json tests/load/concurrent-users.js
```

### HTML Report (using k6-reporter)

```bash
# Install k6-reporter
go install github.com/grafana/k6-reporter@main

# Run with HTML report
k6 run --out json=results.json tests/load/concurrent-users.js
k6-reporter results.json --output report.html
```

### InfluxDB + Grafana

```bash
k6 run --out influxdb=http://localhost:8086/k6 tests/load/concurrent-users.js
```

## Common Issues

### Issue: Connection Refused

**Error**: `EREFUSED connection refused`

**Solution**:
- Ensure the application is running
- Check BASE_URL is correct
- Verify firewall settings

### Issue: High Error Rate

**Error**: `http_req_failed > 5%`

**Solution**:
- Check application logs
- Verify rate limiting configuration
- Check database connection pool size
- Review server resources (CPU, memory)

### Issue: Slow Response Times

**Error**: `http_req_duration p95 > 1000ms`

**Solution**:
- Check database query performance
- Review API endpoint optimization
- Check caching strategy
- Verify CDN/proxy configuration

## Performance Targets

All tests are configured with the following thresholds:

- **p95 Response Time**: < 500ms
- **p99 Response Time**: < 1000ms
- **Error Rate**: < 1%
- **Booking Success Rate**: > 95%
- **Video Latency (p95)**: < 200ms
- **Packet Loss**: < 1%

## CI/CD Integration

Tests run automatically:
- **Daily**: 2 AM UTC (8 PM Mexico time)
- **Manual**: Via GitHub Actions "Load Tests" workflow

## Next Steps

1. Review the full documentation: `tests/load/README.md`
2. Customize test data in `tests/load/data/`
3. Adjust thresholds in `tests/load/thresholds.js`
4. Configure CI/CD in `.github/workflows/load-tests.yml`

## Support

For issues or questions:
- Check the main README: `tests/load/README.md`
- Review K6 documentation: https://k6.io/docs/
- Contact the DevOps team
