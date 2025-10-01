import { PAYMENT_CONSTANTS, EVENT_TYPE_LABELS } from './constants';
import type { EventType, PriceCalculation } from '../model/types';

export const priceToMinor = (price: { amount: string; currency: string }): number => {
  return Math.round(parseFloat(price.amount) * PAYMENT_CONSTANTS.MINOR_CURRENCY_DIVISOR);
};

export const formatPrice = (priceMinor: number): string => {
  return Math.round(priceMinor / PAYMENT_CONSTANTS.MINOR_CURRENCY_DIVISOR).toLocaleString('ru-RU');
};

export const calculateCashback = (totalPrice: number): number => {
  return Math.round(totalPrice * PAYMENT_CONSTANTS.CASHBACK_RATE);
};

export const getEventTypeLabel = (eventType: EventType): string => {
  return EVENT_TYPE_LABELS[eventType] || 'Другое';
};

export const calculatePrices = (
  originalPrice: number,
  cashbackValue: number,
  activeCashback: boolean
): PriceCalculation => {
  const finalPrice = activeCashback ? Math.max(0, originalPrice - cashbackValue) : originalPrice;
  const earnedCashback = calculateCashback(finalPrice);

  return {
    originalPrice,
    finalPrice,
    cashbackAmount: activeCashback ? Math.min(cashbackValue, originalPrice) : 0,
    earnedCashback,
  };
};
