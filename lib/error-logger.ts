
// Comprehensive error logging utility for CDM Suite
import { prisma } from '@/lib/db';

export interface ErrorLog {
  level: 'error' | 'warning' | 'info';
  message: string;
  stack?: string;
  context?: any;
  userId?: string;
  endpoint?: string;
  userEmail?: string;
}

// Error codes for common issues
export const ERROR_CODES = {
  // Authentication errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  
  // Permission errors
  FORBIDDEN: 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  
  // Validation errors
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  
  // Database errors
  DATABASE_ERROR: 'DATABASE_ERROR',
  RECORD_NOT_FOUND: 'RECORD_NOT_FOUND',
  
  // Business logic errors
  SEQUENCE_NO_STEPS: 'SEQUENCE_NO_STEPS',
  LEAD_ALREADY_IN_SEQUENCE: 'LEAD_ALREADY_IN_SEQUENCE',
  INVALID_STATUS_TRANSITION: 'INVALID_STATUS_TRANSITION',
} as const;

/**
 * Log an error to the database
 */
export async function logError(log: ErrorLog): Promise<void> {
  try {
    // For now, just log to console
    // In production, you'd want to save to a database table or external service
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] [${log.level.toUpperCase()}] ${log.endpoint || 'Unknown'}:`, {
      message: log.message,
      userId: log.userId,
      userEmail: log.userEmail,
      stack: log.stack,
      context: log.context,
    });
    
    // TODO: Implement database logging
    // await prisma.errorLog.create({
    //   data: {
    //     level: log.level,
    //     message: log.message,
    //     stack: log.stack,
    //     context: log.context ? JSON.stringify(log.context) : null,
    //     userId: log.userId,
    //     endpoint: log.endpoint,
    //     userEmail: log.userEmail,
    //   },
    // });
  } catch (error) {
    // Fallback to console if logging fails
    console.error('Failed to log error:', error);
    console.error('Original error:', log);
  }
}

/**
 * Create an error handler for a specific endpoint
 */
export function createErrorHandler(endpoint: string) {
  return async (error: any, userId?: string, userEmail?: string) => {
    await logError({
      level: 'error',
      message: error.message || 'Unknown error',
      stack: error.stack,
      context: {
        name: error.name,
        code: error.code,
      },
      userId,
      userEmail,
      endpoint,
    });
  };
}

/**
 * Create a standardized API error response
 */
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
  
  toJSON() {
    return {
      error: this.code || 'ERROR',
      message: this.message,
      details: this.details,
    };
  }
}

/**
 * Wrap an API handler with error logging
 */
export function withErrorLogging<T extends (...args: any[]) => Promise<any>>(
  handler: T,
  endpoint: string
): T {
  return (async (...args: any[]) => {
    try {
      return await handler(...args);
    } catch (error: any) {
      const errorLogger = createErrorHandler(endpoint);
      await errorLogger(error);
      throw error;
    }
  }) as T;
}

