import { TrainingCategoryItem } from './TrainingCategoryItem';
import styles from './TrainingCategories.module.scss';
import clsx from 'clsx';

type TrainingCategoriesProps = React.HTMLAttributes<HTMLDivElement>;


export function TrainingCategories({ className }: TrainingCategoriesProps) {
  return (
    <div className={clsx(className, styles.categories)}>
      <TrainingCategoryItem
        title="Серфинг"
        imageUrl="/images/surfing1.jpg"
        eventType="training:surfing"
      />
      <TrainingCategoryItem
        title="Серфскейт"
        imageUrl="/images/surfskate1.png"
        eventType="training:surfskate"
      />
    </div>
  );
}