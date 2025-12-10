type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  eventType?: string;
  tenantId?: string;
  subscriptionId?: string;
  customerId?: string;
  userId?: string;
  [key: string]: any;
}

export function log(level: LogLevel, message: string, context?: LogContext) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context,
  };

  // En desarrollo, formato legible
  if (process.env.NODE_ENV === 'development') {
    const emoji = {
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
      debug: '🐛',
    };
    console[level === 'debug' ? 'log' : level](
      `${emoji[level]} [${level.toUpperCase()}] ${message}`,
      context || ''
    );
  } else {
    // En producción, JSON estructurado para Vercel Logs o servicios externos
    console.log(JSON.stringify(logEntry));
  }
}

// Helper functions para logging común
export const logger = {
  info: (message: string, context?: LogContext) => log('info', message, context),
  warn: (message: string, context?: LogContext) => log('warn', message, context),
  error: (message: string, context?: LogContext) => log('error', message, context),
  debug: (message: string, context?: LogContext) => log('debug', message, context),

  // Webhook-specific logging
  webhook: {
    received: (eventType: string, eventId: string) =>
      log('info', 'Webhook received', { eventType, eventId }),

    duplicate: (eventId: string) =>
      log('info', 'Duplicate webhook detected', { eventId }),

    processed: (eventType: string, eventId: string, tenantId?: string) =>
      log('info', 'Webhook processed successfully', { eventType, eventId, tenantId }),

    failed: (eventType: string, eventId: string, error: string) =>
      log('error', 'Webhook processing failed', { eventType, eventId, error }),

    tenantNotFound: (subscriptionId: string, customerId: string) =>
      log('error', 'Tenant not found for subscription', { subscriptionId, customerId }),
  },
};
