import { SegmentedControl } from '@/shared/ui';
import type { TabConfig } from '../../model/types';

interface TabSelectorProps<T extends string> {
  tabs: TabConfig<T>[];
  activeTab: T;
  onTabChange: (tabId: T) => void;
  className?: string;
}

export function TabSelector<T extends string>({
  tabs,
  activeTab,
  onTabChange,
  className,
}: TabSelectorProps<T>) {
  return (
    <SegmentedControl className={className}>
      {tabs.map((tab) => (
        <SegmentedControl.Item
          key={tab.id}
          selected={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </SegmentedControl.Item>
      ))}
    </SegmentedControl>
  );
}
