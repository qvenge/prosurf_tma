import { BarbellBold, ConfettiBold, AirplaneTiltBold, CertificateBold, MoneyBold } from '@/shared/ds/icons';
import type { PaymentStatus, PaymentListItem, PaymentCategory } from '@/shared/api';
import { formatPrice } from '@/shared/lib/format-utils';

export interface PaymentEntryData {
  id: string;
  purpose: string;
  icon: string;
  label: string;
  cost: string;
  cashback?: string;
  status: PaymentStatus;
}

export interface PaymentGroup {
  day: string;
  items: PaymentEntryData[];
}

export const formatPaymentDate = (datetime: string): string => {
  const date = new Date(datetime);
  const day = date.getDate();
  const month = date.toLocaleDateString('ru-RU', { month: 'long' });
  const weekday = date.toLocaleDateString('ru-RU', { weekday: 'long' });
  return `${day} ${month} • ${weekday}`;
};

export const getCategoryInfo = (
  category: PaymentCategory,
  labels?: string[] | null
): {icon: string, label: string} => {
  if (category === 'certificate') {
    return {icon: CertificateBold, label: 'Сертификат' };
  }

  if (labels?.includes('tour')) {
    return {icon: AirplaneTiltBold, label: 'Тур' };
  }

  if (labels?.includes('activity')) {
    return {icon: ConfettiBold, label: 'Ивент' };
  }

  if (labels?.includes('training:surfing')) {
    return {icon: BarbellBold, label: 'Серфинг' };
  }

    if (labels?.includes('training:surfskate')) {
    return {icon: BarbellBold, label: 'Серфскейт' };
  }

  return {icon: MoneyBold, label: 'Другое'};
};

export const formatPaymentAmount = (price: { amountMinor: number; currency: string }): string => {
  const formatted = formatPrice(price);
  return `− ${formatted}`;
};

export const formatCashbackAmount = (cashback?: { amountMinor: number; currency: string } | null): string | undefined => {
  if (!cashback || cashback.amountMinor === 0) return undefined;
  // Format cashback as simple number with plus sign
  const amount = Math.round(cashback.amountMinor / 100);
  return `+${amount}`;
};

export const getStatusLabel = (status: PaymentStatus): string => {
  switch (status) {
    case 'FAILED':
    case 'CANCELLED':
      return 'отклонена';
    case 'PENDING':
      return 'ожидает';
    case 'SUCCEEDED':
      return 'успешно';
    default:
      return '';
  }
};

export const groupPaymentsByDate = (payments: PaymentListItem[]): PaymentGroup[] => {
  const grouped = payments.reduce((acc, payment) => {
    const dateKey = new Date(payment.createdAt).toDateString();
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(payment);
    return acc;
  }, {} as Record<string, PaymentListItem[]>);

  return Object.entries(grouped).map(([, items]) => ({
    day: formatPaymentDate(items[0].createdAt),
    items: items.map((payment) => ({
      id: payment.id,
      purpose: payment.name ?? 'Покупка',
      ...getCategoryInfo(payment.category, payment.labels),
      cost: formatPaymentAmount(payment.price),
      cashback: formatCashbackAmount(payment.cashback),
      status: payment.status,
    })),
  }));
};