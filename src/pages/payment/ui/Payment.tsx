import { useState } from 'react';
import clsx from 'clsx';
import { SegmentedControl, Button, Switch } from '@/shared/ui';
import styles from './Payment.module.scss';


export function PaymentPage() {
  const [product, setProduct] = useState('subscription');
  const cashbackValue = '363 ₽';
  const initialPrice = '38 300 ₽';
  const finalPrice = '36 300 ₽';

  return (
    <div className={styles.wrapper}>
      <div className={styles.top}>
        <h1 className={styles.title}>Оплатить</h1>
        <SegmentedControl className={styles.select}>
          <SegmentedControl.Item
            selected={product === 'subscription'}
            onClick={() => setProduct('subscription')}
          >
            Абонемент
          </SegmentedControl.Item>
          <SegmentedControl.Item
            selected={product === 'single_session'}
            onClick={() => setProduct('single_session')}
          >
            Разовая тренировка
          </SegmentedControl.Item>
        </SegmentedControl>
        <div className={styles.description}>
          <div className={styles.info}>
            <div className={styles.productName}>Абонемент 5 занятий</div>
            <div className={styles.productPurpose}>Серфинг</div>
          </div>
          <div className={styles.price}>
            {initialPrice}
          </div>
        </div>
        <div className={styles.productSettings}>
          <div className={styles.amountList}>
            {[5,10,20,30].map((amount) => (
              <div className={clsx(styles.amountItem, amount === 5 && styles['amountItem--active'])}>
                <div className={styles.amountNumber}>{amount}</div>
                <div className={styles.amountText}>Занятий</div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.divider} />

        {/* Списание кэшбека */}
        <div className={styles.settingItem}>
          <div className={styles.settingItemInfo}>
            <div className={styles.settingItemName}>Кэшбек: 2 000₽</div>
            <div className={styles.settingItemDescription}>Списать 2 000₽ бонусов?</div>
          </div>
          <div className={styles.settingItemControl}>
            <Switch checked={true} />
          </div>
        </div>

        <div className={styles.divider} />

        {/* Списание сертификата */}
        <div className={styles.settingItem}>
          <div className={styles.settingItemInfo}>
            <div className={styles.settingItemName}>сертификат: 15 000 ₽</div>
            <div className={styles.settingItemDescription}>Cписать 7 900 ₽?</div>
          </div>
          <div className={styles.settingItemControl}>
            <Switch />
          </div>
        </div>

        <div className={styles.divider} />
      </div>
      
      <div className={styles.footer}>
        <div className={styles.footerTitle}>Итого</div>
        <div className={styles.totalPriceWrapper}>
          {initialPrice && <div className={styles.initialPrice}>{initialPrice}</div>}
          <div className={styles.totalPrice}>{finalPrice}</div>
        </div>
        <Button className={styles.payButton} size='l' stretched={true} mode='primary'>Оплатить</Button>
        <div className={styles.cashback}>{`Начислим кэшбек: ${cashbackValue}`}</div>
      </div>
    </div>
  )
}