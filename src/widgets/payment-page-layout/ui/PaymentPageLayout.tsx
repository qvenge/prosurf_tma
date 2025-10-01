import clsx from 'clsx';
import type { PaymentPageLayoutProps } from '../model/types';
import {
  LoadingState,
  ErrorState,
  PaymentOptions,
  PaymentSummary,
  TabSelector,
} from './components';
import styles from './PaymentLayout.module.scss';

export function PaymentPageLayout<T extends string = string>({
  tabs,
  activeTab,
  onTabChange,
  paymentOptions,
  summary,
  topContent,
  isLoading,
  error,
  className,
}: PaymentPageLayoutProps<T>) {
  // Find active tab content
  const activeTabConfig = tabs.find((tab) => tab.id === activeTab);

  // Show loading state
  if (isLoading) {
    return <LoadingState />;
  }

  // Show error state
  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className={clsx(styles.wrapper, className)}>
      <div className={styles.top}>
        {/* Optional top content */}
        {topContent}

        {/* Tab selector - only show if multiple tabs */}
        {tabs.length > 1 && (
          <TabSelector
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={onTabChange}
            className={styles.tabSelector}
          />
        )}

        {/* Active tab content - FULLY CONFIGURABLE */}
        <div className={styles.tabContent}>
          {activeTabConfig?.content}
        </div>

        {/* Payment options - configurable but integrated in widget */}
        {paymentOptions && (
          <>
            <div className={styles.divider} />
            <PaymentOptions options={paymentOptions} />
          </>
        )}
      </div>

      {/* Payment summary footer */}
      <PaymentSummary summary={summary} />
    </div>
  );
}
