# OBS-003: External Uptime Monitoring Implementation

## Overview

This document describes the external uptime monitoring configuration for Doctor.mx, implementing comprehensive monitoring with alerting via email and Slack.

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  UptimeRobot    │────▶│  /api/health     │────▶│   Doctor.mx     │
│  / Pingdom      │     │  (Health Check)  │     │   Services      │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────────┐
│  Email Alerts   │     │  Slack Alerts    │
│  (admin@)       │     │  (#alerts)       │
└─────────────────┘     └──────────────────┘
```

## Monitors Configured

### 1. Doctor.mx API Health
- **URL**: `https://doctor.mx/api/health`
- **Interval**: 60 seconds (1 minute)
- **Timeout**: 10 seconds
- **Retries**: 2 before alerting
- **Importance**: Critical - monitors all service dependencies

### 2. Doctor.mx Homepage
- **URL**: `https://doctor.mx`
- **Interval**: 300 seconds (5 minutes)
- **Timeout**: 10 seconds
- **Importance**: High - user-facing availability

### 3. Doctor.mx Auth API
- **URL**: `https://doctor.mx/api/auth/session`
- **Interval**: 300 seconds (5 minutes)
- **Timeout**: 5 seconds
- **Importance**: Critical - user authentication

### 4. Doctor.mx AI Health
- **URL**: `https://doctor.mx/api/health`
- **Interval**: 120 seconds (2 minutes)
- **Timeout**: 15 seconds
- **Keyword Check**: `"ai":{"status":"ok"`
- **Importance**: High - core medical AI service

## Alert Channels

### Email Alerts
- **Recipient**: `admin@doctor.mx` (configurable via `ALERT_EMAIL`)
- **Trigger**: Any monitor fails after retries
- **Content**: Error details, response time, failure duration

### Slack Alerts
- **Webhook**: Configured via `SLACK_WEBHOOK_URL`
- **Channel**: `#alerts` or configured channel
- **Format**: Rich formatting with status indicators

### Webhook Alerts
- **URL**: Configured via `ALERT_WEBHOOK_URL`
- **Use Case**: Integration with PagerDuty, Opsgenie, or custom systems

## Health Check Endpoint

The `/api/health` endpoint returns detailed status information:

```json
{
  "status": "healthy",
  "timestamp": "2026-02-16T15:30:00.000Z",
  "version": "0.1.0",
  "uptime": 3600,
  "environment": "production",
  "checks": {
    "database": { "status": "ok", "latency": 45 },
    "cache": { "status": "ok", "latency": 12 },
    "stripe": { "status": "ok", "latency": 234 },
    "whatsapp": { "status": "ok", "latency": 567 },
    "twilio": { "status": "ok", "latency": 189 },
    "ai": { "status": "ok", "latency": 5 }
  }
}
```

### HTTP Status Codes
- `200 OK` - All services healthy
- `200 OK` (with degraded status) - Some services degraded but functional
- `503 Service Unavailable` - Critical service failure

## Configuration Files

### uptime-config.js
Location: `monitoring/uptime-config.js`

Central configuration for all monitoring services:
```javascript
export const monitors = [
  {
    name: 'Doctor.mx API Health',
    url: 'https://doctor.mx/api/health',
    interval: 60,
    timeout: 10000,
    alertChannels: ['email', 'slack']
  }
];
```

### Environment Variables
```bash
# UptimeRobot
UPTIMEROBOT_API_KEY=urXXXXXXXXXXXXXXXX
UPTIMEROBOT_EMAIL_ALERT_ID=12345
UPTIMEROBOT_SLACK_ALERT_ID=67890

# Pingdom
PINGDOM_API_TOKEN=XXXXXXXXXXXXXXXX
PINGDOM_EMAIL=admin@doctor.mx

# Alert Configuration
ALERT_EMAIL=admin@doctor.mx
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
ALERT_WEBHOOK_URL=https://api.pagerduty.com/...
```

## Setup Instructions

### Option 1: UptimeRobot (Recommended - Free Tier Available)

1. **Create Account**
   - Sign up at https://uptimerobot.com/
   - Up to 50 monitors on free plan

2. **Get API Key**
   - Go to Settings → My Settings → API Settings
   - Generate "Main API Key"

3. **Run Setup Script**
   ```bash
   cd monitoring
   export UPTIMEROBOT_API_KEY="your_api_key"
   export ALERT_EMAIL="admin@doctor.mx"
   export SLACK_WEBHOOK_URL="your_webhook_url"
   ./setup-uptimerobot.sh
   ```

4. **Manual Verification**
   - Visit https://uptimerobot.com/dashboard
   - Verify all monitors are active
   - Test alerts by pausing a monitor

### Option 2: Pingdom (Paid Service)

1. **Create Account**
   - Sign up at https://www.pingdom.com/
   - Requires paid subscription

2. **Get API Token**
   - Go to Settings → Pingdom API → Generate Token

3. **Run Setup Script**
   ```bash
   cd monitoring
   export PINGDOM_API_TOKEN="your_token"
   export PINGDOM_EMAIL="your@email.com"
   ./setup-pingdom.sh
   ```

### Option 3: Manual Configuration

1. **Create Monitor**
   - Type: HTTP(s)
   - URL: `https://doctor.mx/api/health`
   - Monitoring Interval: 1 minute
   - Timeout: 10 seconds

2. **Configure Alerts**
   - Add email: `admin@doctor.mx`
   - Add Slack webhook URL
   - Set alert threshold: 2 consecutive failures

## Status Page

### Public Status Page
- **URL**: https://status.doctor.mx (planned)
- **Service**: UptimeRobot Status Page (requires paid plan)
- **Alternative**: Cachet, StatusPage.io, or Atlassian Statuspage

### Components Monitored
1. API - Core API services
2. Website - Main website and patient portal
3. Database - Patient data and records
4. AI Services - Medical AI consultation
5. Payments - Stripe payment processing
6. Notifications - WhatsApp and email notifications

## Escalation Policy

```
Failure Detected
       │
       ▼
┌──────────────┐    After 5 min    ┌──────────────┐
│  Email Alert │ ────────────────▶ │  + Slack     │
└──────────────┘                   └──────────────┘
                                          │
                                          ▼
                                    After 15 min
                                          │
                                          ▼
                                   ┌──────────────┐
                                   │  + Webhook   │
                                   │  (PagerDuty) │
                                   └──────────────┘
```

## Maintenance Windows

Scheduled maintenance windows are configured to suppress alerts:

- **Weekly**: Sundays, 2:00 AM - 4:00 AM CST
- **Timezone**: America/Mexico_City
- **Notification**: Posted to status page 24 hours in advance

## Testing

### Test Monitor Functionality
```bash
# Test health endpoint
curl -s https://doctor.mx/api/health | jq

# Expected response time < 2 seconds
curl -w "@curl-format.txt" -o /dev/null -s https://doctor.mx/api/health
```

### Test Alerts
1. Temporarily block health endpoint
2. Verify alert received within 2-3 minutes
3. Restore endpoint
4. Verify recovery notification

## Monitoring Dashboard

### UptimeRobot Dashboard
- URL: https://uptimerobot.com/dashboard
- Mobile Apps: iOS, Android

### Pingdom Dashboard
- URL: https://my.pingdom.com/dashboard
- Mobile Apps: iOS, Android

## Runbook: Responding to Alerts

### Alert: API Health Check Failed

1. **Immediate Response (< 5 min)**
   ```bash
   # Check current status
   curl https://doctor.mx/api/health
   
   # Check logs
   netlify logs --function=api/health
   ```

2. **Identify Failure**
   - Check which component failed
   - Review error logs
   - Check third-party service status

3. **Common Issues**
   - Database connection timeout → Check Supabase status
   - Redis unavailable → Verify Upstash connection
   - Stripe API error → Check Stripe status page
   - AI service down → Verify API keys

4. **Resolution**
   - Apply fix based on identified issue
   - Verify health check passes
   - Update status page
   - Post-mortem if needed

## Cost Analysis

### UptimeRobot
- **Free**: 50 monitors, 5-minute intervals
- **Pro ($15/mo)**: 100 monitors, 1-minute intervals, SMS alerts
- **Enterprise**: Custom pricing

### Pingdom
- **Starter ($15/mo)**: 10 checks, SMS alerts
- **Advanced ($45/mo)**: 50 checks, multi-user
- **Professional ($80/mo)**: 250 checks, API access

### Recommended: UptimeRobot Pro
- 1-minute monitoring for critical endpoints
- SMS alerts for after-hours
- Status page included

## Security Considerations

1. **API Keys**: Store in environment variables, never commit
2. **Health Endpoint**: No sensitive data exposed
3. **Rate Limiting**: Health endpoint excluded from rate limits
4. **Authentication**: Health endpoint is public (intentional for monitoring)

## Compliance

### HIPAA Considerations
- Health endpoint does NOT expose PHI
- Only infrastructure status is returned
- Monitoring tools only check availability, not content

## Related Documentation

- [Health Check Implementation](../src/app/api/health/README.md)
- [Observability Strategy](./OBSERVABILITY.md)
- [Incident Response](./INCIDENT-RESPONSE.md)

## Support

For monitoring issues:
- **Email**: devops@doctor.mx
- **Slack**: #infrastructure
- **On-call**: See PagerDuty rotation

---

**Last Updated**: 2026-02-16
**Version**: 1.0
**Owner**: DevOps Team
