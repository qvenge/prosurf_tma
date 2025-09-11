import clsx from 'clsx';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams } from 'react-router';
import { useNavigate } from '@/shared/navigation';


import { PageLayout } from '@/widgets/page-layout'
import { Icon, Button, useBottomBar } from '@/shared/ui';
import { CalendarBlankBold, MapPinRegular } from '@/shared/ds/icons';
import { useEventSession } from '@/shared/api/hooks/use-event-sessions';
import { useCreateBooking, useUserSubscriptions, useRedeemSubscription } from '@/shared/api';
import styles from './EventSessionPage.module.scss';

import { BookingSelectionModal } from './components/BookingSelectionModal';

const heroImages = [
  '/images/surfing1.jpg',
  '/images/surfing2.png',
];

// Assets from Figma
const imgRectangle3 = "http://localhost:3845/assets/c13e3ca0ccd2db8f8894d5a02d936feb0dea78c3.png";

export const EventSessionPage = () => {
  const { setOverride } = useBottomBar();
  const [modalOpen, setModalOpen] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [pendingBookingId, setPendingBookingId] = useState<string | null>(null);

  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string; }>();
  const { data: session, isLoading, error } = useEventSession(sessionId!);
  const { data: subscriptions = [], isLoading: subscriptionsLoading } = useUserSubscriptions();
  
  const createBookingMutation = useCreateBooking();
  const redeemSubscriptionMutation = useRedeemSubscription();

  const handleBookingClick = useCallback(() => {
    if (!session || subscriptionsLoading) return;
    
    setBookingError(null);
    setModalOpen(true);
  }, [session, subscriptionsLoading]);

  const handleUseSubscription = useCallback(() => {
    if (!sessionId) return;
    
    setBookingError(null);
    
    createBookingMutation.mutate(
      { sessionId },
      {
        onSuccess: (booking) => {
          setPendingBookingId(booking.id);
          redeemSubscriptionMutation.mutate(
            booking.id,
            {
              onSuccess: () => {
                setModalOpen(false);
                navigate(`/trainings/sessions/${sessionId}/booked`);
              },
              onError: (error: any) => {
                console.error('Subscription redemption error:', error);
                setBookingError(error.message || 'Произошла ошибка при использовании абонемента');
                setPendingBookingId(null);
              }
            }
          );
        },
        onError: (error: any) => {
          console.error('Booking error:', error);
          setBookingError(error.message || 'Произошла ошибка при создании записи');
        }
      }
    );
  }, [sessionId, createBookingMutation, redeemSubscriptionMutation, navigate]);

  const handleGoToPayment = useCallback(() => {
    if (!sessionId) return;
    
    setModalOpen(false);
    navigate(`/trainings/sessions/${sessionId}/payment`);
  }, [sessionId, navigate]);

  const bookingButton = useMemo(() => (
    <div className={styles.bookingButtonWrapper}>
      <Button
        size='l'
        mode='primary'
        stretched={true}
        loading={subscriptionsLoading}
        disabled={!session}
        onClick={handleBookingClick}
      >
        Записаться
      </Button>
    </div>
  ), [subscriptionsLoading, session, handleBookingClick]);

  useEffect(() => {
    setOverride(bookingButton);
    return () => setOverride(null);
  }, [setOverride, bookingButton]);

  useEffect(() => {
    if (modalOpen) {
      setBookingError(null);
      setPendingBookingId(null);
    }
  }, [modalOpen]);

  if (isLoading) {
    return <div className={styles.wrapper}>Loading...</div>;
  }

  if (error) {
    return <div className={styles.wrapper}>Error loading training session</div>;
  }

  if (!session) {
    return <div className={styles.wrapper}>Training session not found</div>;
  }

  return (
    <PageLayout title={session.title} heroImages={heroImages}>
      <div className={styles.wrapper}>
        {session && (
          <BookingSelectionModal 
            isOpen={modalOpen} 
            onClose={() => setModalOpen(false)}
            session={session}
            subscriptions={subscriptions}
            onUseSubscription={handleUseSubscription}
            onGoToPayment={handleGoToPayment}
            isRedeeming={redeemSubscriptionMutation.isPending}
            isBooking={createBookingMutation.isPending && !pendingBookingId}
          />
        )}
        
        {bookingError && (
          <div className={styles.errorMessage}>
            {bookingError}
          </div>
        )}

        <div className={clsx(styles.wrapperItem, styles.info)}>
          <div className={styles.priceInfo}>
            <div className={styles.priceDetails}>
              <div className={styles.priceType}>Разовая тренировка</div>
              <div className={styles.price}>{session.price.amount} {session.price.currency === 'RUB' ? '₽' : '$'}</div>
            </div>
            <div className={styles.spotsRemaining}>Осталось {session.remainingSeats} мест</div>
          </div>

          <div className={styles.dateInfo}>
            <Icon
              className={styles.calendarIcon}
              src={CalendarBlankBold}
              width={16}
              height={16}
            />
            <div className={styles.dateText}>
              {new Date(session.start).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                weekday: 'short'
              })}
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className={clsx(styles.wrapperItem, styles.contentSection)}>
          {/* Location and Time */}
          <div className={styles.locationTime}>
            <div className={styles.locationTimeLeft}>
              <div className={styles.sectionTitle}>Место и время</div>
              <div className={styles.locationInfo}>
                <Icon
                  className={styles.mapIcon}
                  width={20}
                  height={20}
                  src={MapPinRegular}
                />
                <div className={styles.address}>
                  {session.location}
                </div>
              </div>
            </div>
            <div className={styles.locationTimeRight}>
              <div className={styles.duration}>1 ч 30 мин.</div>
              <div className={styles.time}>
                {new Date(session.start).toLocaleTimeString('ru-RU', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>

          {/* Map */}
          <div 
            className={styles.mapImage}
            style={{
              backgroundImage: `url('${imgRectangle3}')`
            }}
          />
        </div>

        {/* Description Sections */}
        {session.description.map((section, index) => (
          <div key={index} className={clsx(styles.wrapperItem, styles.descriptionSection)}>
            <div className={styles.sectionTitle}>{section.heading}</div>
            <div className={styles.descriptionText}>
              {section.body}
            </div>
          </div>
        ))}
      </div>
    </PageLayout>
  );
};