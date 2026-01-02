/**
 * Structured Logging Utility
 * Provides consistent, contextual logging across the application
 */

export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
}

export interface LogContext {
  component?: string;
  action?: string;
  userId?: string;
  entryId?: string;
  insightId?: string;
  [key: string]: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === "development";

  /**
   * Log a debug message (only in development)
   */
  debug(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      this.log(LogLevel.DEBUG, message, context);
    }
  }

  /**
   * Log an info message
   */
  info(message: string, context?: LogContext) {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Log a warning
   */
  warn(message: string, context?: LogContext) {
    this.log(LogLevel.WARN, message, context);
  }

  /**
   * Log an error with full stack trace
   */
  error(message: string, error?: Error | unknown, context?: LogContext) {
    const errorContext = {
      ...context,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
      } : String(error),
    };

    this.log(LogLevel.ERROR, message, errorContext);
  }

  /**
   * Internal logging method with structured output
   */
  private log(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...context,
    };

    // In development: Pretty print
    if (this.isDevelopment) {
      const emoji = this.getLevelEmoji(level);
      const contextStr = context ? ` ${JSON.stringify(context, null, 2)}` : "";
      
      switch (level) {
        case LogLevel.ERROR:
          console.error(`${emoji} [${level.toUpperCase()}] ${message}${contextStr}`);
          break;
        case LogLevel.WARN:
          console.warn(`${emoji} [${level.toUpperCase()}] ${message}${contextStr}`);
          break;
        default:
          console.log(`${emoji} [${level.toUpperCase()}] ${message}${contextStr}`);
      }
    } else {
      // In production: JSON output for log aggregators
      console.log(JSON.stringify(logEntry));
    }
  }

  /**
   * Get emoji for log level (makes dev logs easier to scan)
   */
  private getLevelEmoji(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG:
        return "🔍";
      case LogLevel.INFO:
        return "ℹ️";
      case LogLevel.WARN:
        return "⚠️";
      case LogLevel.ERROR:
        return "❌";
      default:
        return "📝";
    }
  }

  /**
   * Create a child logger with default context
   * Useful for component-specific logging
   */
  child(defaultContext: LogContext): Logger {
    const childLogger = new Logger();
    const originalLog = childLogger.log.bind(childLogger);
    
    childLogger.log = (level: LogLevel, message: string, context?: LogContext) => {
      originalLog(level, message, { ...defaultContext, ...context });
    };

    return childLogger;
  }

  /**
   * Measure execution time of an operation
   */
  async time<T>(
    label: string,
    operation: () => Promise<T>,
    context?: LogContext
  ): Promise<T> {
    const startTime = Date.now();
    this.debug(`${label} - started`, context);

    try {
      const result = await operation();
      const duration = Date.now() - startTime;
      
      this.info(`${label} - completed`, {
        ...context,
        duration: `${duration}ms`,
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.error(`${label} - failed`, error, {
        ...context,
        duration: `${duration}ms`,
      });

      throw error;
    }
  }
}

// Export singleton instance
export const logger = new Logger();

/**
 * Component-specific loggers for better context
 */
export const aiLogger = logger.child({ component: "AI" });
export const dbLogger = logger.child({ component: "Database" });
export const actionLogger = logger.child({ component: "ServerAction" });

