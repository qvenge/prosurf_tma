import { useEffect, useRef } from 'react';

export interface UseInfiniteScrollOptions {
  hasNextPage: boolean | undefined;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  rootMargin?: string;
  threshold?: number;
}

/**
 * Hook that implements intersection observer for infinite scrolling
 * @param options Configuration options for infinite scroll behavior
 * @returns Ref to attach to the trigger element
 */
export function useInfiniteScroll({
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  rootMargin = '100px',
  threshold = 0.1,
}: UseInfiniteScrollOptions) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const triggerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Don't create observer if there's no next page or already fetching
    if (!hasNextPage || isFetchingNextPage) {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      return;
    }

    // Create intersection observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          onLoadMore();
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    // Observe trigger element
    const currentTrigger = triggerRef.current;
    if (currentTrigger) {
      observerRef.current.observe(currentTrigger);
    }

    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasNextPage, isFetchingNextPage, onLoadMore, rootMargin, threshold]);

  return triggerRef;
}
