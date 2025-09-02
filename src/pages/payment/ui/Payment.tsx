import { useState } from 'react';
import { useParams } from 'react-router';
import clsx from 'clsx';
import { SegmentedControl, Button, Switch } from '@/shared/ui';
import { useEventSession, useSubscriptionPlans } from '@/shared/api';
import styles from './Payment.module.scss';

export function PaymentPage() {
  const { trainingId } = useParams<{ trainingId: string }>();
  
  // Fetch session data
  const { data: session, isLoading: sessionLoading, error: sessionError } = useEventSession(trainingId!);
  
  // Fetch subscription plans filtered by event type
  const { data: subscriptionPlans, isLoading: plansLoading, error: plansError } = useSubscriptionPlans(
    session ? { eventType: session.type } : undefined
  );
  
  // TODO: Fetch user profile for cashback balance when API supports it
  // const { data: user } = useUserProfile();
  
  const [product, setProduct] = useState('subscription');
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [activeCashback, setActiveCashback] = useState(false);
  
  // Set initial plan selection when plans load
  if (subscriptionPlans && subscriptionPlans.length > 0 && !selectedPlanId) {
    setSelectedPlanId(subscriptionPlans[0].id);
  }

  // Helper function to convert Price object to minor units (kopecks)
  const priceToMinor = (price: { amount: string; currency: string }) => {
    return Math.round(parseFloat(price.amount) * 100);
  };
  
  // Calculate prices
  const selectedPlan = subscriptionPlans?.find(plan => plan.id === selectedPlanId);
  const subscriptionPrice = selectedPlan ? selectedPlan.priceMinor : 0;
  const sessionPrice = session ? priceToMinor(session.price) : 0;
  
  // Mock cashback value - in real app this would come from user profile
  const cashbackValue = 20000; // 200 rubles in kopecks
  
  const price = product === 'subscription' ? subscriptionPrice : sessionPrice;
  const totalPrice = activeCashback ? Math.max(0, price - cashbackValue) : price;

  const calcCashback = (total: number) => Math.round(total * 0.03);
  
  // Helper to format price for display
  const formatPrice = (priceMinor: number) => {
    return Math.round(priceMinor / 100).toLocaleString('ru-RU');
  }; 

  // Loading state
  if (sessionLoading || plansLoading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.loading}>Загрузка...</div>
      </div>
    );
  }

  // Error state
  if (sessionError || plansError) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.error}>
          Ошибка загрузки данных. Попробуйте обновить страницу.
        </div>
      </div>
    );
  }

  // No session found
  if (!session) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.error}>Тренировка не найдена</div>
      </div>
    );
  }

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
              <div className={styles.productName}>
                {selectedPlan ? selectedPlan.name : 'Абонемент'}
              </div>
              <div className={styles.productPurpose}>
                {session.type === 'surfingTraining' ? 'Серфинг' : 
                 session.type === 'surfskateTraining' ? 'Серфскейт' : 
                 session.type === 'tour' ? 'Тур' : 'Другое'}
              </div>
            </div>
            <div className={styles.price}>
              {`${formatPrice(subscriptionPrice)} ₽`}
            </div>
          </div>
          <div className={styles.productSettings}>
            <div className={styles.amountList}>
              {subscriptionPlans?.map((plan) => (
                <div
                  key={plan.id}
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
              <div className={styles.productName}>{session.title}</div>
              <div className={styles.productPurpose}>
                {session.type === 'surfingTraining' ? 'Серфинг' : 
                 session.type === 'surfskateTraining' ? 'Серфскейт' : 
                 session.type === 'tour' ? 'Тур' : 'Другое'}
              </div>
            </div>
            <div className={styles.price}>
              {`${formatPrice(sessionPrice)} ₽`}
            </div>
          </div>
        )}

        <div className={styles.divider} />

        {/* Списание кэшбека */}
        {cashbackValue > 0 && (<>
          <div className={styles.settingItem}>
            <div className={styles.settingItemInfo}>
              <div className={styles.settingItemName}>Кэшбек: {formatPrice(cashbackValue)} ₽</div>
              <div className={styles.settingItemDescription}>Списать {formatPrice(cashbackValue)} ₽ бонусов?</div>
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
          {price !== totalPrice && <div className={styles.initialPrice}>{formatPrice(price)} ₽</div>}
          <div className={styles.totalPrice}>{formatPrice(totalPrice)} ₽</div>
        </div>
        <Button className={styles.payButton} size='l' stretched={true} mode='primary'>Оплатить</Button>
        <div className={styles.cashback}>{`Начислим кэшбек: ${formatPrice(calcCashback(totalPrice))} ₽`}</div>
      </div>
    </div>
  )
}