import type { ReactNode } from 'react';
import type { UseInfiniteQueryResult, InfiniteData } from '@tanstack/react-query';
import { Spinner } from '../spinner';
import { EmptyListStub } from '../empty-list-stub';
import { useInfiniteScroll } from './hooks/useInfiniteScroll';
import styles from './InfiniteScrollList.module.scss';
import clsx from 'clsx';

export interface InfiniteScrollListProps<TData, TGroupKey = string> {
  /**
   * Result from useInfiniteQuery hook
   */
  query: UseInfiniteQueryResult<InfiniteData<{ items: TData[]; next: string | null }>, Error>;

  /**
   * Render function for each item
   */
  renderItem: (item: TData, index: number) => ReactNode;

  /**
   * Optional grouping function that returns a group key for each item
   * If provided, items will be grouped and rendered with group headers
   */
  groupBy?: (item: TData) => TGroupKey;

  /**
   * Optional render function for group headers
   * Required if groupBy is provided
   */
  renderGroupHeader?: (groupKey: TGroupKey) => ReactNode;

  /**
   * Layout direction for items within groups (default: 'vertical')
   * - 'vertical': Items stacked vertically
   * - 'horizontal': Items in a horizontal scrollable row
   */
  groupItemsLayout?: 'vertical' | 'horizontal';

  /**
   * Message to show when list is empty
   */
  emptyMessage?: string;

  /**
   * Error message to show when query fails
   */
  errorMessage?: string;

  /**
   * Additional className for the container
   */
  className?: string;

  /**
   * Additional className for the list wrapper
   */
  listClassName?: string;

  /**
   * Root margin for intersection observer (default: '100px')
   */
  rootMargin?: string;

  /**
   * Threshold for intersection observer (default: 0.1)
   */
  threshold?: number;

  /**
   * Gap between items in pixels or CSS value (default: 8)
   * Also controls gap between group header and items
   */
  itemGap?: number | string;

  /**
   * Gap between groups in pixels or CSS value (default: 32)
   * Only applies to grouped lists
   */
  groupGap?: number | string;
}

/**
 * Helper function to convert gap value to CSS string
 */
const formatGap = (gap: number | string): string => {
  return typeof gap === 'number' ? `${gap}px` : gap;
};

/**
 * Universal infinite scroll list component that works with React Query's useInfiniteQuery
 */
export function InfiniteScrollList<TData, TGroupKey = string>({
  query,
  renderItem,
  groupBy,
  renderGroupHeader,
  groupItemsLayout = 'vertical',
  emptyMessage = 'Нет данных',
  errorMessage = 'Ошибка загрузки данных',
  className,
  listClassName,
  rootMargin = '100px',
  threshold = 0.1,
  itemGap = 8,
  groupGap = 32,
}: InfiniteScrollListProps<TData, TGroupKey>) {
  const {
    data,
    isLoading,
    isError,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = query;

  const triggerRef = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    onLoadMore: fetchNextPage,
    rootMargin,
    threshold,
  });

  // Flatten all pages into a single array
  const items = data?.pages.flatMap((page) => page.items) ?? [];

  // Initial loading state
  if (isLoading) {
    return (
      <div className={clsx(styles.stub, className)}>
        <Spinner size="l" />
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className={clsx(styles.stub, styles.error, className)}>
        <div>{errorMessage}</div>
        {error && <div className={styles.errorDetails}>{error.message}</div>}
      </div>
    );
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div className={clsx(styles.stub, className)}>
        <EmptyListStub message={emptyMessage} />
      </div>
    );
  }

  // Render grouped or ungrouped list
  return (
    <div className={clsx(styles.container, className)}>
      {groupBy && renderGroupHeader ? (
        <GroupedList
          items={items}
          groupBy={groupBy}
          renderItem={renderItem}
          renderGroupHeader={renderGroupHeader}
          groupItemsLayout={groupItemsLayout}
          listClassName={listClassName}
          itemGap={itemGap}
          groupGap={groupGap}
        />
      ) : (
        <div
          className={clsx(styles.list, listClassName)}
          style={{ gap: formatGap(itemGap) }}
        >
          {items.map((item, index) => renderItem(item, index))}
        </div>
      )}

      {/* Loading more indicator */}
      {isFetchingNextPage && (
        <div className={styles.loadingMore}>
          <Spinner size="m" />
        </div>
      )}

      {/* Intersection observer trigger */}
      {hasNextPage && (
        <div ref={triggerRef} className={styles.trigger} />
      )}
    </div>
  );
}

/**
 * Internal component for rendering grouped lists
 */
interface GroupedListProps<TData, TGroupKey> {
  items: TData[];
  groupBy: (item: TData) => TGroupKey;
  renderItem: (item: TData, index: number) => ReactNode;
  renderGroupHeader: (groupKey: TGroupKey) => ReactNode;
  groupItemsLayout: 'vertical' | 'horizontal';
  listClassName?: string;
  itemGap: number | string;
  groupGap: number | string;
}

function GroupedList<TData, TGroupKey>({
  items,
  groupBy,
  renderItem,
  renderGroupHeader,
  groupItemsLayout,
  listClassName,
  itemGap,
  groupGap,
}: GroupedListProps<TData, TGroupKey>) {
  // Group items by the groupBy function
  const groups = items.reduce((acc, item) => {
    const key = groupBy(item);
    if (!acc.has(key)) {
      acc.set(key, []);
    }
    acc.get(key)!.push(item);
    return acc;
  }, new Map<TGroupKey, TData[]>());

  return (
    <div
      className={clsx(styles.groupedList, listClassName)}
      style={{ gap: formatGap(groupGap) }}
    >
      {Array.from(groups.entries()).map(([groupKey, groupItems]) => (
        <div
          key={String(groupKey)}
          className={styles.group}
          style={{ gap: formatGap(itemGap) }}
        >
          <div className={styles.groupHeader}>
            {renderGroupHeader(groupKey)}
          </div>
          <div
            className={clsx(
              styles.groupItems,
              groupItemsLayout === 'horizontal' && styles.groupItemsHorizontal
            )}
            style={{ gap: formatGap(itemGap) }}
          >
            {groupItems.map((item: TData, index: number) => renderItem(item, index))}
          </div>
        </div>
      ))}
    </div>
  );
}
