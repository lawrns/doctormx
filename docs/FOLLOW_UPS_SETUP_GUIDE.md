# Follow-ups System - Setup and Verification Guide

## Overview

The Doctor.mx follow-up system provides automated patient follow-up notifications via WhatsApp. This guide covers setup, verification, and maintenance.

## System Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Appointment   │────▶│  Schedule Logic  │────▶│  Followups DB   │
│   Completed     │     │ (auto-trigger)   │     │   (pending)     │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                          │
                                                          ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Cron Job      │────▶│  Process Pending │────▶│  Twilio API     │
│  (every 15min)  │     │  Follow-ups      │     │  (WhatsApp)     │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

## Database Schema

### Core Tables

1. **followups** - Main follow-up records
   - `id`, `appointment_id`, `patient_id`, `doctor_id`, `prescription_id`
   - `type`: follow_up_24h, follow_up_7d, medication_reminder, prescription_refill, chronic_care_check
   - `status`: pending, sent, failed, responded, cancelled
   - `scheduled_at`, `sent_at`, `retry_count`, `next_retry_at`

2. **followup_audit** - Audit trail for all events
   - Tracks: created, sent, failed, retrying, responded, cancelled, opted_out

3. **followup_opt_outs** - Patient opt-out preferences
   - `patient_id`, `opt_out_type`: all, followups, reminders, promotional
   - `reason`, `opted_out_via`, `opted_out_at`

4. **notification_logs** - All sent notifications
   - `phone_number`, `template`, `status`, `twilio_sid`, `message_body`

## Follow-up Types

| Type | Description | Schedule |
|------|-------------|----------|
| `follow_up_24h` | Post-consultation check-in | 24 hours after appointment |
| `follow_up_7d` | Weekly follow-up | 7 days after appointment |
| `medication_reminder` | Medication adherence | Custom schedule |
| `prescription_refill` | Refill reminder | When prescription expires |
| `chronic_care_check` | Ongoing care management | Custom schedule |

## Initial Setup

### 1. Run Database Migrations

```bash
# Apply the follow-ups tables migration
psql $DATABASE_URL -f supabase/migrations/005_chat_and_followup_tables.sql

# Apply the enhancements migration (retry logic, opt-outs)
psql $DATABASE_URL -f supabase/migrations/009_followup_enhancements.sql
```

### 2. Configure Environment Variables

```bash
# Required
CRON_SECRET=your-super-secret-cron-key
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=your-auth-token

# Optional
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

### 3. Configure Cron Job

#### Option A: Vercel Cron Jobs

Add to `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/followups",
    "schedule": "*/15 * * * *"
  }]
}
```

#### Option B: GitHub Actions

Create `.github/workflows/followups-cron.yml`:
```yaml
name: Follow-ups Cron
on:
  schedule:
    - cron: '*/15 * * * *'
  workflow_dispatch:

jobs:
  followups:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger follow-ups endpoint
        run: |
          curl -X GET "$API_URL/api/cron/followups" \
            -H "Authorization: Bearer $CRON_SECRET"
```

#### Option C: Traditional Cron (VPS/Server)

```bash
# Edit crontab
crontab -e

# Add this line (runs every 15 minutes)
*/15 * * * * curl -X GET "https://doctormx.com/api/cron/followups" -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Verification

### 1. Health Check Endpoint

```bash
curl -X GET "https://doctormx.com/api/admin/followups/verify" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

Response:
```json
{
  "overall": "healthy",
  "checks": [
    {
      "name": "Database Connection",
      "status": "pass",
      "message": "Database connection successful"
    },
    {
      "name": "Pending Follow-ups",
      "status": "pass",
      "message": "5 pending follow-ups"
    },
    {
      "name": "Follow-up Success Rate",
      "status": "pass",
      "message": "95.5% success rate (7 days)"
    }
  ],
  "timestamp": "2026-02-09T12:00:00Z"
}
```

### 2. Manual Test

Create a test follow-up via API:

```bash
curl -X POST "https://doctormx.com/api/admin/followups/verify" \
  -H "Content-Type: application/json" \
  -d '{"action": "create_test_followup"}'
```

### 3. Check Cron Logs

```bash
# If using Vercel
vercel logs --follow

# If using traditional cron
grep CRON /var/log/syslog
```

## Monitoring

### Key Metrics to Monitor

1. **Success Rate**: Target > 95%
2. **Pending Queue**: Should not grow indefinitely
3. **Retry Rate**: Should be < 5%
4. **Opt-out Rate**: Monitor trends

### Alert Thresholds

| Metric | Warning | Critical |
|--------|---------|----------|
| Success Rate | < 95% | < 90% |
| Failed (24h) | > 10 | > 50 |
| Overdue Follow-ups | > 20 | > 100 |

## Troubleshooting

### Issue: Follow-ups not being sent

1. Check cron job is running:
   ```bash
   curl -X GET "https://doctormx.com/api/cron/followups" \
     -H "Authorization: Bearer $CRON_SECRET"
   ```

2. Check Twilio credentials are valid

3. Check patient phone numbers are formatted correctly

### Issue: High failure rate

1. Check Twilio quota limits

2. Verify phone numbers include country code

3. Review error messages in `followups.error_message`

### Issue: Patients receiving unwanted messages

1. Verify opt-out logic is working:
   ```sql
   SELECT * FROM followup_opt_outs LIMIT 10;
   ```

2. Check profile notification preferences

3. Verify `whatsapp_opt_out` flags

## Maintenance Tasks

### Daily

- Monitor success rate
- Check for critical failures

### Weekly

- Review opt-out trends
- Verify cron execution logs
- Check retry queue depth

### Monthly

- Review and clean up old audit logs
- Analyze response patterns
- Update messaging templates if needed

## API Reference

### Schedule Follow-up

```typescript
POST /api/followups/schedule
{
  "appointmentId": "uuid",
  "type": "follow_up_24h",
  "scheduledAt": "2026-02-10T12:00:00Z" // optional
}
```

### Process Follow-ups (Cron)

```typescript
GET /api/cron/followups
Headers: Authorization: Bearer CRON_SECRET
```

### Patient Opt-out

```typescript
POST /api/followups/opt-out
{
  "optOutType": "all" | "followups" | "reminders",
  "reason": "Too many messages"
}
```

### Get Statistics

```typescript
GET /api/followups/stats
Response: {
  total: number,
  sent: number,
  failed: number,
  pending: number,
  retryRate: number,
  optOuts: number
}
```

## Security Considerations

1. **CRON_SECRET**: Must be kept confidential
2. **Rate Limiting**: Cron endpoint has auth check
3. **Opt-out**: Required for regulatory compliance
4. **Patient Consent**: Tracked in `profiles.notification_preferences`

## Compliance Notes

- Patients can opt-out at any time via WhatsApp response "STOP"
- Opt-out requests are processed immediately
- All messages include AI disclaimer
- Patient data is handled per HIPAA guidelines

## Future Enhancements

- [ ] Add SMS fallback for WhatsApp failures
- [ ] Multi-language support
- [ ] Custom scheduling UI for doctors
- [ ] Patient preference portal
- [ ] Analytics dashboard
