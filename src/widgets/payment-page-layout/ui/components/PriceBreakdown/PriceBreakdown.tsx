import type { Price } from '@/shared/api';
import { formatPrice } from '@/shared/lib/format-utils';
import styles from './PriceBreakdown.module.scss';

interface PriceBreakdownProps {
  productName: string;
  description?: string;
  price?: Price;
}

export function PriceBreakdown({
  productName,
  description,
  price
}: PriceBreakdownProps) {
  return (
    <div className={styles.breakdown}>
      <div className={styles.description}>
        <div className={styles.info}>
          <div className={styles.productName}>{productName}</div>
          {description && <div className={styles.productPurpose}>{description}</div>}
        </div>
        <div className={styles.price}>{formatPrice(price)}</div>
      </div>

    </div>
  );
}