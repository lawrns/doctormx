// Structured Logger
// JSON-formatted logs with context, correlation IDs, and log levels

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogContext {
  userId?: string
  requestId?: string
  traceId?: string
  spanId?: string
  feature?: string
  [key: string]: unknown
}

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: LogContext
  error?: {
    name: string
    message: string
    stack?: string
  }
  duration_ms?: number
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

const MIN_LOG_LEVEL = (process.env.LOG_LEVEL || 'info') as LogLevel

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[MIN_LOG_LEVEL]
}

function formatEntry(entry: LogEntry): string {
  if (process.env.NODE_ENV === 'development') {
    // Pretty print in development
    const levelColors: Record<LogLevel, string> = {
      debug: '\x1b[36m', // cyan
      info: '\x1b[32m',  // green
      warn: '\x1b[33m',  // yellow
      error: '\x1b[31m', // red
    }
    const reset = '\x1b[0m'
    const color = levelColors[entry.level]
    
    let output = `${color}[${entry.level.toUpperCase()}]${reset} ${entry.message}`
    if (entry.context) {
      output += ` ${JSON.stringify(entry.context)}`
    }
    if (entry.error) {
      output += `\n  Error: ${entry.error.message}`
      if (entry.error.stack) {
        output += `\n  ${entry.error.stack}`
      }
    }
    return output
  }
  
  // JSON in production for log aggregation
  return JSON.stringify(entry)
}

function log(level: LogLevel, message: string, context?: LogContext, error?: Error) {
  if (!shouldLog(level)) return
  
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    context,
  }
  
  if (error) {
    entry.error = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    }
  }
  
  const formatted = formatEntry(entry)
  
  switch (level) {
    case 'error':
      console.error(formatted)
      break
    case 'warn':
      console.warn(formatted)
      break
    default:
      console.log(formatted)
  }
}

export const logger = {
  debug: (message: string, context?: LogContext) => log('debug', message, context),
  info: (message: string, context?: LogContext) => log('info', message, context),
  warn: (message: string, context?: LogContext, error?: Error) => log('warn', message, context, error),
  error: (message: string, context?: LogContext, error?: Error) => log('error', message, context, error),
  
  // Create a child logger with preset context
  child: (defaultContext: LogContext) => ({
    debug: (message: string, context?: LogContext) => 
      log('debug', message, { ...defaultContext, ...context }),
    info: (message: string, context?: LogContext) => 
      log('info', message, { ...defaultContext, ...context }),
    warn: (message: string, context?: LogContext, error?: Error) => 
      log('warn', message, { ...defaultContext, ...context }, error),
    error: (message: string, context?: LogContext, error?: Error) => 
      log('error', message, { ...defaultContext, ...context }, error),
  }),
  
  // Time an async operation
  async time<T>(
    name: string,
    fn: () => Promise<T>,
    context?: LogContext
  ): Promise<T> {
    const start = performance.now()
    try {
      const result = await fn()
      const duration = Math.round(performance.now() - start)
      log('info', `${name} completed`, { ...context, duration_ms: duration })
      return result
    } catch (error) {
      const duration = Math.round(performance.now() - start)
      log('error', `${name} failed`, { ...context, duration_ms: duration }, error as Error)
      throw error
    }
  },
}

export default logger
