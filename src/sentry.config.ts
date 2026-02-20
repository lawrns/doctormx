// Sentry configuration for DoctorMX
import * as Sentry from "@sentry/react";
import { consoleLoggingIntegration } from "@sentry/react";

// Get environment from process.env (Next.js standard)
const environment = process.env.NODE_ENV ?? "production";
const isDev = environment === "development";

Sentry.init({
  dsn: "https://c7f3941c8e0b4b3717aa1b313e3da0d3@o4509302601220096.ingest.us.sentry.io/4510767422570496",
  environment,

  // Enable logging
  enableLogs: true,

  // Performance & integrations
  integrations: [
    // Browser tracing for performance monitoring
    Sentry.browserTracingIntegration(),
    // Session replay for debugging
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
    // Console logging integration - captures console.log, warn, error
    consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
  ],

  // Set traces sample rate
  tracesSampleRate: isDev ? 1.0 : 0.1,

  // Session replay sampling
  replaysSessionSampleRate: 0.01, // 1% of normal sessions
  replaysOnErrorSampleRate: 1.0, // 100% of error sessions

  // Filter sensitive data and events
  beforeSend(event, hint) {
    // Don't send events in development
    if (isDev) {
      return null;
    }

    // Filter out sensitive headers
    if (event.request?.headers) {
      delete event.request.headers['authorization'];
      delete event.request.headers['cookie'];
      delete event.request.headers['x-api-key'];
    }

    // Sanitize user data
    if (event.user) {
      // Keep only id and email for PII compliance
      const safeUser: { id?: string; email?: string } = {};
      if (event.user.id) safeUser.id = String(event.user.id);
      if (event.user.email) safeUser.email = String(event.user.email);
      event.user = safeUser;
    }

    return event;
  },

  // Before sending transaction (performance)
  beforeSendTransaction(event) {
    // Don't send transactions in development
    if (isDev) {
      return null;
    }
    return event;
  },

  // Custom context
  initialScope: {
    tags: {
      project: 'doctormx',
      platform: 'web',
      framework: 'react',
    },
  },

  // Release version
  release: process.env.npm_package_version ?? '0.1.0',

  // Debug mode (development only)
  debug: isDev,
});

// Export logger for structured logging
export const { logger } = Sentry;
