/**
 * Centralized payment event logging utility
 * Provides structured logging for payment flows with optional persistence
 */

export type PaymentEventType =
  | 'payment_initiated'
  | 'booking_created'
  | 'payment_api_called'
  | 'payment_api_response'
  | 'invoice_opening'
  | 'invoice_opened'
  | 'invoice_status_received'
  | 'payment_completed'
  | 'payment_failed'
  | 'payment_cancelled'
  | 'error_occurred';

export interface PaymentLogEntry {
  timestamp: string;
  eventType: PaymentEventType;
  sessionId?: string;
  bookingId?: string;
  paymentId?: string;
  amount?: number;
  currency?: string;
  provider?: string;
  status?: string;
  error?: {
    code?: string;
    message: string;
    stack?: string;
  };
  metadata?: Record<string, unknown>;
}

class PaymentLogger {
  private logs: PaymentLogEntry[] = [];
  private readonly MAX_LOGS = 50;
  private readonly STORAGE_KEY = 'payment_logs';
  private persistenceEnabled = false;

  constructor() {
    this.loadLogsFromStorage();
  }

  /**
   * Enable/disable log persistence to localStorage
   */
  setPersistence(enabled: boolean): void {
    this.persistenceEnabled = enabled;
    if (!enabled) {
      this.clearStorage();
    }
  }

  /**
   * Log a payment event
   */
  log(entry: Omit<PaymentLogEntry, 'timestamp'>): void {
    const logEntry: PaymentLogEntry = {
      ...entry,
      timestamp: new Date().toISOString(),
    };

    // Add to in-memory logs
    this.logs.push(logEntry);

    // Trim to max size
    if (this.logs.length > this.MAX_LOGS) {
      this.logs = this.logs.slice(-this.MAX_LOGS);
    }

    // Persist if enabled
    if (this.persistenceEnabled) {
      this.saveLogsToStorage();
    }

    // Console logging with formatting
    this.logToConsole(logEntry);
  }

  /**
   * Log payment initiation
   */
  logPaymentInitiated(data: {
    sessionId?: string;
    amount: number;
    currency: string;
    provider: string;
  }): void {
    this.log({
      eventType: 'payment_initiated',
      ...data,
    });
  }

  /**
   * Log booking creation
   */
  logBookingCreated(data: {
    sessionId: string;
    bookingId: string;
    amount: number;
    currency: string;
  }): void {
    this.log({
      eventType: 'booking_created',
      ...data,
    });
  }

  /**
   * Log payment API call
   */
  logPaymentApiCalled(data: {
    bookingId?: string; // Optional for season ticket payments
    amount: number;
    currency: string;
    provider: string;
    metadata?: Record<string, unknown>;
  }): void {
    this.log({
      eventType: 'payment_api_called',
      ...data,
    });
  }

  /**
   * Log payment API response
   */
  logPaymentApiResponse(data: {
    paymentId: string;
    bookingId?: string; // Optional for season ticket payments
    status: string;
    amount: number;
    currency: string;
    metadata?: Record<string, unknown>;
  }): void {
    this.log({
      eventType: 'payment_api_response',
      ...data,
    });
  }

  /**
   * Log invoice opening
   */
  logInvoiceOpening(data: {
    paymentId: string;
    bookingId?: string;
    slug: string;
  }): void {
    this.log({
      eventType: 'invoice_opening',
      ...data,
      metadata: { slug: data.slug },
    });
  }

  /**
   * Log invoice status received from Telegram
   */
  logInvoiceStatus(data: {
    paymentId: string;
    status: 'paid' | 'cancelled' | 'failed' | 'pending' | string;
    metadata?: Record<string, unknown>;
  }): void {
    this.log({
      eventType: 'invoice_status_received',
      ...data,
    });
  }

  /**
   * Log payment completion
   */
  logPaymentCompleted(data: {
    paymentId: string;
    bookingId?: string; // Optional for season ticket payments
    amount: number;
    currency: string;
  }): void {
    this.log({
      eventType: 'payment_completed',
      ...data,
    });
  }

  /**
   * Log payment failure
   */
  logPaymentFailed(data: {
    paymentId?: string;
    bookingId?: string;
    error: string | Error;
    metadata?: Record<string, unknown>;
  }): void {
    const errorData = this.formatError(data.error);
    this.log({
      eventType: 'payment_failed',
      paymentId: data.paymentId,
      bookingId: data.bookingId,
      error: errorData,
      metadata: data.metadata,
    });
  }

  /**
   * Log payment cancellation
   */
  logPaymentCancelled(data: {
    paymentId?: string;
    bookingId?: string;
    reason?: string;
  }): void {
    this.log({
      eventType: 'payment_cancelled',
      ...data,
      metadata: { reason: data.reason },
    });
  }

  /**
   * Log error
   */
  logError(data: {
    error: string | Error;
    context?: string;
    paymentId?: string;
    bookingId?: string;
    metadata?: Record<string, unknown>;
  }): void {
    const errorData = this.formatError(data.error);
    this.log({
      eventType: 'error_occurred',
      paymentId: data.paymentId,
      bookingId: data.bookingId,
      error: errorData,
      metadata: { context: data.context, ...data.metadata },
    });
  }

  /**
   * Get all logs
   */
  getLogs(): PaymentLogEntry[] {
    return [...this.logs];
  }

  /**
   * Get logs for a specific payment
   */
  getPaymentLogs(paymentId: string): PaymentLogEntry[] {
    return this.logs.filter((log) => log.paymentId === paymentId);
  }

  /**
   * Get logs for a specific booking
   */
  getBookingLogs(bookingId: string): PaymentLogEntry[] {
    return this.logs.filter((log) => log.bookingId === bookingId);
  }

  /**
   * Get recent logs
   */
  getRecentLogs(count: number = 10): PaymentLogEntry[] {
    return this.logs.slice(-count);
  }

  /**
   * Export logs as JSON string
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Export logs for a specific payment
   */
  exportPaymentLogs(paymentId: string): string {
    const paymentLogs = this.getPaymentLogs(paymentId);
    return JSON.stringify(paymentLogs, null, 2);
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
    this.clearStorage();
  }

  /**
   * Format error object
   */
  private formatError(error: string | Error): {
    message: string;
    stack?: string;
    code?: string;
  } {
    if (typeof error === 'string') {
      return { message: error };
    }

    return {
      message: error.message,
      stack: error.stack,
      code: (error as unknown as { code?: string }).code,
    };
  }

  /**
   * Log to console with formatting
   */
  private logToConsole(entry: PaymentLogEntry): void {
    const timestamp = new Date(entry.timestamp).toLocaleTimeString();
    const prefix = `[Payment ${timestamp}]`;

    const style = this.getConsoleStyle(entry.eventType);

    const details = {
      ...entry,
      timestamp: undefined, // Remove from details as it's in prefix
      eventType: undefined, // Remove from details as it's in the message
    };

    // Remove undefined values
    Object.keys(details).forEach((key) => {
      if (details[key as keyof typeof details] === undefined) {
        delete details[key as keyof typeof details];
      }
    });

    if (entry.eventType === 'payment_failed' || entry.eventType === 'error_occurred') {
      console.error(`${prefix} ${entry.eventType}`, details);
    } else if (entry.eventType === 'payment_completed') {
      console.log(`%c${prefix} ${entry.eventType}`, style, details);
    } else {
      console.log(`${prefix} ${entry.eventType}`, details);
    }
  }

  /**
   * Get console style based on event type
   */
  private getConsoleStyle(eventType: PaymentEventType): string {
    switch (eventType) {
      case 'payment_completed':
        return 'color: #22c55e; font-weight: bold';
      case 'payment_failed':
      case 'error_occurred':
        return 'color: #ef4444; font-weight: bold';
      case 'payment_cancelled':
        return 'color: #f59e0b; font-weight: bold';
      default:
        return 'color: #3b82f6';
    }
  }

  /**
   * Load logs from localStorage
   */
  private loadLogsFromStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load payment logs from storage:', error);
    }
  }

  /**
   * Save logs to localStorage
   */
  private saveLogsToStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.logs));
    } catch (error) {
      console.error('Failed to save payment logs to storage:', error);
    }
  }

  /**
   * Clear logs from localStorage
   */
  private clearStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear payment logs from storage:', error);
    }
  }
}

// Export singleton instance
export const paymentLogger = new PaymentLogger();

// Enable persistence in development mode
if (import.meta.env.MODE === 'development') {
  paymentLogger.setPersistence(true);
}