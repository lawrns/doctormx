// Observability Module Exports
// Structured logging, metrics, request logging, and error tracking

export { logger } from './logger'
export type { LogLevel, LogContext } from './logger'

export { metrics, startMetricsFlush, stopMetricsFlush, initMetrics } from './metrics'
export type { MetricType, MetricLabels } from './metrics'

export {
  logRequest,
  logResponse,
  logMiddlewareRequest,
  withRequestLogging,
  createRequestLogger,
  logApiError,
  createEdgeLogger,
  generateRequestId,
  getCurrentRequestContext,
  setRequestContext,
  clearRequestContext,
} from './request-logger'
export type {
  RequestLogData,
  ResponseLogData,
  RequestLoggerConfig,
} from './request-logger'

export {
  withLogging,
  withErrorHandling,
  withPerformanceTracking,
  withApiMiddleware,
  withCors,
  chain,
} from './api-middleware'
export type {
  ApiHandler,
  ErrorResponse,
  MiddlewareConfig,
  CorsConfig,
} from './api-middleware'

