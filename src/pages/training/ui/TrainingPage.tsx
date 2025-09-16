import clsx from 'clsx';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams } from 'react-router';
import { useNavigate } from '@/shared/navigation';

import { PageLayout } from '@/widgets/page-layout'
import { Icon, Button, useBottomBar } from '@/shared/ui';
import { CalendarBlankBold, MapPinRegular } from '@/shared/ds/icons';
import { useSession, useBookSession, useCurrentUserSeasonTickets } from '@/shared/api';
import styles from './TrainingPage.module.scss';

import { BookingSelectionModal } from './components/BookingSelectionModal';

const heroImages = [
  '/images/surfing1.jpg',
  '/images/surfing2.png',
];

// Assets from Figma
const imgRectangle3 = "http://localhost:3845/assets/c13e3ca0ccd2db8f8894d5a02d936feb0dea78c3.png";

export const TrainingPage = () => {
  const { setOverride } = useBottomBar();
  const [modalOpen, setModalOpen] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  // Removed pendingBookingId - not needed with new API structure

  const navigate = useNavigate();
  const { trainingId } = useParams<{ trainingId: string; }>();
  const { data: session, isLoading, error } = useSession(trainingId!);
  const { data: subscriptions = [], isLoading: subscriptionsLoading } = useCurrentUserSeasonTickets();
  
  const createBookingMutation = useBookSession();
  // TODO: Implement subscription redemption with new API structure

  const handleBookingClick = useCallback(() => {
    if (!session || subscriptionsLoading) return;
    
    setBookingError(null);
    setModalOpen(true);
  }, [session, subscriptionsLoading]);

  const handleUseSubscription = useCallback(() => {
    if (!trainingId) return;
    
    setBookingError(null);
    
    // TODO: Update to use new API structure with season tickets
    createBookingMutation.mutate(
      { 
        sessionId: trainingId, 
        data: { quantity: 1 },
        idempotencyKey: crypto.randomUUID()
      },
      {
        onSuccess: () => {
          setModalOpen(false);
          navigate(`/trainings/sessions/${trainingId}/booked`);
        },
        onError: (error: any) => {
          console.error('Booking error:', error);
          setBookingError(error.message || 'Произошла ошибка при создании записи');
        }
      }
    );
  }, [trainingId, createBookingMutation, navigate]);

  const handleGoToPayment = useCallback(() => {
    if (!trainingId) return;
    
    setModalOpen(false);
    navigate(`/trainings/sessions/${trainingId}/payment`);
  }, [trainingId, navigate]);

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
    <PageLayout title={session.event.title} heroImages={heroImages}>
      <div className={styles.wrapper}>
        {session && (
          <BookingSelectionModal 
            isOpen={modalOpen} 
            onClose={() => setModalOpen(false)}
            session={session}
            subscriptions={subscriptions || []}
            onUseSubscription={handleUseSubscription}
            onGoToPayment={handleGoToPayment}
            isRedeeming={false}
            isBooking={createBookingMutation.isPending}
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
              <div className={styles.price}>{session.event.tickets[0]?.prepayment.price.amountMinor / 100} {session.event.tickets[0]?.prepayment.price.currency === 'RUB' ? '₽' : '$'}</div>
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
              {new Date(session.startsAt).toLocaleDateString('ru-RU', {
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
                  {session.event.location || 'Местоположение не указано'}
                </div>
              </div>
            </div>
            <div className={styles.locationTimeRight}>
              <div className={styles.duration}>1 ч 30 мин.</div>
              <div className={styles.time}>
                {new Date(session.startsAt).toLocaleTimeString('ru-RU', {
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
        {session.event.description?.map((section, index: number) => (
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