/**
 * Sentry Utilities for DoctorMX
 *
 * Helper functions for error tracking, performance monitoring, and structured logging.
 */

import * as Sentry from "@sentry/react";

/**
 * Capture an exception with additional context
 */
export function captureException(error: Error, context?: Record<string, any>) {
  Sentry.withScope((scope) => {
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setContext(key, value);
      });
    }
    Sentry.captureException(error);
  });
}

/**
 * Capture a message event
 */
export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = "info",
  context?: Record<string, any>
) {
  Sentry.withScope((scope) => {
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setContext(key, value);
      });
    }
    Sentry.captureMessage(message, level);
  });
}

/**
 * Set user context for tracking
 */
export function setUser(user: {
  id: string;
  email?: string;
  username?: string;
  [key: string]: string | number | boolean | undefined | null;
}) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
  });
}

/**
 * Clear user context
 */
export function clearUser() {
  Sentry.setUser(null);
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(
  message: string,
  category?: string,
  level?: Sentry.SeverityLevel
) {
  Sentry.addBreadcrumb({
    message,
    category: category ?? "custom",
    level: level ?? "info",
  });
}

/**
 * Structured logger using Sentry logger
 */
export const logger = {
  trace: (message: string, context?: Record<string, any>) => {
    Sentry.logger?.trace(message, context);
  },
  debug: (message: string, context?: Record<string, any>) => {
    Sentry.logger?.debug(message, context);
  },
  info: (message: string, context?: Record<string, any>) => {
    Sentry.logger?.info(message, context);
  },
  warn: (message: string, context?: Record<string, any>) => {
    Sentry.logger?.warn(message, context);
  },
  error: (message: string, context?: Record<string, unknown>) => {
    Sentry.logger?.error(message, context);
  },
  fatal: (message: string, context?: Record<string, unknown>) => {
    Sentry.logger?.fatal(message, context);
  },
  fmt: (strings: TemplateStringsArray, ...values: unknown[]) => {
    return Sentry.logger?.fmt?.(strings, ...values);
  },
};

/**
 * Performance measurement for user interactions
 */
export function measureUserInteraction(
  action: string,
  callback: () => void | Promise<void>
): void {
  Sentry.startSpan(
    {
      op: "ui.action",
      name: `User Action: ${action}`,
    },
    async (span) => {
      const startTime = Date.now();
      try {
        await callback();
        const duration = Date.now() - startTime;
        span?.setAttribute("ui.interaction.duration_ms", duration);
        span?.setAttribute("ui.interaction.action", action);
      } catch (error) {
        span?.setAttribute("error", true);
        captureException(error as Error, { action });
        throw error;
      }
    }
  );
}

/**
 * Add performance breadcrumb
 */
export function addPerformanceBreadcrumb(name: string, value: number, unit: string = "ms") {
  Sentry.addBreadcrumb({
    category: "performance",
    message: `${name}: ${value}${unit}`,
    level: "info",
    data: { name, value, unit },
  });
}
