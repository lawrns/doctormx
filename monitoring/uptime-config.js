/**
 * Uptime Monitoring Configuration - OBS-003 Implementation
 * 
 * This file contains the configuration for external uptime monitoring services.
 * Compatible with UptimeRobot, Pingdom, StatusCake, and other monitoring services.
 * 
 * Usage:
 * - Import this config to set up monitoring via API
 * - Use with UptimeRobot API: https://uptimerobot.com/api/
 * - Use with Pingdom API: https://www.pingdom.com/api/
 * 
 * @module monitoring/uptime-config
 */

/**
 * @typedef {Object} AlertChannel
 * @property {string} type - Alert type: 'email', 'slack', 'webhook', 'sms'
 * @property {string} [email] - Email address for email alerts
 * @property {string} [slackWebhook] - Slack webhook URL
 * @property {string} [webhookUrl] - Generic webhook URL
 * @property {string} [phone] - Phone number for SMS alerts
 */

/**
 * @typedef {Object} MonitorConfig
 * @property {string} name - Display name for the monitor
 * @property {string} url - URL to monitor
 * @property {number} interval - Check interval in seconds (60-86400)
 * @property {number} timeout - Request timeout in milliseconds
 * @property {string[]} alertChannels - List of alert channel types
 * @property {number} [retries] - Number of retries before alerting
 * @property {string} [keyword] - Keyword to search for in response (optional)
 * @property {string} [httpMethod] - HTTP method: GET, POST, etc.
 * @property {Object} [headers] - Custom headers to send
 * @property {number} [expectedStatusCode] - Expected HTTP status code
 */

/** @type {AlertChannel[]} */
export const alertChannels = [
  {
    type: 'email',
    email: process.env.ALERT_EMAIL || 'admin@doctor.mx',
  },
  {
    type: 'slack',
    slackWebhook: process.env.SLACK_WEBHOOK_URL,
  },
  {
    type: 'webhook',
    webhookUrl: process.env.ALERT_WEBHOOK_URL,
  },
];

/** @type {MonitorConfig[]} */
export const monitors = [
  // Primary API Health Monitor
  {
    name: 'Doctor.mx API Health',
    url: 'https://doctor.mx/api/health',
    interval: 60, // Check every 60 seconds (1 minute)
    timeout: 10000, // 10 second timeout
    alertChannels: ['email', 'slack'],
    retries: 2, // Retry 2 times before alerting
    httpMethod: 'GET',
    expectedStatusCode: 200,
  },
  
  // Main Website Monitor
  {
    name: 'Doctor.mx Homepage',
    url: 'https://doctor.mx',
    interval: 300, // Check every 300 seconds (5 minutes)
    timeout: 10000,
    alertChannels: ['email', 'slack'],
    retries: 2,
    httpMethod: 'GET',
    expectedStatusCode: 200,
  },
  
  // Critical API Endpoints
  {
    name: 'Doctor.mx Auth API',
    url: 'https://doctor.mx/api/auth/session',
    interval: 300, // 5 minutes
    timeout: 5000,
    alertChannels: ['email', 'slack'],
    retries: 3,
    httpMethod: 'GET',
    expectedStatusCode: 200,
  },
  
  // AI Service Health
  {
    name: 'Doctor.mx AI Health',
    url: 'https://doctor.mx/api/health',
    interval: 120, // 2 minutes
    timeout: 15000, // AI checks can take longer
    alertChannels: ['email', 'slack'],
    retries: 2,
    httpMethod: 'GET',
    keyword: '"ai":{"status":"ok"', // Check AI service specifically
    expectedStatusCode: 200,
  },
];

/**
 * Status Page Configuration
 * For integrating with status page services like StatusPage.io, Cachet, etc.
 */
export const statusPageConfig = {
  // Status page URL to display to users
  publicUrl: 'https://status.doctor.mx',
  
  // Components to display on status page
  components: [
    { id: 'api', name: 'API', description: 'Core API services' },
    { id: 'website', name: 'Website', description: 'Main website and patient portal' },
    { id: 'database', name: 'Database', description: 'Patient data and records' },
    { id: 'ai', name: 'AI Services', description: 'Medical AI consultation' },
    { id: 'payments', name: 'Payments', description: 'Stripe payment processing' },
    { id: 'notifications', name: 'Notifications', description: 'WhatsApp and email notifications' },
  ],
  
  // Incident communication settings
  incidentCommunication: {
    emailSubscribers: true,
    slackNotifications: true,
    twitterUpdates: false,
  },
};

/**
 * Escalation Policy Configuration
 * Defines how alerts escalate if not acknowledged
 */
export const escalationPolicy = {
  // Initial alert
  level1: {
    channels: ['email'],
    delayMinutes: 0,
  },
  // Escalate to Slack after 5 minutes
  level2: {
    channels: ['email', 'slack'],
    delayMinutes: 5,
  },
  // Escalate to on-call after 15 minutes
  level3: {
    channels: ['email', 'slack', 'webhook'],
    delayMinutes: 15,
  },
};

/**
 * Maintenance Windows Configuration
 * Define scheduled maintenance to suppress alerts
 */
export const maintenanceWindows = [
  {
    name: 'Weekly Maintenance',
    dayOfWeek: 0, // Sunday
    startHour: 2, // 2:00 AM
    durationHours: 2,
    timezone: 'America/Mexico_City',
  },
];

/**
 * Get monitor by name
 * @param {string} name - Monitor name
 * @returns {MonitorConfig|undefined}
 */
export function getMonitor(name) {
  return monitors.find(m => m.name === name);
}

/**
 * Get monitors by alert channel type
 * @param {string} channelType - Alert channel type
 * @returns {MonitorConfig[]}
 */
export function getMonitorsByChannel(channelType) {
  return monitors.filter(m => m.alertChannels.includes(channelType));
}

/**
 * Validate monitor configuration
 * @param {MonitorConfig} config - Monitor config to validate
 * @returns {string[]} - Array of validation errors (empty if valid)
 */
export function validateMonitor(config) {
  const errors = [];
  
  if (!config.name || config.name.length < 3) {
    errors.push('Name must be at least 3 characters');
  }
  
  if (!config.url || !config.url.startsWith('http')) {
    errors.push('Valid URL starting with http:// or https:// is required');
  }
  
  if (!config.interval || config.interval < 60) {
    errors.push('Interval must be at least 60 seconds');
  }
  
  if (!config.timeout || config.timeout < 1000) {
    errors.push('Timeout must be at least 1000ms');
  }
  
  if (!config.alertChannels || config.alertChannels.length === 0) {
    errors.push('At least one alert channel is required');
  }
  
  return errors;
}

/**
 * Export configuration for UptimeRobot API
 * @returns {Object} UptimeRobot-formatted configuration
 */
export function toUptimeRobotConfig() {
  return {
    api_key: process.env.UPTIMEROBOT_API_KEY,
    monitors: monitors.map(m => ({
      friendly_name: m.name,
      url: m.url,
      type: 1, // HTTP(s)
      interval: m.interval,
      timeout: m.timeout / 1000, // Convert to seconds
      alert_contacts: m.alertChannels.map(ch => {
        if (ch === 'email') return process.env.UPTIMEROBOT_EMAIL_ALERT_ID;
        if (ch === 'slack') return process.env.UPTIMEROBOT_SLACK_ALERT_ID;
        return null;
      }).filter(Boolean).join('-'),
    })),
  };
}

/**
 * Export configuration for Pingdom API
 * @returns {Object} Pingdom-formatted configuration
 */
export function toPingdomConfig() {
  return {
    monitors: monitors.map(m => ({
      name: m.name,
      host: new URL(m.url).hostname,
      type: 'http',
      encryption: m.url.startsWith('https'),
      url: new URL(m.url).pathname,
      resolution: Math.ceil(m.interval / 60), // Convert to minutes
      sendtoemail: m.alertChannels.includes('email'),
      sendtosms: m.alertChannels.includes('sms'),
    })),
  };
}

export default {
  alertChannels,
  monitors,
  statusPageConfig,
  escalationPolicy,
  maintenanceWindows,
  getMonitor,
  getMonitorsByChannel,
  validateMonitor,
  toUptimeRobotConfig,
  toPingdomConfig,
};
