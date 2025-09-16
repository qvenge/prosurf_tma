export const formatDuration = (start: string, end: string | null) => {
  if (!end) return undefined;
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffMs = endDate.getTime() - startDate.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours === 0) return `${minutes} мин.`;
  if (minutes === 0) return `${hours} ч`;
  return `${hours} ч ${minutes} мин.`;
};

export const formatAvailability = (remainingSeats: number) => {
  if (remainingSeats === 0) {
    return { hasSeats: false, text: 'нет мест' };
  } else if (remainingSeats === 1) {
    return { hasSeats: true, text: '1 место' };
  } else if (remainingSeats < 5) {
    return { hasSeats: true, text: `${remainingSeats} места` };
  } else {
    return { hasSeats: true, text: `${remainingSeats} мест` };
  }
};

export const formatPrice = (price: { amountMinor: number; currency: string }) => {
  const amount = (price.amountMinor / 100).toLocaleString('ru-RU');
  return price.currency === 'RUB' ? `${amount} ₽` : `${amount} ${price.currency}`;
};