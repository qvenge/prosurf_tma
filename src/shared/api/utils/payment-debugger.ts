/**
 * Payment Debugger Utility
 * Captures comprehensive payment context and provides diagnostic tools
 */

import { paymentLogger } from '@/shared/lib/payment-logger';
import type { Payment } from '../types';

export interface PaymentContext {
  // Payment details
  paymentId?: string;
  bookingId?: string;
  amount?: number;
  currency?: string;
  provider?: string;
  status?: string;

  // Session/Event details
  sessionId?: string;
  eventId?: string;
  eventTitle?: string;

  // User details
  userId?: string;
  userEmail?: string;

  // Timing
  attemptStartedAt?: string;
  attemptEndedAt?: string;
  duration?: number;

  // Results
  success?: boolean;
  invoiceStatus?: 'paid' | 'cancelled' | 'failed' | 'pending' | string;
  error?: {
    code?: string;
    message: string;
    stack?: string;
    details?: unknown;
  };

  // Environment
  environment?: {
    userAgent?: string;
    viewport?: string;
    isTelegram?: boolean;
    telegramVersion?: string;
  };

  // Additional metadata
  metadata?: Record<string, unknown>;
}

export interface PaymentAttempt extends PaymentContext {
  attemptId: string;
  attemptNumber: number;
}

class PaymentDebugger {
  private attempts: PaymentAttempt[] = [];
  private currentContext: Partial<PaymentContext> = {};
  private readonly MAX_ATTEMPTS = 20;
  private attemptCounter = 0;

  /**
   * Start a new payment attempt
   */
  startAttempt(context: Partial<PaymentContext> = {}): string {
    this.attemptCounter++;
    const attemptId = `attempt-${Date.now()}-${this.attemptCounter}`;

    const attempt: PaymentAttempt = {
      attemptId,
      attemptNumber: this.attemptCounter,
      attemptStartedAt: new Date().toISOString(),
      environment: this.captureEnvironment(),
      ...context,
    };

    this.attempts.push(attempt);
    this.currentContext = { ...context, attemptStartedAt: attempt.attemptStartedAt };

    // Trim to max size
    if (this.attempts.length > this.MAX_ATTEMPTS) {
      this.attempts = this.attempts.slice(-this.MAX_ATTEMPTS);
    }

    paymentLogger.log({
      eventType: 'payment_initiated',
      paymentId: context.paymentId,
      bookingId: context.bookingId,
      amount: context.amount,
      currency: context.currency,
      provider: context.provider,
      metadata: { attemptId, attemptNumber: this.attemptCounter },
    });

    return attemptId;
  }

  /**
   * Update current attempt context
   */
  updateContext(updates: Partial<PaymentContext>): void {
    this.currentContext = { ...this.currentContext, ...updates };

    const currentAttempt = this.attempts[this.attempts.length - 1];
    if (currentAttempt) {
      Object.assign(currentAttempt, updates);
    }
  }

  /**
   * End current attempt
   */
  endAttempt(result: {
    success: boolean;
    invoiceStatus?: string;
    error?: string | Error;
  }): void {
    const currentAttempt = this.attempts[this.attempts.length - 1];
    if (!currentAttempt) return;

    currentAttempt.attemptEndedAt = new Date().toISOString();
    currentAttempt.success = result.success;
    currentAttempt.invoiceStatus = result.invoiceStatus;

    if (currentAttempt.attemptStartedAt) {
      const start = new Date(currentAttempt.attemptStartedAt).getTime();
      const end = new Date(currentAttempt.attemptEndedAt).getTime();
      currentAttempt.duration = end - start;
    }

    if (result.error) {
      currentAttempt.error = this.formatError(result.error);

      paymentLogger.logPaymentFailed({
        paymentId: currentAttempt.paymentId,
        bookingId: currentAttempt.bookingId,
        error: result.error,
        metadata: {
          attemptId: currentAttempt.attemptId,
          duration: currentAttempt.duration,
        },
      });
    } else if (result.success) {
      paymentLogger.logPaymentCompleted({
        paymentId: currentAttempt.paymentId!,
        bookingId: currentAttempt.bookingId!,
        amount: currentAttempt.amount!,
        currency: currentAttempt.currency!,
      });
    } else if (result.invoiceStatus === 'cancelled') {
      paymentLogger.logPaymentCancelled({
        paymentId: currentAttempt.paymentId,
        bookingId: currentAttempt.bookingId,
        reason: 'User cancelled invoice',
      });
    }
  }

  /**
   * Log invoice status change
   */
  logInvoiceStatus(status: string, metadata?: Record<string, unknown>): void {
    this.updateContext({ invoiceStatus: status });

    const currentAttempt = this.attempts[this.attempts.length - 1];
    paymentLogger.logInvoiceStatus({
      paymentId: currentAttempt?.paymentId || 'unknown',
      status,
      metadata: {
        attemptId: currentAttempt?.attemptId,
        ...metadata,
      },
    });
  }

  /**
   * Log payment API response
   */
  logPaymentResponse(payment: Payment): void {
    this.updateContext({
      paymentId: payment.id,
      amount: payment.amount.amountMinor,
      currency: payment.amount.currency,
      provider: payment.provider,
      status: payment.status,
    });

    paymentLogger.logPaymentApiResponse({
      paymentId: payment.id,
      bookingId: payment.bookingId,
      status: payment.status,
      amount: payment.amount.amountMinor,
      currency: payment.amount.currency,
      metadata: {
        provider: payment.provider,
        nextAction: payment.nextAction?.type,
      },
    });
  }

  /**
   * Get current attempt
   */
  getCurrentAttempt(): PaymentAttempt | null {
    return this.attempts[this.attempts.length - 1] || null;
  }

  /**
   * Get all attempts
   */
  getAllAttempts(): PaymentAttempt[] {
    return [...this.attempts];
  }

  /**
   * Get attempts for a specific payment
   */
  getPaymentAttempts(paymentId: string): PaymentAttempt[] {
    return this.attempts.filter((attempt) => attempt.paymentId === paymentId);
  }

  /**
   * Generate diagnostic report
   */
  generateDiagnosticReport(): string {
    const currentAttempt = this.getCurrentAttempt();
    if (!currentAttempt) {
      return 'No payment attempts recorded';
    }

    const report = {
      summary: {
        totalAttempts: this.attempts.length,
        currentAttemptNumber: currentAttempt.attemptNumber,
        lastAttemptStatus: currentAttempt.success ? 'SUCCESS' : 'FAILED',
      },
      currentAttempt: this.formatAttemptForReport(currentAttempt),
      recentAttempts: this.attempts.slice(-5).map((attempt) =>
        this.formatAttemptForReport(attempt)
      ),
      environment: currentAttempt.environment,
      paymentLogs: paymentLogger.getRecentLogs(20),
    };

    return JSON.stringify(report, null, 2);
  }

  /**
   * Export diagnostic report to clipboard
   */
  async copyDiagnosticToClipboard(): Promise<boolean> {
    try {
      const report = this.generateDiagnosticReport();
      await navigator.clipboard.writeText(report);
      console.log('Diagnostic report copied to clipboard');
      return true;
    } catch (error) {
      console.error('Failed to copy diagnostic report:', error);
      return false;
    }
  }

  /**
   * Download diagnostic report as file
   */
  downloadDiagnosticReport(filename?: string): void {
    const report = this.generateDiagnosticReport();
    const blob = new Blob([report], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `payment-diagnostic-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Get user-friendly error summary
   */
  getErrorSummary(): {
    title: string;
    description: string;
    technicalDetails?: string;
    suggestedAction?: string;
  } | null {
    const currentAttempt = this.getCurrentAttempt();
    if (!currentAttempt?.error) return null;

    const errorCode = currentAttempt.error.code;
    const errorMessage = currentAttempt.error.message;
    const invoiceStatus = currentAttempt.invoiceStatus;

    // Determine error category and provide guidance
    if (invoiceStatus === 'failed') {
      return {
        title: 'Платеж отклонён',
        description: 'Платёж был отклонён платёжной системой.',
        technicalDetails: `Status: ${invoiceStatus}, Provider: ${currentAttempt.provider || 'unknown'}`,
        suggestedAction:
          'Проверьте, что у вас настроен провайдер платежей в BotFather. Для оплаты в рублях используйте YooKassa или CloudPayments.',
      };
    }

    if (invoiceStatus === 'cancelled') {
      return {
        title: 'Платеж отменён',
        description: 'Вы отменили платёж.',
        suggestedAction: 'Попробуйте снова, если это было сделано случайно.',
      };
    }

    if (errorCode === 'PROVIDER_UNAVAILABLE') {
      return {
        title: 'Ошибка конфигурации',
        description: 'Платёжная система временно недоступна.',
        technicalDetails: errorMessage,
        suggestedAction: 'Свяжитесь с поддержкой для решения проблемы.',
      };
    }

    if (errorCode === 'INVALID_CURRENCY') {
      return {
        title: 'Неподдерживаемая валюта',
        description: `Валюта ${currentAttempt.currency} не поддерживается выбранным провайдером.`,
        technicalDetails: `Currency: ${currentAttempt.currency}, Provider: ${currentAttempt.provider}`,
        suggestedAction: 'Попробуйте другой способ оплаты.',
      };
    }

    return {
      title: 'Ошибка платежа',
      description: errorMessage,
      technicalDetails: errorCode || 'Unknown error',
      suggestedAction: 'Попробуйте снова или свяжитесь с поддержкой.',
    };
  }

  /**
   * Clear all attempts
   */
  clearAttempts(): void {
    this.attempts = [];
    this.currentContext = {};
    this.attemptCounter = 0;
  }

  /**
   * Capture environment information
   */
  private captureEnvironment(): PaymentContext['environment'] {
    if (typeof window === 'undefined') return {};

    return {
      userAgent: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      isTelegram: Boolean(window.Telegram?.WebApp),
      telegramVersion: window.Telegram?.WebApp?.version,
    };
  }

  /**
   * Format error for storage
   */
  private formatError(error: string | Error): PaymentContext['error'] {
    if (typeof error === 'string') {
      return { message: error };
    }

    return {
      message: error.message,
      stack: error.stack,
      code: (error as unknown as { code?: string }).code,
      details: (error as unknown as { details?: unknown }).details,
    };
  }

  /**
   * Format attempt for report
   */
  private formatAttemptForReport(attempt: PaymentAttempt): Record<string, unknown> {
    return {
      attemptId: attempt.attemptId,
      attemptNumber: attempt.attemptNumber,
      timestamp: attempt.attemptStartedAt,
      duration: attempt.duration ? `${attempt.duration}ms` : 'N/A',
      success: attempt.success ?? 'in_progress',
      paymentId: attempt.paymentId || 'N/A',
      bookingId: attempt.bookingId || 'N/A',
      amount: attempt.amount ? `${attempt.amount / 100} ${attempt.currency}` : 'N/A',
      provider: attempt.provider || 'N/A',
      invoiceStatus: attempt.invoiceStatus || 'N/A',
      error: attempt.error
        ? {
            code: attempt.error.code,
            message: attempt.error.message,
          }
        : null,
    };
  }
}

// Export singleton instance
export const paymentDebugger = new PaymentDebugger();

// Expose to window in development mode for debugging
if (import.meta.env.MODE === 'development' && typeof window !== 'undefined') {
  (window as unknown as { paymentDebugger: PaymentDebugger }).paymentDebugger = paymentDebugger;
}