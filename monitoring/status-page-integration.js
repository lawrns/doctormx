/**
 * Status Page Integration - OBS-003 Implementation
 * 
 * Automates status page updates based on health check results.
 * Compatible with StatusPage.io, Cachet, and custom status pages.
 * 
 * @module monitoring/status-page-integration
 */

import { logger } from '../src/lib/observability/logger.js';

// ============================================================================
// Configuration
// ============================================================================

const STATUS_PAGE_PROVIDER = process.env.STATUS_PAGE_PROVIDER || 'cachet'; // 'statuspage', 'cachet', 'custom'
const STATUS_PAGE_API_KEY = process.env.STATUS_PAGE_API_KEY;
const STATUS_PAGE_ID = process.env.STATUS_PAGE_ID;
const STATUS_PAGE_URL = process.env.STATUS_PAGE_URL;

// Component IDs mapping (configured in your status page)
const COMPONENT_IDS = {
  api: process.env.STATUS_COMPONENT_API,
  website: process.env.STATUS_COMPONENT_WEBSITE,
  database: process.env.STATUS_COMPONENT_DATABASE,
  ai: process.env.STATUS_COMPONENT_AI,
  payments: process.env.STATUS_COMPONENT_PAYMENTS,
  notifications: process.env.STATUS_COMPONENT_NOTIFICATIONS,
};

// Status mapping: health status → status page status
const STATUS_MAPPING = {
  healthy: 'operational',
  degraded: 'degraded_performance',
  unhealthy: 'major_outage',
  ok: 'operational',
  error: 'major_outage',
  skipped: 'operational',
};

// ============================================================================
// StatusPage.io Integration
// ============================================================================

/**
 * Update StatusPage.io component status
 * @param {string} componentId - Component ID
 * @param {string} status - Status (operational, degraded_performance, partial_outage, major_outage)
 * @param {string} [description] - Optional status description
 */
async function updateStatusPageComponent(componentId, status, description = '') {
  if (!STATUS_PAGE_API_KEY || !STATUS_PAGE_ID) {
    logger.warn('StatusPage.io credentials not configured');
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
            description: description || undefined,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`StatusPage API error: ${response.status}`);
    }

    logger.info('StatusPage component updated', { componentId, status });
  } catch (error) {
    logger.error('Failed to update StatusPage', { componentId, error: error.message });
    throw error;
  }
}

/**
 * Create StatusPage.io incident
 * @param {string} name - Incident name
 * @param {string} status - Incident status (investigating, identified, monitoring, resolved)
 * @param {string} message - Incident message
 * @param {string[]} componentIds - Affected component IDs
 */
async function createStatusPageIncident(name, status, message, componentIds) {
  if (!STATUS_PAGE_API_KEY || !STATUS_PAGE_ID) {
    logger.warn('StatusPage.io credentials not configured');
    return;
  }

  try {
    const response = await fetch(
      `https://api.statuspage.io/v1/pages/${STATUS_PAGE_ID}/incidents`,
      {
        method: 'POST',
        headers: {
          'Authorization': `OAuth ${STATUS_PAGE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          incident: {
            name,
            status,
            message,
            component_ids: componentIds,
            impact_override: status === 'resolved' ? 'none' : 'major',
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`StatusPage API error: ${response.status}`);
    }

    const data = await response.json();
    logger.info('StatusPage incident created', { incidentId: data.id, name });
    return data;
  } catch (error) {
    logger.error('Failed to create StatusPage incident', { error: error.message });
    throw error;
  }
}

// ============================================================================
// Cachet Integration
// ============================================================================

/**
 * Update Cachet component status
 * @param {string} componentId - Component ID
 * @param {number} status - Status (1=operational, 2=performance issues, 3=partial outage, 4=major outage)
 * @param {string} [message] - Optional message
 */
async function updateCachetComponent(componentId, status, message = '') {
  if (!STATUS_PAGE_URL || !STATUS_PAGE_API_KEY) {
    logger.warn('Cachet credentials not configured');
    return;
  }

  try {
    const response = await fetch(
      `${STATUS_PAGE_URL}/api/v1/components/${componentId}`,
      {
        method: 'PUT',
        headers: {
          'X-Cachet-Token': STATUS_PAGE_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          description: message || undefined,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Cachet API error: ${response.status}`);
    }

    logger.info('Cachet component updated', { componentId, status });
  } catch (error) {
    logger.error('Failed to update Cachet', { componentId, error: error.message });
    throw error;
  }
}

// ============================================================================
// Health Check Result Processing
// ============================================================================

/**
 * Process health check results and update status page
 * @param {Object} healthData - Health check response data
 */
export async function processHealthResults(healthData) {
  const { checks, status: overallStatus } = healthData;

  // Map health checks to components
  const componentUpdates = [
    { check: 'database', component: 'database' },
    { check: 'cache', component: 'database' }, // Cache is part of data layer
    { check: 'stripe', component: 'payments' },
    { check: 'whatsapp', component: 'notifications' },
    { check: 'twilio', component: 'notifications' },
    { check: 'ai', component: 'ai' },
  ];

  for (const { check, component } of componentUpdates) {
    const checkResult = checks[check];
    if (!checkResult) continue;

    const componentId = COMPONENT_IDS[component];
    if (!componentId) {
      logger.debug(`Component ID not configured for ${component}`);
      continue;
    }

    const statusPageStatus = STATUS_MAPPING[checkResult.status];
    
    try {
      await updateComponentStatus(componentId, statusPageStatus, checkResult.message);
    } catch (error) {
      // Log but don't throw - don't block health check response
      logger.error(`Failed to update ${component} status`, { error: error.message });
    }
  }

  // Update overall API status
  if (COMPONENT_IDS.api) {
    const apiStatus = STATUS_MAPPING[overallStatus];
    await updateComponentStatus(COMPONENT_IDS.api, apiStatus);
  }
}

/**
 * Update component status (provider-agnostic)
 * @param {string} componentId - Component ID
 * @param {string} status - Status
 * @param {string} [message] - Optional message
 */
async function updateComponentStatus(componentId, status, message = '') {
  switch (STATUS_PAGE_PROVIDER) {
    case 'statuspage':
      await updateStatusPageComponent(componentId, status, message);
      break;
    case 'cachet':
      // Convert string status to Cachet numeric status
      const cachetStatus = {
        operational: 1,
        degraded_performance: 2,
        partial_outage: 3,
        major_outage: 4,
      }[status] || 1;
      await updateCachetComponent(componentId, cachetStatus, message);
      break;
    case 'custom':
      await updateCustomStatusPage(componentId, status, message);
      break;
    default:
      logger.warn(`Unknown status page provider: ${STATUS_PAGE_PROVIDER}`);
  }
}

/**
 * Custom status page integration
 * Implement your own status page API call here
 */
async function updateCustomStatusPage(componentId, status, message) {
  if (!STATUS_PAGE_URL) {
    logger.warn('Custom status page URL not configured');
    return;
  }

  try {
    const response = await fetch(`${STATUS_PAGE_URL}/api/components/${componentId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STATUS_PAGE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status, message }),
    });

    if (!response.ok) {
      throw new Error(`Custom status page API error: ${response.status}`);
    }

    logger.info('Custom status page updated', { componentId, status });
  } catch (error) {
    logger.error('Failed to update custom status page', { error: error.message });
    throw error;
  }
}

// ============================================================================
// Incident Management
// ============================================================================

/**
 * Create incident from alert
 * @param {string} title - Incident title
 * @param {string} message - Incident description
 * @param {string[]} affectedComponents - Component keys (api, database, etc.)
 */
export async function createIncident(title, message, affectedComponents) {
  const componentIds = affectedComponents
    .map(c => COMPONENT_IDS[c])
    .filter(Boolean);

  if (componentIds.length === 0) {
    logger.warn('No component IDs configured for incident');
    return;
  }

  switch (STATUS_PAGE_PROVIDER) {
    case 'statuspage':
      return createStatusPageIncident(title, 'investigating', message, componentIds);
    case 'cachet':
      // Cachet incident creation would go here
      logger.info('Cachet incident creation not implemented');
      break;
    default:
      logger.warn('Incident creation not implemented for provider', { provider: STATUS_PAGE_PROVIDER });
  }
}

/**
 * Resolve incident
 * @param {string} incidentId - Incident ID
 * @param {string} message - Resolution message
 */
export async function resolveIncident(incidentId, message) {
  if (STATUS_PAGE_PROVIDER !== 'statuspage' || !STATUS_PAGE_API_KEY) {
    return;
  }

  try {
    const response = await fetch(
      `https://api.statuspage.io/v1/pages/${STATUS_PAGE_ID}/incidents/${incidentId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `OAuth ${STATUS_PAGE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          incident: {
            status: 'resolved',
            message,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`StatusPage API error: ${response.status}`);
    }

    logger.info('Incident resolved', { incidentId });
  } catch (error) {
    logger.error('Failed to resolve incident', { incidentId, error: error.message });
    throw error;
  }
}

// ============================================================================
// Maintenance Windows
// ============================================================================

/**
 * Schedule maintenance window
 * @param {string} name - Maintenance name
 * @param {Date} startTime - Start time
 * @param {number} durationMinutes - Duration in minutes
 * @param {string[]} affectedComponents - Component keys
 * @param {string} message - Maintenance message
 */
export async function scheduleMaintenance(name, startTime, durationMinutes, affectedComponents, message) {
  if (STATUS_PAGE_PROVIDER !== 'statuspage' || !STATUS_PAGE_API_KEY) {
    logger.warn('Maintenance scheduling only supported for StatusPage.io');
    return;
  }

  const componentIds = affectedComponents
    .map(c => COMPONENT_IDS[c])
    .filter(Boolean);

  try {
    const response = await fetch(
      `https://api.statuspage.io/v1/pages/${STATUS_PAGE_ID}/incidents`,
      {
        method: 'POST',
        headers: {
          'Authorization': `OAuth ${STATUS_PAGE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          incident: {
            name,
            status: 'scheduled',
            message,
            component_ids: componentIds,
            scheduled_for: startTime.toISOString(),
            scheduled_until: new Date(startTime.getTime() + durationMinutes * 60000).toISOString(),
            scheduled_remind_prior: true,
            scheduled_auto_in_progress: true,
            scheduled_auto_completed: true,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`StatusPage API error: ${response.status}`);
    }

    const data = await response.json();
    logger.info('Maintenance scheduled', { maintenanceId: data.id, name });
    return data;
  } catch (error) {
    logger.error('Failed to schedule maintenance', { error: error.message });
    throw error;
  }
}

// ============================================================================
// Exports
// ============================================================================

export default {
  processHealthResults,
  createIncident,
  resolveIncident,
  scheduleMaintenance,
  updateComponentStatus,
};
