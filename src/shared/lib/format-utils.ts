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

export const formatPrice = (price?: { amountMinor: number; currency: string }) => {
  if (!price || price.amountMinor == null || price.amountMinor === 0) {
    return 'Бесплатно';
  }
  return new Intl.NumberFormat(
    'ru-RU',
    { style: 'currency', currency: price.currency || 'RUB', minimumFractionDigits: 0 }
  ).format(Number(price.amountMinor / 100));
};