/**
 * Monitoring Webhook Handler - OBS-003 Implementation
 * 
 * Receives webhook notifications from UptimeRobot/Pingdom and:
 * - Forwards to Slack with rich formatting
 * - Creates/updates status page incidents
 * - Logs to observability system
 * - Triggers escalation if needed
 * 
 * Deploy as: /api/webhooks/monitoring
 * 
 * @module monitoring/webhook-handler
 */

import { logger } from '../src/lib/observability/logger.js';
import { createIncident, resolveIncident, processHealthResults } from './status-page-integration.js';

// ============================================================================
// Configuration
// ============================================================================

const WEBHOOK_SECRET = process.env.MONITORING_WEBHOOK_SECRET;
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

// Escalation configuration
const ESCALATION_CONFIG = {
  // After how many minutes of downtime to escalate
  escalationMinutes: 15,
  // Webhook to call for escalation (e.g., PagerDuty)
  escalationWebhook: process.env.ESCALATION_WEBHOOK_URL,
};

// ============================================================================
// UptimeRobot Webhook Handler
// ============================================================================

/**
 * Parse UptimeRobot webhook payload
 * @param {Object} payload - UptimeRobot webhook body
 */
function parseUptimeRobotPayload(payload) {
  // UptimeRobot alert format
  return {
    monitorName: payload.monitorFriendlyName,
    monitorUrl: payload.monitorURL,
    alertType: payload.alertType, // 1 = down, 2 = up
    alertDetails: payload.alertDetails,
    monitorId: payload.monitorID,
    timestamp: new Date(),
    provider: 'uptimerobot',
  };
}

/**
 * Parse Pingdom webhook payload
 * @param {Object} payload - Pingdom webhook body
 */
function parsePingdomPayload(payload) {
  // Pingdom alert format
  const check = payload.check_name || payload.check;
  return {
    monitorName: check,
    monitorUrl: payload.check_url || payload.url,
    alertType: payload.current_state === 'DOWN' ? 1 : 2,
    alertDetails: payload.long_description || payload.description,
    monitorId: payload.check_id,
    timestamp: new Date(),
    provider: 'pingdom',
  };
}

// ============================================================================
// Slack Notifications
// ============================================================================

/**
 * Send formatted alert to Slack
 * @param {Object} alert - Parsed alert data
 * @param {string} status - 'down', 'up', or 'degraded'
 */
async function sendSlackNotification(alert, status) {
  if (!SLACK_WEBHOOK_URL) {
    logger.warn('Slack webhook not configured');
    return;
  }

  const colorMap = {
    down: '#FF0000',      // Red
    up: '#36A64F',        // Green
    degraded: '#FF9900',  // Orange
  };

  const emojiMap = {
    down: ':red_circle:',
    up: ':green_circle:',
    degraded: ':yellow_circle:',
  };

  const title = status === 'down' 
    ? `${emojiMap[status]} Service Down: ${alert.monitorName}`
    : `${emojiMap[status]} Service Recovered: ${alert.monitorName}`;

  const payload = {
    attachments: [
      {
        color: colorMap[status],
        title,
        fields: [
          {
            title: 'Monitor',
            value: alert.monitorName,
            short: true,
          },
          {
            title: 'URL',
            value: alert.monitorUrl,
            short: true,
          },
          {
            title: 'Status',
            value: status.toUpperCase(),
            short: true,
          },
          {
            title: 'Time',
            value: alert.timestamp.toISOString(),
            short: true,
          },
        ],
        footer: `Doctor.mx Monitoring | ${alert.provider}`,
        footer_icon: 'https://doctor.mx/favicon.ico',
        ts: Math.floor(alert.timestamp.getTime() / 1000),
      },
    ],
  };

  if (alert.alertDetails) {
    payload.attachments[0].fields.push({
      title: 'Details',
      value: alert.alertDetails,
      short: false,
    });
  }

  // Add action buttons for down alerts
  if (status === 'down') {
    payload.attachments[0].actions = [
      {
        type: 'button',
        text: 'View Dashboard',
        url: 'https://uptimerobot.com/dashboard',
        style: 'primary',
      },
      {
        type: 'button',
        text: 'Check Health',
        url: `${alert.monitorUrl}`,
      },
      {
        type: 'button',
        text: 'Runbook',
        url: 'https://docs.doctor.mx/monitoring/OBS-003-UPTIME-MONITORING.md',
      },
    ];
  }

  try {
    const response = await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Slack webhook error: ${response.status}`);
    }

    logger.info('Slack notification sent', { monitor: alert.monitorName, status });
  } catch (error) {
    logger.error('Failed to send Slack notification', { error: error.message });
    throw error;
  }
}

// ============================================================================
// Status Page Integration
// ============================================================================

/**
 * Map monitor name to component key
 */
const MONITOR_COMPONENT_MAP = {
  'Doctor.mx API Health': 'api',
  'Doctor.mx Homepage': 'website',
  'Doctor.mx Auth API': 'api',
  'Doctor.mx AI Health': 'ai',
};

/**
 * Handle status change and update status page
 * @param {Object} alert - Parsed alert
 * @param {string} status - 'down' or 'up'
 */
async function handleStatusPageUpdate(alert, status) {
  const component = MONITOR_COMPONENT_MAP[alert.monitorName];
  if (!component) {
    logger.debug('No component mapping for monitor', { monitor: alert.monitorName });
    return;
  }

  try {
    if (status === 'down') {
      // Create incident
      await createIncident(
        `${alert.monitorName} is down`,
        alert.alertDetails || `Service unavailable: ${alert.monitorUrl}`,
        [component]
      );
    } else {
      // Resolve incident - would need incident ID tracking
      // For now, just log
      logger.info('Service recovered - manually resolve incident if needed', { 
        monitor: alert.monitorName 
      });
    }
  } catch (error) {
    logger.error('Status page update failed', { error: error.message });
  }
}

// ============================================================================
// Escalation
// ============================================================================

/**
 * Trigger escalation webhook (e.g., PagerDuty)
 * @param {Object} alert - Alert data
 */
async function triggerEscalation(alert) {
  if (!ESCALATION_CONFIG.escalationWebhook) {
    logger.debug('Escalation webhook not configured');
    return;
  }

  const payload = {
    routing_key: process.env.PAGERDUTY_ROUTING_KEY,
    event_action: 'trigger',
    dedup_key: `doctor-mx-${alert.monitorId}`,
    payload: {
      summary: `${alert.monitorName} is DOWN`,
      severity: 'critical',
      source: alert.monitorUrl,
      component: alert.monitorName,
      custom_details: {
        details: alert.alertDetails,
        provider: alert.provider,
      },
    },
  };

  try {
    const response = await fetch(ESCALATION_CONFIG.escalationWebhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Escalation webhook error: ${response.status}`);
    }

    logger.warn('Escalation triggered', { monitor: alert.monitorName });
  } catch (error) {
    logger.error('Escalation failed', { error: error.message });
  }
}

// ============================================================================
// Main Handler
// ============================================================================

/**
 * Main webhook handler
 * @param {Request} request - Incoming webhook request
 * @returns {Response}
 */
export async function handleMonitoringWebhook(request) {
  // Verify method
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  // Verify secret if configured
  if (WEBHOOK_SECRET) {
    const authHeader = request.headers.get('Authorization');
    if (authHeader !== `Bearer ${WEBHOOK_SECRET}`) {
      logger.warn('Unauthorized webhook attempt');
      return new Response('Unauthorized', { status: 401 });
    }
  }

  let payload;
  try {
    payload = await request.json();
  } catch (error) {
    return new Response('Invalid JSON', { status: 400 });
  }

  // Determine provider and parse
  let alert;
  const userAgent = request.headers.get('User-Agent') || '';
  
  if (userAgent.includes('UptimeRobot') || payload.monitorID) {
    alert = parseUptimeRobotPayload(payload);
  } else if (userAgent.includes('Pingdom') || payload.check_id) {
    alert = parsePingdomPayload(payload);
  } else {
    // Try to detect by payload structure
    if (payload.monitorFriendlyName) {
      alert = parseUptimeRobotPayload(payload);
    } else if (payload.check_name || payload.check) {
      alert = parsePingdomPayload(payload);
    } else {
      logger.error('Unknown webhook format', { payload });
      return new Response('Unknown format', { status: 400 });
    }
  }

  // Determine status
  const isDown = alert.alertType === 1 || alert.alertType === 'down';
  const status = isDown ? 'down' : 'up';

  // Log the alert
  logger.info('Monitoring alert received', {
    monitor: alert.monitorName,
    status,
    provider: alert.provider,
  });

  // Process in parallel
  const tasks = [
    sendSlackNotification(alert, status).catch(err => 
      logger.error('Slack notification failed', { error: err.message })
    ),
    handleStatusPageUpdate(alert, status).catch(err =>
      logger.error('Status page update failed', { error: err.message })
    ),
  ];

  // Trigger escalation for down alerts on critical monitors
  if (isDown && alert.monitorName.includes('API Health')) {
    tasks.push(triggerEscalation(alert).catch(err =>
      logger.error('Escalation failed', { error: err.message })
    ));
  }

  await Promise.all(tasks);

  return new Response(JSON.stringify({ received: true, status }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Health check endpoint for the webhook itself
 */
export async function handleWebhookHealth() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    slackConfigured: Boolean(SLACK_WEBHOOK_URL),
    secretConfigured: Boolean(WEBHOOK_SECRET),
    escalationConfigured: Boolean(ESCALATION_CONFIG.escalationWebhook),
  };

  return new Response(JSON.stringify(health), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

// ============================================================================
// Next.js Route Handlers
// ============================================================================

/**
 * POST /api/webhooks/monitoring
 * Receive monitoring alerts
 */
export async function POST(request) {
  return handleMonitoringWebhook(request);
}

/**
 * GET /api/webhooks/monitoring
 * Health check for webhook endpoint
 */
export async function GET() {
  return handleWebhookHealth();
}

export default {
  POST,
  GET,
  handleMonitoringWebhook,
  handleWebhookHealth,
};
