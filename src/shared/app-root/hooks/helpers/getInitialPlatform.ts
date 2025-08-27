import { getTelegramData } from '@/shared/lib/telegram';

export const getInitialPlatform = () => {
  const telegramData = getTelegramData();
  if (!telegramData) {
    return 'base';
  }

  if (['ios', 'macos'].includes(telegramData.platform)) {
    return 'ios';
  }

  return 'base';
};
