# Uptime Monitoring Setup Guide

> **Project:** Doctor.mx  
> **Document Type:** DevOps Configuration Guide  
> **Last Updated:** 2026-02-16

---

## Table of Contents

1. [Overview](#overview)
2. [Endpoints to Monitor](#endpoints-to-monitor)
3. [Recommended Monitoring Services](#recommended-monitoring-services)
4. [Alert Configuration](#alert-configuration)
5. [Implementation Checklist](#implementation-checklist)
6. [Runbook: Responding to Alerts](#runbook-responding-to-alerts)
7. [Escalation Procedures](#escalation-procedures)

---

## Overview

This document provides configuration guidelines for setting up uptime monitoring for the Doctor.mx platform. The monitoring setup ensures high availability and rapid incident response for critical healthcare services.

### Monitoring Goals

| Goal | Target |
|------|--------|
| **Availability** | 99.9% uptime (maximum 43.8 minutes downtime/month) |
| **Response Time** | < 200ms for health checks |
| **Alert Latency** | < 2 minutes from incident to notification |
| **Recovery Time** | < 15 minutes for critical services |

### Health Check Architecture

The application exposes health check endpoints at `/api/health` that verify:

- **Database** (Supabase) - Core data storage
- **Cache** (Redis/Upstash) - Session and performance caching
- **Payment** (Stripe) - Payment processing
- **AI Services** (GLM/OpenAI) - Clinical AI features

---

## Endpoints to Monitor

### Primary Endpoints

| Endpoint | Method | Purpose | Expected Response | Priority |
|----------|--------|---------|-------------------|----------|
| `/api/health` | GET | Full system health check | HTTP 200 + JSON | **Critical** |
| `/` | GET | Homepage availability | HTTP 200 | **Critical** |
| `/api/health?check=db` | GET | Database-only check | HTTP 200 + JSON | **High** |

### Endpoint Details

#### 1. Full Health Check: `GET /api/health`

**Use Case:** Comprehensive system status monitoring

**Expected Response (Healthy):**
```json
{
  "status": "healthy",
  "timestamp": "2026-02-16T15:30:00.000Z",
  "version": "1.0.0",
  "uptime": 86400,
  "environment": "production",
  "checks": {
    "database": { "status": "ok", "latency": 45 },
    "cache": { "status": "ok", "latency": 12 },
    "stripe": { "status": "ok", "latency": 234 },
    "ai": { "status": "ok", "latency": 5 }
  }
}
```

**HTTP Status Codes:**
- `200 OK` - All systems operational or degraded
- `503 Service Unavailable` - One or more critical services failing

**Configuration:**
```yaml
# Monitoring service configuration
name: "Doctor.mx - Full Health Check"
url: "https://doctormx.com/api/health"
method: GET
expected_status: 200
response_time_threshold: 200ms
content_match: '"status":"healthy"'
```

#### 2. Homepage Check: `GET /`

**Use Case:** Verify frontend availability and CDN health

**Expected Response:**
- HTTP 200 OK
- Response time < 500ms
- Content contains key page elements

**Configuration:**
```yaml
name: "Doctor.mx - Homepage"
url: "https://doctormx.com/"
method: GET
expected_status: 200
response_time_threshold: 500ms
content_match: "Doctor.mx"
```

#### 3. Database Health Check: `GET /api/health?check=db`

**Use Case:** Isolate database connectivity issues

**Note:** This endpoint filters health checks to database only, useful for diagnosing specific infrastructure issues.

**Configuration:**
```yaml
name: "Doctor.mx - Database Check"
url: "https://doctormx.com/api/health?check=db"
method: GET
expected_status: 200
response_time_threshold: 200ms
```

---

## Recommended Monitoring Services

### 1. Pingdom (Recommended for Enterprise)

**Best For:** Organizations requiring detailed reporting and SLA management

**Features:**
- Synthetic monitoring from 100+ global locations
- Real user monitoring (RUM)
- Transaction monitoring
- Public status pages
- Root cause analysis

**Pricing:** Starting at ~$15/month for 10 checks

**Configuration Example:**
```
Check Type: HTTP(S)
URL: https://doctormx.com/api/health
Check Interval: 1 minute
Test From: North America, Europe, Latin America
Alert When: Down for 2 consecutive checks
Response Time Threshold: 200ms
```

**Pros:**
- Industry standard, trusted by enterprises
- Excellent reporting and analytics
- Transaction monitoring for user flows

**Cons:**
- Higher cost
- Can be complex for simple setups

---

### 2. UptimeRobot (Recommended for Cost-Effective)

**Best For:** Small to medium teams needing reliable monitoring at low cost

**Features:**
- 50 monitors on free plan (5-minute intervals)
- Pro plan: 1-minute intervals, unlimited SMS
- SSL certificate monitoring
- Port monitoring
- Keyword monitoring

**Pricing:** Free tier available; Pro at $8/month

**Configuration Example:**
```
Monitor Type: HTTP(s)
Friendly Name: Doctor.mx Health Check
URL: https://doctormx.com/api/health
Monitoring Interval: 1 minute (Pro) / 5 minutes (Free)
Monitor Timeout: 30 seconds
HTTP Method: GET
```

**Pros:**
- Generous free tier
- Simple, intuitive interface
- Good mobile app
- Affordable pricing

**Cons:**
- Limited advanced features on free tier
- Fewer global monitoring locations

---

### 3. Better Uptime (Recommended for Modern Teams)

**Best For:** Teams wanting beautiful status pages and integrated incident management

**Features:**
- Beautiful, customizable status pages
- Incident management with timelines
- Heartbeat monitoring (for background jobs)
- On-call scheduling
- Integration with PagerDuty, Slack, etc.

**Pricing:** Free tier available; Team at $24/month

**Configuration Example:**
```
Monitor Name: Doctor.mx API Health
URL: https://doctormx.com/api/health
Check Frequency: 30 seconds
Request Timeout: 30 seconds
Expected Status Code: 200
Regions: US East, US West, EU, LATAM
```

**Pros:**
- Beautiful, modern UI
- Built-in incident communication
- Fast check intervals (30s on paid plans)
- Good on-call rotation features

**Cons:**
- Newer service, less proven track record
- Higher cost for advanced features

---

### Service Comparison Summary

| Feature | Pingdom | UptimeRobot | Better Uptime |
|---------|---------|-------------|---------------|
| **Free Tier** | 14-day trial | 50 monitors | 10 monitors |
| **Min Interval** | 1 min | 1 min (Pro) | 30 sec |
| **Global Locations** | 100+ | 12 | 6 |
| **Status Page** | Yes | Yes | Yes (best) |
| **SMS Alerts** | Yes | Pro only | Yes |
| **Starting Price** | $15/mo | $8/mo | $24/mo |
| **Best For** | Enterprise | Budget | Modern teams |

---

## Alert Configuration

### Recommended Alert Channels

#### 1. Email Alerts

**Configuration:**
```yaml
recipients:
  - devops@doctormx.com
  - oncall@doctormx.com
severity_levels:
  - critical: immediate
  - warning: immediate
  - recovery: immediate
```

**Best Practices:**
- Use dedicated on-call email addresses
- Configure email-to-SMS gateways for critical alerts
- Include alert context (response body, headers, timestamp)

---

#### 2. Slack Integration

**Configuration:**
```yaml
channel: "#alerts-production"
mention_on_critical: "@channel"
include_details: true
thread_updates: true
```

**Message Format:**
```
🔴 CRITICAL: Doctor.mx Health Check Failed

Endpoint: /api/health
Status: 503 Service Unavailable
Response Time: 5234ms
Timestamp: 2026-02-16 15:30:00 UTC
Region: US-East

Checks Failed:
- Database: Connection timeout
- Cache: OK (12ms)

Runbook: https://wiki.doctormx.com/runbooks/health-check-failure
```

---

#### 3. PagerDuty Integration (Critical Only)

**Configuration:**
```yaml
service_key: "<pagerduty-integration-key>"
escalation_policy: "Doctor.mx Critical"
incident_creation: "critical_alerts_only"
auto_resolve: true
```

**Trigger Conditions:**
- Health check fails 3 consecutive times
- Response time > 5 seconds
- Database check fails

---

### Check Intervals

| Check Type | Interval | Timeout | Alert After |
|------------|----------|---------|-------------|
| **Full Health** (`/api/health`) | 1 minute | 30s | 2 consecutive failures |
| **Homepage** (`/`) | 1 minute | 30s | 2 consecutive failures |
| **Database** (`?check=db`) | 5 minutes | 30s | 1 failure |

**Rationale:**
- 1-minute intervals balance sensitivity with cost
- 2 consecutive failures prevent false positives from transient issues
- 30-second timeout accounts for cold starts and network latency

---

### Response Time Thresholds

| Endpoint | Warning | Critical | Action |
|----------|---------|----------|--------|
| `/api/health` | > 200ms | > 500ms | Investigate performance |
| `/` | > 500ms | > 1000ms | Check CDN/Edge performance |
| `/api/health?check=db` | > 100ms | > 300ms | Check database performance |

**Note:** These thresholds assume warm instances. Cold starts may exceed these values temporarily.

---

## Implementation Checklist

### Phase 1: Basic Monitoring

- [ ] Sign up for chosen monitoring service
- [ ] Add `/api/health` monitor (1-minute interval)
- [ ] Configure email alerts
- [ ] Test alert delivery (simulate failure)
- [ ] Document monitor IDs and URLs

### Phase 2: Enhanced Monitoring

- [ ] Add homepage monitor (`/`)
- [ ] Add database-specific monitor (`?check=db`)
- [ ] Configure Slack integration
- [ ] Set up response time alerts
- [ ] Configure multiple geographic locations

### Phase 3: Advanced Setup

- [ ] Configure PagerDuty for critical alerts
- [ ] Set up public status page
- [ ] Add SSL certificate expiration monitoring
- [ ] Configure escalation policies
- [ ] Document runbooks for each alert type
- [ ] Train team on alert response procedures

---

## Runbook: Responding to Alerts

### Alert: Health Check Fails (503)

**Impact:** Service partially or fully unavailable

**Immediate Actions:**
1. Check `/api/health` response manually
2. Identify which checks are failing
3. Check service status dashboards (Supabase, Stripe, etc.)

**Troubleshooting by Failure Type:**

#### Database Check Failed
```bash
# Check Supabase status
curl -s https://status.supabase.com/api/v2/status.json

# Test database connectivity
psql $DATABASE_URL -c "SELECT 1;"

# Check connection pool usage
# (via Supabase dashboard)
```

#### Cache Check Failed
```bash
# Verify Redis/Upstash status
curl -s https://status.upstash.com/

# Test cache connectivity
redis-cli -u $REDIS_URL ping
```

#### Stripe Check Failed
```bash
# Check Stripe status
curl -s https://status.stripe.com/current

# Verify API key validity
stripe products list --limit 1
```

#### AI Service Check Failed
```bash
# Verify API keys are configured
echo $GLM_API_KEY
echo $OPENAI_API_KEY

# Check service status
# (No public status page - verify via API call)
```

### Alert: Response Time Degradation

**Impact:** Poor user experience

**Actions:**
1. Check application metrics (Vercel, Datadog)
2. Review recent deployments for regressions
3. Check database query performance
4. Verify cache hit rates

### Alert: Homepage Down

**Impact:** Users cannot access site

**Actions:**
1. Check if `/api/health` is also failing
2. Verify CDN/Vercel status
3. Check for deployment issues
4. Verify DNS resolution

---

## Escalation Procedures

### Severity Levels

| Level | Description | Response Time | Escalation |
|-------|-------------|---------------|------------|
| **P1 - Critical** | Complete outage, all users affected | 5 minutes | On-call engineer → Engineering Manager → CTO |
| **P2 - High** | Major functionality degraded | 15 minutes | On-call engineer → Engineering Manager |
| **P3 - Medium** | Minor issue, workaround available | 1 hour | Next business day |
| **P4 - Low** | Cosmetic issue | Best effort | Backlog |

### On-Call Rotation

**Primary:** DevOps Engineer  
**Secondary:** Backend Lead  
**Escalation:** Engineering Manager

**Contact Information:**
- Document in PagerDuty or similar
- Include in alert messages
- Maintain 15-minute response SLA for P1/P2

---

## Appendix

### Health Check Response Schema

```typescript
interface HealthResponse {
  status: 'healthy' | 'unhealthy' | 'degraded'
  timestamp: string      // ISO 8601
  version: string        // App version
  uptime: number         // Seconds since start
  environment: string    // production, staging, etc.
  checks: {
    database: {
      status: 'ok' | 'error' | 'degraded' | 'skipped'
      latency: number    // milliseconds
      message?: string   // Error details if failed
    }
    cache: { /* same */ }
    stripe: { /* same */ }
    ai: { /* same */ }
  }
}
```

### Related Documentation

- [Health Check Implementation](../src/app/api/health/route.ts)
- [Web Vitals Monitoring](./web-vitals-tracking.md)
- [Security Assessment](./SECURITY_ASSESSMENT_2026-02-09.md)
- [Architecture Overview](./ARCHITECTURE_ANALYSIS_REPORT.md)

---

## Change Log

| Date | Author | Changes |
|------|--------|---------|
| 2026-02-16 | DevOps | Initial documentation created |

---

**Note:** This is a configuration guide. Actual monitoring setup must be performed in the chosen monitoring service's dashboard. Keep monitor URLs and API keys secure and rotate them according to security policies.
