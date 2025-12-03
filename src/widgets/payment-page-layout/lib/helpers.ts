import { PAYMENT_CONSTANTS, EVENT_TYPE_LABELS } from './constants';
import type { EventType, PriceCalculation } from '../model/types';

export const priceToMinor = (price: { amount: string; currency: string }): number => {
  return Math.round(parseFloat(price.amount) * PAYMENT_CONSTANTS.MINOR_CURRENCY_DIVISOR);
};

export const formatPrice = (priceMinor: number): string => {
  return Math.round(priceMinor / PAYMENT_CONSTANTS.MINOR_CURRENCY_DIVISOR).toLocaleString('ru-RU');
};

export const getEventTypeLabel = (eventType: EventType): string => {
  return EVENT_TYPE_LABELS[eventType] || 'Другое';
};

export const calculatePrices = (
  originalPrice: number,  // in kopecks (minor units)
  bonusValue: number,     // in bonus units (1 bonus = 1 ruble)
  activeBonus: boolean
): PriceCalculation => {
  // Convert bonus value from rubles to kopecks for calculation
  const bonusValueInKopecks = bonusValue * PAYMENT_CONSTANTS.MINOR_CURRENCY_DIVISOR;

  const finalPrice = activeBonus
    ? Math.max(0, originalPrice - bonusValueInKopecks)
    : originalPrice;

  return {
    originalPrice,
    finalPrice,
    // bonusAmount in kopecks (to send to server as amountMinor)
    bonusAmount: Math.min(bonusValueInKopecks, originalPrice),
  };
};
