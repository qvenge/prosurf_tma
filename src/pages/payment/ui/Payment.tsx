import { useState } from 'react';
import clsx from 'clsx';
import { SegmentedControl, Button, Switch } from '@/shared/ui';
import styles from './Payment.module.scss';

const subscriptionPlans = [
  {
    id: '1',
    sessionsTotal: 5,
    price: 1200000
  },
    {
    id: '2',
    sessionsTotal: 10,
    price: 1800000
  },
    {
    id: '3',
    sessionsTotal: 20,
    price: 3400000
  },
  {
    id: '4',
    sessionsTotal: 30,
    price: 6400000
  }
]


export function PaymentPage() {
  const [product, setProduct] = useState('subscription');
  const [selectedPlanId, setSelectedPlanId] = useState(subscriptionPlans[0].id);
  const subscriptionPrice = subscriptionPlans.find((plan) => plan.id === selectedPlanId)?.price ?? 0;
  const sessionPrice = 1200000;
  const cashbackValue = 200000;
  const [activeCashback, setActiveCashback] = useState(false);

  const price = product === 'subscription' ? subscriptionPrice : sessionPrice;
  const totalPrice = activeCashback ? (price - cashbackValue) : price;

  const calcCashback = (total: number) => total * 0.03; 

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

        {product === 'subscription' ? (<>
          <div className={styles.description}>
            <div className={styles.info}>
              <div className={styles.productName}>Абонемент 5 занятий</div>
              <div className={styles.productPurpose}>Серфинг</div>
            </div>
            <div className={styles.price}>
              {`${subscriptionPrice} ₽`}
            </div>
          </div>
          <div className={styles.productSettings}>
            <div className={styles.amountList}>
              {subscriptionPlans.map((plan) => (
                <div
                  className={clsx(styles.amountItem, plan.id === selectedPlanId && styles['amountItem--active'])}
                  onClick={() => setSelectedPlanId(plan.id)}
                >
                  <div className={styles.amountNumber}>{plan.sessionsTotal}</div>
                  <div className={styles.amountText}>Занятий</div>
                </div>
              ))}
            </div>
          </div>
        </>) : (
          <div className={styles.description}>
            <div className={styles.info}>
              <div className={styles.productName}>Разовая тренировка</div>
              <div className={styles.productPurpose}>Серфинг</div>
            </div>
            <div className={styles.price}>
              {sessionPrice}
            </div>
          </div>
        )}

        <div className={styles.divider} />

        {/* Списание кэшбека */}
        {cashbackValue > 0 && (<>
          <div className={styles.settingItem}>
            <div className={styles.settingItemInfo}>
              <div className={styles.settingItemName}>Кэшбек: {cashbackValue} ₽</div>
              <div className={styles.settingItemDescription}>Списать {cashbackValue} ₽ бонусов?</div>
            </div>
            <div className={styles.settingItemControl}>
              <Switch checked={activeCashback} onChange={({currentTarget}) => setActiveCashback(currentTarget.checked)}/>
            </div>
          </div>

          <div className={styles.divider} />
        </>)}

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
          {price !== totalPrice && <div className={styles.initialPrice}>{price}</div>}
          <div className={styles.totalPrice}>{totalPrice}</div>
        </div>
        <Button className={styles.payButton} size='l' stretched={true} mode='primary'>Оплатить</Button>
        <div className={styles.cashback}>{`Начислим кэшбек: ${calcCashback(totalPrice)} ₽`}</div>
      </div>
    </div>
  )
}