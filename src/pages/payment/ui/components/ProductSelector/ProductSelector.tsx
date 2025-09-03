import { SegmentedControl } from '@/shared/ui';
import { PRODUCT_TYPE_LABELS } from '../../../lib/constants';
import type { ProductType } from '../../../model/types';
import styles from './ProductSelector.module.scss';

interface ProductSelectorProps {
  selectedProduct: ProductType;
  onProductChange: (product: ProductType) => void;
}

export function ProductSelector({ selectedProduct, onProductChange }: ProductSelectorProps) {
  return (
    <SegmentedControl className={styles.selector}>
      <SegmentedControl.Item
        selected={selectedProduct === 'subscription'}
        onClick={() => onProductChange('subscription')}
      >
        {PRODUCT_TYPE_LABELS.subscription}
      </SegmentedControl.Item>
      <SegmentedControl.Item
        selected={selectedProduct === 'single_session'}
        onClick={() => onProductChange('single_session')}
      >
        {PRODUCT_TYPE_LABELS.single_session}
      </SegmentedControl.Item>
    </SegmentedControl>
  );
}