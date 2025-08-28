import { SegmentedControl } from '@/shared/ui/segmented-control';
import styles from './MonthSelector.module.scss';

interface MonthSelectorProps {
  current: string;
  next: string;
  selectedMonth: string;
  onMonthChange: (month: string) => void;
}

export const MonthSelector = ({ current, next, selectedMonth, onMonthChange }: MonthSelectorProps) => {
  return (
    <div className={styles.monthSelector}>
      <SegmentedControl>
        <SegmentedControl.Item
          selected={selectedMonth === current}
          onClick={() => onMonthChange(current)}
        >
          {current}
        </SegmentedControl.Item>
        <SegmentedControl.Item
          selected={selectedMonth === next}
          onClick={() => onMonthChange(next)}
        >
          {next}
        </SegmentedControl.Item>
      </SegmentedControl>
    </div>
  );
};