/**
 * Monitoring Webhook Endpoint - OBS-003 Implementation
 * 
 * Receives uptime monitoring alerts from UptimeRobot/Pingdom
 * and forwards notifications to Slack and status page.
 * 
 * POST /api/webhooks/monitoring - Receive alert webhooks
 * GET  /api/webhooks/monitoring - Health check
 * 
 * @module api/webhooks/monitoring
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/observability/logger';

// ============================================================================
// Configuration
// ============================================================================

const WEBHOOK_SECRET = process.env.MONITORING_WEBHOOK_SECRET;
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
const STATUS_PAGE_API_KEY = process.env.STATUS_PAGE_API_KEY;
const STATUS_PAGE_ID = process.env.STATUS_PAGE_ID;
const ESCALATION_WEBHOOK_URL = process.env.ESCALATION_WEBHOOK_URL;

// Component mapping for status page updates
const MONITOR_COMPONENT_MAP: Record<string, string> = {
  'Doctor.mx API Health': 'api',
  'Doctor.mx Homepage': 'website',
  'Doctor.mx Auth API': 'api',
  'Doctor.mx AI Health': 'ai',
};

// Component IDs from status page
const COMPONENT_IDS: Record<string, string> = {
  api: process.env.STATUS_COMPONENT_API || '',
  website: process.env.STATUS_COMPONENT_WEBSITE || '',
  database: process.env.STATUS_COMPONENT_DATABASE || '',
  ai: process.env.STATUS_COMPONENT_AI || '',
  payments: process.env.STATUS_COMPONENT_PAYMENTS || '',
  notifications: process.env.STATUS_COMPONENT_NOTIFICATIONS || '',
};

// ============================================================================
// Types
// ============================================================================

interface UptimeRobotPayload {
  monitorFriendlyName: string;
  monitorURL: string;
  alertType: number; // 1 = down, 2 = up
  alertDetails?: string;
  monitorID: string;
}

interface PingdomPayload {
  check_name?: string;
  check?: string;
  check_url?: string;
  url?: string;
  current_state: string;
  long_description?: string;
  description?: string;
  check_id: string;
}

interface AlertData {
  monitorName: string;
  monitorUrl: string;
  alertType: number | string;
  alertDetails?: string;
  monitorId: string;
  timestamp: Date;
  provider: 'uptimerobot' | 'pingdom' | 'unknown';
}

// ============================================================================
// Parser Functions
// ============================================================================

function parseUptimeRobotPayload(payload: UptimeRobotPayload): AlertData {
  return {
    monitorName: payload.monitorFriendlyName,
    monitorUrl: payload.monitorURL,
    alertType: payload.alertType,
    alertDetails: payload.alertDetails,
    monitorId: payload.monitorID,
    timestamp: new Date(),
    provider: 'uptimerobot',
  };
}

function parsePingdomPayload(payload: PingdomPayload): AlertData {
  return {
    monitorName: payload.check_name || payload.check || 'Unknown',
    monitorUrl: payload.check_url || payload.url || '',
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

async function sendSlackNotification(alert: AlertData, status: 'down' | 'up' | 'degraded'): Promise<void> {
  if (!SLACK_WEBHOOK_URL) {
    logger.warn('Slack webhook not configured');
    return;
  }

  const colorMap: Record<string, string> = {
    down: '#FF0000',
    up: '#36A64F',
    degraded: '#FF9900',
  };

  const emojiMap: Record<string, string> = {
    down: '🔴',
    up: '🟢',
    degraded: '🟡',
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
            value: alert.monitorUrl || 'N/A',
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
        ts: Math.floor(alert.timestamp.getTime() / 1000),
        actions: [] as Array<{
          type: string;
          text: string;
          url: string;
          style?: string;
        }>,
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
    payload.attachments[0].actions.push(
      {
        type: 'button',
        text: 'View Dashboard',
        url: 'https://uptimerobot.com/dashboard',
        style: 'primary',
      },
      {
        type: 'button',
        text: 'Check Health',
        url: alert.monitorUrl,
      },
      {
        type: 'button',
        text: 'Runbook',
        url: 'https://docs.doctor.mx/monitoring/OBS-003-UPTIME-MONITORING.md',
      },
    );
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
    logger.error('Failed to send Slack notification', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    throw error;
  }
}

// ============================================================================
// Status Page Integration
// ============================================================================

async function updateStatusPage(componentId: string, status: string, message?: string): Promise<void> {
  if (!STATUS_PAGE_API_KEY || !STATUS_PAGE_ID) {
    logger.debug('Status page not configured');
    return;
  }

  try {
    const response = await fetch(
      `https://api.statuspage.io/v1/pages/${STATUS_PAGE_ID}/components/${componentId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `OAuth ${STATUS_PAGE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          component: {
            status,
            description: message || undefined,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`StatusPage API error: ${response.status}`);
    }

    logger.info('Status page updated', { componentId, status });
  } catch (error) {
    logger.error('Failed to update status page', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

async function handleStatusPageUpdate(alert: AlertData, status: 'down' | 'up'): Promise<void> {
  const component = MONITOR_COMPONENT_MAP[alert.monitorName];
  if (!component) {
    logger.debug('No component mapping for monitor', { monitor: alert.monitorName });
    return;
  }

  const componentId = COMPONENT_IDS[component];
  if (!componentId) {
    logger.debug('Component ID not configured', { component });
    return;
  }

  const statusPageStatus = status === 'down' ? 'major_outage' : 'operational';
  await updateStatusPage(componentId, statusPageStatus, alert.alertDetails);
}

// ============================================================================
// Escalation
// ============================================================================

async function triggerEscalation(alert: AlertData): Promise<void> {
  if (!ESCALATION_WEBHOOK_URL) {
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
    const response = await fetch(ESCALATION_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Escalation webhook error: ${response.status}`);
    }

    logger.warn('Escalation triggered', { monitor: alert.monitorName });
  } catch (error) {
    logger.error('Escalation failed', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

// ============================================================================
// Route Handlers
// ============================================================================

/**
 * POST handler - Receive monitoring webhooks
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  // Verify secret if configured
  if (WEBHOOK_SECRET) {
    const authHeader = request.headers.get('Authorization');
    if (authHeader !== `Bearer ${WEBHOOK_SECRET}`) {
      logger.warn('Unauthorized webhook attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Determine provider and parse
  let alert: AlertData;
  const userAgent = request.headers.get('User-Agent') || '';
  
  if (userAgent.includes('UptimeRobot') || (payload as UptimeRobotPayload).monitorID) {
    alert = parseUptimeRobotPayload(payload as UptimeRobotPayload);
  } else if (userAgent.includes('Pingdom') || (payload as PingdomPayload).check_id) {
    alert = parsePingdomPayload(payload as PingdomPayload);
  } else {
    // Try to detect by payload structure
    if ((payload as UptimeRobotPayload).monitorFriendlyName) {
      alert = parseUptimeRobotPayload(payload as UptimeRobotPayload);
    } else if ((payload as PingdomPayload).check_name || (payload as PingdomPayload).check) {
      alert = parsePingdomPayload(payload as PingdomPayload);
    } else {
      logger.error('Unknown webhook format', { payload });
      return NextResponse.json({ error: 'Unknown format' }, { status: 400 });
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

  // Process in parallel with error handling
  const tasks = [
    sendSlackNotification(alert, status).catch(err => 
      logger.error('Slack notification failed', { 
        error: err instanceof Error ? err.message : 'Unknown error' 
      })
    ),
    handleStatusPageUpdate(alert, status).catch(err =>
      logger.error('Status page update failed', { 
        error: err instanceof Error ? err.message : 'Unknown error' 
      })
    ),
  ];

  // Trigger escalation for down alerts on critical monitors
  if (isDown && alert.monitorName.includes('API Health')) {
    tasks.push(triggerEscalation(alert).catch(err =>
      logger.error('Escalation failed', { 
        error: err instanceof Error ? err.message : 'Unknown error' 
      })
    ));
  }

  await Promise.all(tasks);

  return NextResponse.json({ received: true, status });
}

/**
 * GET handler - Health check for webhook endpoint
 */
export async function GET(): Promise<NextResponse> {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    slackConfigured: Boolean(SLACK_WEBHOOK_URL),
    secretConfigured: Boolean(WEBHOOK_SECRET),
    statusPageConfigured: Boolean(STATUS_PAGE_API_KEY && STATUS_PAGE_ID),
    escalationConfigured: Boolean(ESCALATION_WEBHOOK_URL),
  };

  return NextResponse.json(health);
}

/**
 * OPTIONS handler for CORS
 */
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
