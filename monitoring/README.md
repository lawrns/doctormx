# Doctor.mx Uptime Monitoring - OBS-003

This directory contains the uptime monitoring configuration and automation scripts for Doctor.mx.

## Quick Start

### 1. Choose Your Monitoring Provider

**Recommended: UptimeRobot** (Free tier available)
- 50 monitors on free plan
- 5-minute intervals (1-minute on Pro)
- Email and Slack alerts
- Public status page

**Alternative: Pingdom** (Paid)
- More advanced features
- Better for enterprise
- SMS alerts included

### 2. Environment Variables

Copy these to your `.env` file:

```bash
# UptimeRobot
UPTIMEROBOT_API_KEY=your_api_key_here
UPTIMEROBOT_EMAIL_ALERT_ID=12345
UPTIMEROBOT_SLACK_ALERT_ID=67890

# Pingdom
PINGDOM_API_TOKEN=your_token_here
PINGDOM_EMAIL=admin@doctor.mx

# Alerts
ALERT_EMAIL=admin@doctor.mx
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
ALERT_WEBHOOK_URL=https://api.pagerduty.com/...  # Optional

# Webhook Security
MONITORING_WEBHOOK_SECRET=random_secret_string

# Status Page (StatusPage.io)
STATUS_PAGE_PROVIDER=statuspage
STATUS_PAGE_API_KEY=your_statuspage_api_key
STATUS_PAGE_ID=your_page_id
STATUS_COMPONENT_API=component_id
STATUS_COMPONENT_WEBSITE=component_id
STATUS_COMPONENT_DATABASE=component_id
STATUS_COMPONENT_AI=component_id
STATUS_COMPONENT_PAYMENTS=component_id
STATUS_COMPONENT_NOTIFICATIONS=component_id
```

### 3. Run Setup Script

**UptimeRobot:**
```bash
cd monitoring
export UPTIMEROBOT_API_KEY="your_key"
export ALERT_EMAIL="admin@doctor.mx"
./setup-uptimerobot.sh
```

**Pingdom:**
```bash
cd monitoring
export PINGDOM_API_TOKEN="your_token"
export PINGDOM_EMAIL="admin@doctor.mx"
./setup-pingdom.sh
```

### 4. Configure Webhook Endpoint

Set up the webhook URL in your monitoring service:
```
https://doctor.mx/api/webhooks/monitoring
```

Add the secret header:
```
Authorization: Bearer your_webhook_secret
```

## Files

| File | Description |
|------|-------------|
| `uptime-config.js` | Central configuration for all monitors |
| `setup-uptimerobot.sh` | Automated UptimeRobot setup script |
| `setup-pingdom.sh` | Automated Pingdom setup script |
| `status-page-integration.js` | Status page API integration |
| `webhook-handler.js` | Webhook processing (reference) |
| `README.md` | This file |

## Monitored Endpoints

| Endpoint | Interval | Timeout | Critical |
|----------|----------|---------|----------|
| `/api/health` | 60s | 10s | Yes |
| `/` (homepage) | 300s | 10s | No |
| `/api/auth/session` | 300s | 5s | Yes |

## Alert Flow

```
Monitor Fails
     │
     ▼
Retry (2x)
     │
     ▼
Webhook to /api/webhooks/monitoring
     │
     ├──▶ Slack Notification
     │
     ├──▶ Status Page Update
     │
     └──▶ Escalation (if critical)
```

## Testing

### Test Health Endpoint
```bash
curl https://doctor.mx/api/health | jq
```

### Test Webhook
```bash
curl -X POST https://doctor.mx/api/webhooks/monitoring \
  -H "Content-Type: application/json" \
  -d '{
    "monitorFriendlyName": "Test Monitor",
    "monitorURL": "https://doctor.mx",
    "alertType": 1,
    "monitorID": "12345"
  }'
```

### Webhook Health Check
```bash
curl https://doctor.mx/api/webhooks/monitoring
```

## Troubleshooting

### Webhook Not Receiving Alerts
1. Check webhook URL is correct in monitoring service
2. Verify `MONITORING_WEBHOOK_SECRET` matches
3. Check logs: `netlify logs --function=webhooks/monitoring`
4. Test webhook manually with curl

### Slack Alerts Not Working
1. Verify `SLACK_WEBHOOK_URL` is set correctly
2. Check Slack channel exists and bot has access
3. Test webhook: `curl -X POST $SLACK_WEBHOOK_URL -d '{"text":"Test"}'`

### Status Page Not Updating
1. Verify `STATUS_PAGE_API_KEY` and `STATUS_PAGE_ID`
2. Check component IDs are correct
3. Review logs for API errors

## Maintenance Windows

Configure maintenance windows in `uptime-config.js`:

```javascript
export const maintenanceWindows = [
  {
    name: 'Weekly Maintenance',
    dayOfWeek: 0, // Sunday
    startHour: 2, // 2:00 AM
    durationHours: 2,
    timezone: 'America/Mexico_City',
  },
];
```

## Support

- **Documentation**: `/docs/monitoring/OBS-003-UPTIME-MONITORING.md`
- **Runbook**: See full documentation for incident response
- **Slack**: #infrastructure
- **Email**: devops@doctor.mx

## References

- [UptimeRobot API](https://uptimerobot.com/api/)
- [Pingdom API](https://www.pingdom.com/api/)
- [StatusPage.io API](https://developer.statuspage.io/)
