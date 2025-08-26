'use client';

import { useRef } from 'react';

import { isEqual } from '@/shared/lib/equal';

export const useObjectMemo = <T>(object: T): T => {
  const cache = useRef(object);

  if (!isEqual(cache.current, object)) {
    cache.current = object;
  }

  return cache.current;
};

