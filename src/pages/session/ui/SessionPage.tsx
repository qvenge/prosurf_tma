import clsx from 'clsx';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams } from 'react-router';
import { useNavigate } from '@/shared/navigation';

import { PageLayout } from '@/widgets/page-layout'
import { Icon, Button, useBottomBar } from '@/shared/ui';
import { CalendarBlankBold, MapPinRegular } from '@/shared/ds/icons';
import { useSession, useBookSession, useSeasonTicketsBySessionId, useCreatePayment, useJoinWaitlist, type EventTicket, type Session } from '@/shared/api';
import styles from './SessionPage.module.scss';

import { BookingSelectionModal } from './components/BookingSelectionModal'; 
import { formatPrice } from '@/shared/lib/format-utils';
import { formatDuration, isTheSameDay, formatRangeWithYear, formatSessionDate, formatTime } from '@/shared/lib/date-utils';

const heroImages = [
  '/images/surfing1.jpg',
  '/images/surfing2.png',
];

const hasPrepayment = (session?: Session): session is Session & { event: { tickets: (EventTicket & { prepayment: { price: { amountMinor: number } } })[] } } => {
  const amount = session?.event.tickets[0].prepayment?.price.amountMinor;
  return amount != null && amount > 0;
};

const mapSrc = "/map.png";

export const SessionPage = () => {
  const { setOverride } = useBottomBar();
  const [modalOpen, setModalOpen] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [waitlistError, setWaitlistError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string; }>();
  const { data: session, isLoading, error } = useSession(sessionId!);
  
  const { data: seasonTickets, isLoading: seasonTicketsLoading } = useSeasonTicketsBySessionId(
    sessionId,
    {status: ['ACTIVE'], hasRemainingPasses: true}
  );

  const createBookingMutation = useBookSession();
  const createPaymentMutation = useCreatePayment();
  const joinWaitlistMutation = useJoinWaitlist();

  const handleUseSubscription = useCallback((seasonTicketId: string) => {
    if (!sessionId) return;

    setBookingError(null);

    // Step 1: Create booking with HOLD status
    createBookingMutation.mutate(
      {
        sessionId: sessionId,
        data: { quantity: 1 },
        idempotencyKey: crypto.randomUUID()
      },
      {
        onSuccess: (bookingResult) => {
          // Step 2: Pay for booking using season ticket pass
          createPaymentMutation.mutate(
            {
              bookingId: bookingResult.booking.id,
              data: {
                method: 'pass',
                seasonTicketId: seasonTicketId,
                passesToSpend: 1
              },
              idempotencyKey: crypto.randomUUID()
            },
            {
              onSuccess: () => {
                setModalOpen(false);
                navigate('payment-success?type=training');
              },
              onError: (error: any) => {
                console.error('Payment error:', error);
                setBookingError(error.message || 'Произошла ошибка при применении абонемента');
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
  }, [sessionId, createBookingMutation, createPaymentMutation, navigate]);

  const handleGoToPayment = useCallback(() => {
    if (!sessionId) return;
    
    setModalOpen(false);
    navigate(`/events/sessions/${sessionId}/payment`);
  }, [sessionId, navigate, setModalOpen]);

  const handleBookingClick = useCallback(() => {
    if (hasPrepayment(session) || !session || seasonTicketsLoading) return;

    if (seasonTickets?.items.length === 0) {
      handleGoToPayment();
      return;
    }

    setBookingError(null);
    setModalOpen(true);
  }, [session, seasonTicketsLoading, seasonTickets, setBookingError, setModalOpen]);

  const handleJoinWaitlist = useCallback(() => {
    if (!sessionId) return;

    setWaitlistError(null);

    joinWaitlistMutation.mutate(
      {
        sessionId: sessionId,
        idempotencyKey: crypto.randomUUID()
      },
      {
        onError: (error: any) => {
          console.error('Waitlist error:', error);
          setWaitlistError(error.message || 'Произошла ошибка при добавлении в лист ожидания');
        }
      }
    );
  }, [sessionId, joinWaitlistMutation, navigate]);

  const bottomBarContent = useMemo(() => (
    <div className={styles.bottomBarContent}>
      {session?.hasBooking ? (
        <div>Вы уже записаны 🤟</div>
      ) : (session?.remainingSeats === 0 ? (
        <>
          <Button
            size='l'
            mode='secondary'
            stretched={true}
            loading={joinWaitlistMutation.isPending}
            disabled={!session || session.onWaitlist}
            onClick={handleJoinWaitlist}
          >
            {session.onWaitlist ? 'В листе ожидания' : 'В лист ожидания'}
          </Button>
          <div>Мест нет 😔</div>
        </>
      ) : (
        <>
          <Button
            size='l'
            mode='primary'
            stretched={true}
            loading={seasonTicketsLoading}
            disabled={!session}
            onClick={handleBookingClick}
          >
            {hasPrepayment(session) ? 'Забронировать' : 'Записаться'}
          </Button>
          {hasPrepayment(session) && (
            <div className={styles.prepaymentNote}>
              {`Бронь: ${formatPrice(session.event.tickets[0].prepayment.price)}`}
            </div>
          )}
        </>
      ))}
    </div>
  ), [seasonTicketsLoading, session, handleBookingClick]);

  useEffect(() => {
    setOverride(bottomBarContent);
    return () => setOverride(null);
  }, [setOverride, bottomBarContent]);

  useEffect(() => {
    if (modalOpen) {
      setBookingError(null);
    }
  }, [modalOpen]);

  if (isLoading) {
    return <div className={styles.wrapper}>Загрузка...</div>;
  }

  if (error) {
    return <div className={styles.wrapper}>Ошибка загрузки сеанса</div>;
  }

  if (!session) {
    return <div className={styles.wrapper}>Сеанс не найден</div>;
  }

  return (
    <PageLayout title={session.event.title} heroImages={heroImages}>
      <div className={styles.wrapper}>
        {session && (
          <BookingSelectionModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            session={session}
            seasonTickets={seasonTickets?.items || []}
            onUseSubscription={handleUseSubscription}
            onGoToPayment={handleGoToPayment}
            isRedeeming={createBookingMutation.isPending || createPaymentMutation.isPending}
            isBooking={createBookingMutation.isPending}
          />
        )}
        
        {bookingError && (
          <div className={styles.errorMessage}>
            {bookingError}
          </div>
        )}

        {waitlistError && (
          <div className={styles.errorMessage}>
            {waitlistError}
          </div>
        )}

        <div className={clsx(styles.wrapperItem, styles.info)}>
          <div className={styles.priceInfo}>
            <div className={styles.priceDetails}>
              <div className={styles.priceType}>{
                hasPrepayment(session) ? `Бронь ${formatPrice(session.event.tickets[0]?.prepayment?.price)}` : session.event.tickets[0].name
              }</div>
              <div className={styles.price}>{formatPrice(session.event.tickets[0]?.full?.price)}</div>
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
              {isTheSameDay(session.startsAt, session.endsAt)
                ? formatSessionDate(session.startsAt)
                : formatRangeWithYear(session.startsAt, session.endsAt)
              }
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
            {isTheSameDay(session.startsAt, session.endsAt) && (<div className={styles.locationTimeRight}>
              <div className={styles.duration}>{formatDuration(session.startsAt, session.endsAt)}</div>
              <div className={styles.time}>{formatTime(session.startsAt)}</div>
            </div>)}
          </div>

          {/* Map */}
          <div 
            className={styles.mapImage}
            style={{
              backgroundImage: `url('${mapSrc}')`
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

        {session.hasBooking && (
          <Button
            style={{ marginTop: -32 }}
            size='l'
            mode='secondary'
            stretched={true}
          >
            Отменить запись
          </Button>
        )}
      </div>
    </PageLayout>
  );
};