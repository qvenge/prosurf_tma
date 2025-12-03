import { useNavigate } from '@/shared/navigation';
import {
  usePurchaseCertificate,
  usePaymentActions,
  type CertificateType,
} from '@/shared/api';
import {
  createIdempotencyKey,
  handlePaymentNextAction,
} from '@/shared/lib/payment';
import { CERTIFICATE_PAYMENT_ERRORS } from '@/shared/lib/constants';

/**
 * Certificate payment processing hook
 * Handles certificate purchase (denomination or passes)
 */
export const useCertificatePayment = () => {
  const navigate = useNavigate();

  // API hooks
  const purchaseCertificate = usePurchaseCertificate();
  const { handlePaymentAction } = usePaymentActions();

  /**
   * Process certificate payment
   * @param productType - 'denomination' or 'passes'
   * @param amount - Amount in rubles for denomination type (null for passes)
   * @param setPaymentError - Error setter callback
   * @param passesPriceMinor - Price in minor units for passes type (from API)
   * @param minDenominationAmount - Minimum amount for denomination type (from API)
   */
  const processPayment = async (
    productType: CertificateType,
    amount: number | null, // Amount in rubles for denomination type
    setPaymentError: (error: string) => void,
    passesPriceMinor?: number,
    minDenominationAmount?: number
  ) => {
    setPaymentError('');

    // Import logging utilities
    const { paymentLogger } = await import('@/shared/lib/payment-logger');
    const { paymentDebugger } = await import('@/shared/api/utils/payment-debugger');

    // Validate input based on product type
    if (productType === 'denomination') {
      const minAmount = minDenominationAmount ?? 3000;
      if (!amount || amount < minAmount) {
        setPaymentError(CERTIFICATE_PAYMENT_ERRORS.AMOUNT_TOO_LOW);
        paymentLogger.logError({
          error: CERTIFICATE_PAYMENT_ERRORS.AMOUNT_TOO_LOW,
          context: 'processCertificatePayment',
        });
        return;
      }
    }

    // Calculate amount for logging and payment
    const paymentAmount = productType === 'passes'
      ? (passesPriceMinor ?? 0)
      : (amount! * 100); // Convert rubles to kopecks

    // Start payment attempt
    const attemptId = paymentDebugger.startAttempt({
      amount: paymentAmount,
      currency: 'RUB',
      provider: 'telegram',
      metadata: {
        productType,
        amount: productType === 'denomination' ? amount : undefined,
        passes: productType === 'passes' ? 1 : undefined,
      },
    });

    paymentLogger.logPaymentInitiated({
      amount: paymentAmount,
      currency: 'RUB',
      provider: 'telegram',
    });

    try {
      // Build payment request - only card, no bonus or certificate
      // Use array format (new simplified API structure)
      const paymentMethods = [{
        method: 'card' as const,
        provider: 'telegram' as const,
      }];

      // Prepare purchase data based on type
      const purchaseData = productType === 'denomination'
        ? {
            type: 'denomination' as const,
            amount: {
              currency: 'RUB',
              amountMinor: amount! * 100, // Convert rubles to kopecks
            },
            paymentMethods,
          }
        : {
            type: 'passes' as const,
            paymentMethods,
          };

      // Purchase certificate
      const response = await purchaseCertificate.mutateAsync({
        data: purchaseData,
        idempotencyKey: createIdempotencyKey(`certificate-${productType}-${Date.now()}`),
      });

      console.log('Certificate purchased successfully:', {
        certificateId: response.certificate.id,
        paymentId: response.payment.id,
      });

      paymentDebugger.endAttempt({
        success: true,
      });

      // Handle next action (Telegram payment or navigation)
      await handlePaymentNextAction(response.payment, 'certificate', handlePaymentAction, navigate);
    } catch (error: unknown) {
      console.error('Certificate payment processing failed:', error);

      paymentLogger.logPaymentFailed({
        error: error as Error | string,
        metadata: {
          attemptId,
          productType,
          amount,
        },
      });

      paymentDebugger.endAttempt({
        success: false,
        error: error as Error | string,
      });

      await handlePaymentError(error, setPaymentError);
    }
  };

  /**
   * Handle payment errors
   */
  const handlePaymentError = async (error: unknown, setPaymentError: (error: string) => void) => {
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes('Authentication required')) {
      console.log('Authentication required');
      return;
    } else if (errorMessage.includes('AMOUNT_MISMATCH')) {
      setPaymentError(CERTIFICATE_PAYMENT_ERRORS.AMOUNT_MISMATCH);
    } else if (errorMessage.includes('PROVIDER_UNAVAILABLE')) {
      setPaymentError(CERTIFICATE_PAYMENT_ERRORS.PROVIDER_UNAVAILABLE);
    } else if (errorMessage.includes('INVALID_AMOUNT') || errorMessage.includes('invalid amount')) {
      setPaymentError(CERTIFICATE_PAYMENT_ERRORS.INVALID_AMOUNT);
    } else if (errorMessage.includes('amount too low')) {
      setPaymentError(CERTIFICATE_PAYMENT_ERRORS.AMOUNT_TOO_LOW);
    } else {
      setPaymentError(CERTIFICATE_PAYMENT_ERRORS.PURCHASE_FAILED);
    }
  };

  const isProcessing = purchaseCertificate.isPending;

  return {
    processPayment,
    isProcessing,
  };
};
