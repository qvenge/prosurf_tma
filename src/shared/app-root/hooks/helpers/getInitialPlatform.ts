import { retrieveLaunchParams } from '@telegram-apps/sdk-react';

export const getInitialPlatform = () => {
  try {
    const params = retrieveLaunchParams();
    const platform = params?.tgWebAppPlatform;

    if (!platform) {
      return 'base';
    }

    if (['ios', 'macos'].includes(platform)) {
      return 'ios';
    }

    return 'base';
  } catch {
    return 'base';
  }
};
