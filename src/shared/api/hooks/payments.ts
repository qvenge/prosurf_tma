import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsClient } from '../clients/payments';
import { bookingsKeys } from './bookings';
import { telegramUtils } from '@/shared/tma';
import type {
  Payment,
  PaymentMethodRequest,
  CompositePaymentMethodRequest,
  RefundRequest,
  IdempotencyKey
} from '../types';

// Query key factory for payments
export const paymentsKeys = {
  all: ['payments'] as const,
  details: () => [...paymentsKeys.all, 'detail'] as const,
  detail: (id: string) => [...paymentsKeys.details(), id] as const,
  refunds: (paymentId: string) => [...paymentsKeys.detail(paymentId), 'refunds'] as const,
} as const;

/**
 * Payments hooks
 */

// Create payment mutation
export const useCreatePayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      bookingId, 
      data, 
      idempotencyKey 
    }: { 
      bookingId: string; 
      data: PaymentMethodRequest | CompositePaymentMethodRequest;
      idempotencyKey: IdempotencyKey;
    }) => paymentsClient.createPayment(bookingId, data, idempotencyKey),
    onSuccess: (newPayment, variables) => {
      // Add payment to cache
      queryClient.setQueryData(paymentsKeys.detail(newPayment.id), newPayment);
      
      // Invalidate booking to reflect payment status
      queryClient.invalidateQueries({ queryKey: bookingsKeys.detail(variables.bookingId) });
    },
    onError: (error) => {
      console.error('Failed to create payment:', error);
    },
  });
};

// Get payment by ID
export const usePayment = (id: string) => {
  return useQuery({
    queryKey: paymentsKeys.detail(id),
    queryFn: () => paymentsClient.getPaymentById(id),
    staleTime: 30 * 1000, // 30 seconds (payment status changes frequently)
  });
};

// Create refund mutation
export const useCreateRefund = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      paymentId, 
      data, 
      idempotencyKey 
    }: { 
      paymentId: string; 
      data?: RefundRequest;
      idempotencyKey?: IdempotencyKey;
    }) => paymentsClient.createRefund(paymentId, idempotencyKey || crypto.randomUUID(), data),
    onSuccess: (_, variables) => {
      // Invalidate payment to show refund status
      queryClient.invalidateQueries({ queryKey: paymentsKeys.detail(variables.paymentId) });
      
      // Invalidate related booking (if payment has booking)
      const payment = queryClient.getQueryData(paymentsKeys.detail(variables.paymentId)) as Payment;
      if (payment?.bookingId) {
        queryClient.invalidateQueries({ queryKey: bookingsKeys.detail(payment.bookingId) });
      }
    },
    onError: (error) => {
      console.error('Failed to create refund:', error);
    },
  });
};

// Hook for payment polling (useful for pending payments)
export const usePaymentPolling = (paymentId: string, enabled: boolean = false) => {
  return useQuery({
    queryKey: paymentsKeys.detail(paymentId),
    queryFn: () => paymentsClient.getPaymentById(paymentId),
    enabled,
    refetchInterval: (query) => {
      // Stop polling if payment is no longer pending
      if (query.state.data?.status !== 'PENDING') {
        return false;
      }
      return 3000; // Poll every 3 seconds
    },
    staleTime: 0, // Always fresh data when polling
  });
};

// Hook for handling payment next actions
export const usePaymentActions = () => {
  const handlePaymentAction = async (payment: Payment): Promise<{
    success: boolean;
    status: 'paid' | 'cancelled' | 'failed' | 'pending' | 'none' | string;
    error?: string;
  }> => {
    const { paymentLogger } = await import('@/shared/lib/payment-logger');
    const { paymentDebugger } = await import('../utils/payment-debugger');

    // Log payment response received
    paymentDebugger.logPaymentResponse(payment);

    if (!payment.nextAction) {
      paymentLogger.log({
        eventType: 'payment_completed',
        paymentId: payment.id,
        bookingId: payment.bookingId ?? undefined,
        amount: payment.amount.amountMinor,
        currency: payment.amount.currency,
        metadata: { nextActionType: 'none' },
      });

      return {
        success: true,
        status: 'none',
      };
    }

    switch (payment.nextAction.type) {
      case 'openInvoice': {
        // For Telegram Mini App
        try {
          const isTelegram = await telegramUtils.isTelegramEnv();

          if (!isTelegram) {
            const errorMsg = 'Not in Telegram environment, cannot open invoice';
            console.warn(errorMsg);

            paymentLogger.logError({
              error: errorMsg,
              context: 'handlePaymentAction.openInvoice',
              paymentId: payment.id,
              bookingId: payment.bookingId ?? undefined,
            });

            return {
              success: false,
              status: 'failed',
              error: errorMsg,
            };
          }

          const slug = payment.nextAction.slugOrUrl;

          paymentLogger.logInvoiceOpening({
            paymentId: payment.id,
            bookingId: payment.bookingId ?? undefined,
            slug,
          });

          paymentDebugger.updateContext({
            metadata: { invoiceSlug: slug },
          });

          const result = await telegramUtils.openInvoice(slug);

          // Log detailed invoice status
          paymentLogger.logInvoiceStatus({
            paymentId: payment.id,
            status: result,
            metadata: {
              slug,
              provider: payment.provider,
              amount: payment.amount.amountMinor,
              currency: payment.amount.currency,
            },
          });

          paymentDebugger.logInvoiceStatus(result, {
            slug,
            provider: payment.provider,
            amount: payment.amount.amountMinor,
            currency: payment.amount.currency,
          });

          // Handle different invoice statuses
          switch (result) {
            case 'paid':
              return {
                success: true,
                status: 'paid',
              };

            case 'cancelled':
              paymentLogger.logPaymentCancelled({
                paymentId: payment.id,
                bookingId: payment.bookingId ?? undefined,
                reason: 'User cancelled invoice',
              });

              return {
                success: false,
                status: 'cancelled',
              };

            case 'failed': {
              const failureMsg = `Invoice payment failed. This usually means:
1. Payment provider not configured in BotFather
2. Currency (${payment.amount.currency}) not supported by provider (${payment.provider || 'unknown'})
3. Invalid payment credentials
4. Card declined or insufficient funds`;

              paymentLogger.logPaymentFailed({
                paymentId: payment.id,
                bookingId: payment.bookingId ?? undefined,
                error: failureMsg,
                metadata: {
                  invoiceStatus: result,
                  provider: payment.provider,
                  currency: payment.amount.currency,
                  amount: payment.amount.amountMinor,
                  slug,
                },
              });

              console.error('[Payment Failed]', {
                paymentId: payment.id,
                bookingId: payment.bookingId ?? undefined,
                status: result,
                provider: payment.provider,
                currency: payment.amount.currency,
                amount: `${payment.amount.amountMinor / 100} ${payment.amount.currency}`,
                slug,
                troubleshooting: {
                  step1: 'Check BotFather payment provider configuration',
                  step2: `Verify ${payment.amount.currency} is supported by ${payment.provider || 'your provider'}`,
                  step3: 'Check backend logs for invoice creation errors',
                  step4: 'Verify payment provider credentials',
                },
              });

              return {
                success: false,
                status: 'failed',
                error: failureMsg,
              };
            }

            case 'pending':
              paymentLogger.log({
                eventType: 'invoice_status_received',
                paymentId: payment.id,
                status: 'pending',
                metadata: { note: 'Payment still in progress' },
              });

              return {
                success: false,
                status: 'pending',
              };

            default:
              paymentLogger.logError({
                error: `Unknown invoice status: ${result}`,
                context: 'handlePaymentAction.openInvoice',
                paymentId: payment.id,
                bookingId: payment.bookingId ?? undefined,
                metadata: { unknownStatus: result },
              });

              return {
                success: false,
                status: result,
                error: `Unknown status: ${result}`,
              };
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);

          console.error('[Payment Error] Failed to open invoice:', {
            paymentId: payment.id,
            bookingId: payment.bookingId ?? undefined,
            error: errorMsg,
            provider: payment.provider,
          });

          paymentLogger.logError({
            error: error as Error | string,
            context: 'handlePaymentAction.openInvoice.exception',
            paymentId: payment.id,
            bookingId: payment.bookingId ?? undefined,
          });

          return {
            success: false,
            status: 'failed',
            error: errorMsg,
          };
        }
      }

      case 'redirect':
        // For external payment providers
        try {
          if (typeof window !== 'undefined') {
            paymentLogger.log({
              eventType: 'payment_api_response',
              paymentId: payment.id,
              bookingId: payment.bookingId ?? undefined,
              status: 'redirect',
              amount: payment.amount.amountMinor,
              currency: payment.amount.currency,
              metadata: { redirectUrl: payment.nextAction.url },
            });

            window.open(payment.nextAction.url, '_blank');

            return {
              success: true,
              status: 'pending',
            };
          }

          return {
            success: false,
            status: 'failed',
            error: 'Window is not available for redirect',
          };
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);

          paymentLogger.logError({
            error: error as Error | string,
            context: 'handlePaymentAction.redirect',
            paymentId: payment.id,
            bookingId: payment.bookingId ?? undefined,
          });

          return {
            success: false,
            status: 'failed',
            error: errorMsg,
          };
        }

      case 'none':
        // Payment completed immediately (e.g., full cashback or certificate)
        paymentLogger.logPaymentCompleted({
          paymentId: payment.id,
          bookingId: payment.bookingId ?? undefined,
          amount: payment.amount.amountMinor,
          currency: payment.amount.currency,
        });

        return {
          success: true,
          status: 'none',
        };

      default:
        paymentLogger.logError({
          error: `Unknown next action type: ${(payment.nextAction as { type: string }).type}`,
          context: 'handlePaymentAction',
          paymentId: payment.id,
          bookingId: payment.bookingId ?? undefined,
        });

        return {
          success: false,
          status: 'failed',
          error: 'Unknown payment action type',
        };
    }
  };

  return { handlePaymentAction };
};