import { canUseDOM } from '@/shared/lib/dom';

export const getInitialAppearance = () => {
  if (canUseDOM && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  return 'light';
};
