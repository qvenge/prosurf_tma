import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import clsx from 'clsx';
import { SegmentedControl, Button, Switch } from '@/shared/ui';
import { 
  useEventSession, 
  useSubscriptionPlans,
  useCreateBooking,
  usePurchaseSubscription,
  useCreatePaymentIntent,
  useUserProfile,
  useUserBookings
} from '@/shared/api';
import styles from './Payment.module.scss';

export function PaymentPage() {
  const { trainingId } = useParams<{ trainingId: string }>();
  const navigate = useNavigate();
  
  // Fetch session data
  const { data: session, isLoading: sessionLoading, error: sessionError } = useEventSession(trainingId!);
  
  // Fetch subscription plans filtered by event type
  const { data: subscriptionPlans, isLoading: plansLoading, error: plansError } = useSubscriptionPlans(
    session ? { eventType: session.type } : undefined
  );
  
  // Fetch user profile
  const { data: user } = useUserProfile();
  
  // Fetch user bookings to check for existing bookings
  const { data: userBookings } = useUserBookings();
  
  // Mutation hooks
  const createBooking = useCreateBooking();
  const purchaseSubscription = usePurchaseSubscription();
  const createPaymentIntent = useCreatePaymentIntent();
  
  const [product, setProduct] = useState('subscription');
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [activeCashback, setActiveCashback] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  
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

  // Handle payment processing
  const handlePayment = async () => {
    setPaymentError(null);
    
    if (!user) {
      // User is not authenticated, redirect to login
      navigate('/auth/login');
      return;
    }

    if (!session) {
      setPaymentError('Данные о тренировке не найдены');
      return;
    }

    try {
      if (product === 'subscription') {
        if (!selectedPlanId) {
          setPaymentError('Выберите план подписки');
          return;
        }

        // Purchase subscription
        const result = await purchaseSubscription.mutateAsync({
          planId: selectedPlanId
        });

        // Redirect to payment provider checkout
        if (result.checkoutUrl) {
          window.location.href = result.checkoutUrl;
        } else if (result.clientSecret) {
          // Handle client secret for payment completion (fallback)
          window.location.href = result.clientSecret;
        } else {
          setPaymentError('Ошибка при создании платежа');
        }
      } else {
        // Single session payment flow
        // Check for existing HOLD booking for this session
        const existingBooking = userBookings?.find(
          booking => booking.sessionId === session.id && booking.status === 'HOLD'
        );

        let bookingId: string;

        if (existingBooking) {
          // Use existing booking
          bookingId = existingBooking.id;
          console.log('Using existing booking:', bookingId);
        } else {
          // Create new booking
          const booking = await createBooking.mutateAsync({
            sessionId: session.id,
            idempotencyKey: `booking-${session.id}-${Date.now()}`
          });
          bookingId = booking.id;
          console.log('Created new booking:', bookingId);
        }

        // Create payment intent for the booking
        const paymentResult = await createPaymentIntent.mutateAsync({
          bookingId: bookingId,
          method: 'PAYMENT'
        });

        // Redirect to payment provider checkout
        if (paymentResult.checkoutUrl) {
          window.location.href = paymentResult.checkoutUrl;
        } else if (paymentResult.clientSecret) {
          // Handle client secret for payment completion
          window.location.href = paymentResult.clientSecret;
        } else {
          setPaymentError('Ошибка при создании платежа');
        }
      }
    } catch (error: unknown) {
      console.error('Payment processing failed:', error);
      
      // Handle different types of errors
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('Authentication required')) {
        navigate('/auth/login');
      } else if (errorMessage.includes('already have an active booking')) {
        // Try to find the existing booking and create payment for it
        const existingBooking = userBookings?.find(
          booking => booking.sessionId === session?.id && booking.status === 'HOLD'
        );
        
        if (existingBooking) {
          try {
            // Attempt to create payment intent for existing booking
            const paymentResult = await createPaymentIntent.mutateAsync({
              bookingId: existingBooking.id,
              method: 'PAYMENT'
            });

            // Redirect to payment provider checkout
            if (paymentResult.checkoutUrl) {
              window.location.href = paymentResult.checkoutUrl;
              return; // Exit successfully
            } else if (paymentResult.clientSecret) {
              window.location.href = paymentResult.clientSecret;
              return; // Exit successfully
            }
          } catch (paymentError) {
            console.error('Failed to create payment for existing booking:', paymentError);
          }
        }
        
        setPaymentError('У вас уже есть активное бронирование на эту тренировку. Попробуйте обновить страницу и повторить попытку.');
      } else if (errorMessage.includes('no seats available')) {
        setPaymentError('Нет свободных мест на эту тренировку');
      } else if (errorMessage.includes('not found')) {
        setPaymentError('Тренировка не найдена');
      } else {
        setPaymentError('Произошла ошибка при обработке платежа. Попробуйте снова.');
      }
    }
  }; 

  // Check if any operation is in progress
  const isProcessing = createBooking.isPending || purchaseSubscription.isPending || createPaymentIntent.isPending;

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
        
        {/* Error message */}
        {paymentError && (
          <div className={styles.error}>
            {paymentError}
          </div>
        )}
      </div>
      
      <div className={styles.footer}>
        <div className={styles.footerTitle}>Итого</div>
        <div className={styles.totalPriceWrapper}>
          {price !== totalPrice && <div className={styles.initialPrice}>{formatPrice(price)} ₽</div>}
          <div className={styles.totalPrice}>{formatPrice(totalPrice)} ₽</div>
        </div>
        <Button 
          className={styles.payButton} 
          size='l' 
          stretched={true} 
          mode='primary'
          onClick={handlePayment}
          disabled={isProcessing}
        >
          {isProcessing ? 'Обработка...' : 'Оплатить'}
        </Button>
        <div className={styles.cashback}>{`Начислим кэшбек: ${formatPrice(calcCashback(totalPrice))} ₽`}</div>
      </div>
    </div>
  )
}