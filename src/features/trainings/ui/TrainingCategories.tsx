import { TrainingCategoryItem } from './TrainingCategoryItem';
import styles from './TrainingCategories.module.scss';
import clsx from 'clsx';

type TrainingCategoriesProps = React.HTMLAttributes<HTMLDivElement>;


export function TrainingCategories({ className }: TrainingCategoriesProps) {
  return (
    <div className={clsx(className, styles.categories)}>
      <TrainingCategoryItem
        title="Серфинг"
        eventType="training:surfing"
      />
      <TrainingCategoryItem
        title="Серфскейт"
        eventType="training:surfskate"
      />
    </div>
  );
}