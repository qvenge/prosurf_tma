import {
  CaretRightBold,
  UserBold,
  PencilSimpleBold,
  StarFill,
  CalendarBlankBold,
  ClockBold,
  ListChecksBold,
  ArrowsLeftRightBold,
  ChatCircleTextBold
} from '@/shared/ds/icons';

import { Icon } from '@/shared/ui';
import styles from './Profile.module.scss';
import { Link } from '@/shared/navigation';
import { useCurrentUserProfile, useCurrentUserCashback } from '@/shared/api/hooks/users';
import { useCurrentUserCertificates } from '@/shared/api/hooks/certificates';
import { useCurrentUserSeasonTickets } from '@/shared/api/hooks/season-tickets';
import { useBookings } from '@/shared/api/hooks/bookings';
import { useCurrentUserWaitlist } from '@/shared/api/hooks/waitlist';
import type { BookingExtended } from '@/shared/api/types';

export const Profile = () => {
  // Fetch user profile
  const { user, isLoading: isUserLoading, error: userError } = useCurrentUserProfile();

  // Fetch cashback data
  const { data: cashbackData, isLoading: isCashbackLoading } = useCurrentUserCashback();

  // Fetch certificates
  const { data: certificatesData, isLoading: isCertificatesLoading } = useCurrentUserCertificates();

  // Fetch season tickets
  const { data: seasonTicketsData, isLoading: isSeasonTicketsLoading } = useCurrentUserSeasonTickets();

  // Fetch bookings with session data for next booking
  const { data: bookingsData, isLoading: isBookingsLoading } = useBookings({ includeSession: true });

  // Fetch waitlist entries
  const { data: waitlistData, isLoading: isWaitlistLoading } = useCurrentUserWaitlist();

  // Helper: Get next upcoming booking
  const getNextBooking = (): BookingExtended | null => {
    if (!bookingsData?.items) return null;

    const activeBookings = bookingsData.items.filter(
      (booking): booking is BookingExtended =>
        (booking.status === 'HOLD' || booking.status === 'CONFIRMED') &&
        'session' in booking &&
        booking.session !== undefined
    );

    if (activeBookings.length === 0) return null;

    // Sort by session start time to find the next upcoming booking
    const sortedBookings = activeBookings.sort((a, b) => {
      const aTime = new Date(a.session!.startsAt).getTime();
      const bTime = new Date(b.session!.startsAt).getTime();
      return aTime - bTime;
    });

    // Filter for future bookings only
    const now = new Date().getTime();
    const futureBookings = sortedBookings.filter(
      booking => new Date(booking.session!.startsAt).getTime() > now
    );

    return futureBookings[0] || null;
  };

  // Helper: Format date for next booking subtitle
  const formatBookingDate = (dateString: string): string => {
    const date = new Date(dateString);
    const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day} ${month} в ${hours}:${minutes}`;
  };

  // Helper: Get active season tickets count
  const getActiveSubscriptionCount = (): number => {
    if (!seasonTicketsData) return 0;
    return seasonTicketsData.filter(ticket => ticket.status === 'ACTIVE').length;
  };

  // Helper: Get first denomination certificate
  const getFirstCertificate = () => {
    if (!certificatesData?.items) return null;
    return certificatesData.items.find(cert => cert.type === 'denomination') || null;
  };

  // Compute derived data
  const nextBooking = getNextBooking();
  const activeSubscriptionCount = getActiveSubscriptionCount();
  const firstCertificate = getFirstCertificate();
  const waitlistCount = waitlistData?.items?.length || 0;

  // Compute menu subtitles
  const bookingsSubtitle = isBookingsLoading
    ? 'Загрузка...'
    : nextBooking
      ? `Ближайшее: ${formatBookingDate(nextBooking.session!.startsAt)}`
      : 'Нет записей';

  const waitlistSubtitle = isWaitlistLoading
    ? 'Загрузка...'
    : waitlistCount > 0
      ? `Активных: ${waitlistCount}`
      : 'Нет записей';

  // Define menu items with dynamic subtitles
  const menuItems = [
    {
      icon: CalendarBlankBold,
      title: 'Мои записи',
      subtitle: bookingsSubtitle,
      href: '/profile/bookings',
    },
    {
      icon: ClockBold,
      title: 'Лист ожиданий',
      subtitle: waitlistSubtitle,
      href: '/profile/waitlist',
    },
    {
      icon: ListChecksBold,
      title: 'Аттестация ProSurf',
      subtitle: 'Что это?',
      href: '/profile/prosurf-validation-info',
    },
    {
      icon: ArrowsLeftRightBold,
      title: 'История покупок',
      subtitle: 'Просмотреть историю',
      href: '/profile/payments',
    },
    {
      icon: ChatCircleTextBold,
      title: 'Поддержка',
      subtitle: 'Написать в ТГ',
      href: '/profile',
    }
  ];

  if (isUserLoading) {
    return <div className={styles.wrapper}>Loading...</div>;
  }

  if (userError) {
    return <div className={styles.wrapper}>Error loading profile</div>;
  }

  if (!user) {
    return <div className={styles.wrapper}>User not found</div>;
  }

  return (
    <div className={styles.wrapper}>
      {/* Profile Header */}
      <div className={styles.header}>
        <div className={styles.avatar}>
          {user.photoUrl ? (<img
            src={user.photoUrl}
            alt="Profile avatar"
            className={styles.avatarImage}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.parentElement!.style.backgroundColor = '#4A5568';
            }}
          />) : (
          <div className={styles.avatarFallback}>
            <Icon
              src={UserBold}
              width={24}
              height={24}
              className={styles.avatarIcon}
            />
          </div>
        )}</div>
        
        <div className={styles.userInfo}>
          <div className={styles.name}>{user.firstName} {user.lastName}</div>
          <div className={styles.phone}>{user.phone}</div>
          <div className={styles.email}>{user.email}</div>

          <button className={styles.editButton}>
            <Icon 
              src={PencilSimpleBold} 
              width={24} 
              height={24} 
              className={styles.editIcon}
            />
          </button>
        </div>


        {/* Status Badge */}
        <div className={styles.statusBadge}>
          <Icon 
            src={StarFill} 
            width={18} 
            height={18} 
            className={styles.starIcon}
          />
          Серебряный серфер
          <Icon 
            src={CaretRightBold} 
            width={16} 
            height={16} 
            className={styles.chevron}
          />
        </div>
      </div>

      {/* Stats Section */}
      <div className={styles.statsSection}>
        {!isCashbackLoading && cashbackData?.balance && cashbackData.balance.amountMinor > 0 && (
          <div className={styles.statItem}>
            <div className={styles.statLabel}>Кэшбек</div>
            <div className={styles.statValue}>{Math.floor(cashbackData.balance.amountMinor / 100)} {cashbackData.balance.currency === 'RUB' ? '₽' : '$'}</div>
          </div>
        )}
        {!isSeasonTicketsLoading && activeSubscriptionCount > 0 && (
          <div className={styles.statItem}>
            <div className={styles.statLabel}>Абонемент</div>
            <div className={styles.statValue}>{activeSubscriptionCount}</div>
          </div>
        )}
        {!isCertificatesLoading && firstCertificate && firstCertificate.type === 'denomination' && (
          <div className={styles.statItem}>
            <div className={styles.statLabel}>Сертификат</div>
            <div className={styles.statValue}>
              {'amount' in firstCertificate.data ? `${Math.floor(firstCertificate.data.amount.amountMinor / 100)} ${firstCertificate.data.amount.currency === 'RUB' ? '₽' : '$'}` : ''}
            </div>
          </div>
        )}
      </div>

      {/* Menu Items */}
      <div className={styles.menuSection}>{menuItems.map((item, index) => (
        <Link key={index} to={item.href}   style={{textDecoration: 'none', color: 'inherit'}} >
          <div key={index} className={styles.menuItem}>
            <span className={styles.menuIcon}>
              <Icon 
                src={item.icon} 
                width={20} 
                height={20} 
                className={styles.calendarIcon}
              />
            </span>
            <div className={styles.menuContent}>
              <div className={styles.menuTitle}>{item.title}</div>
              <div className={styles.menuSubtitle}>{item.subtitle}</div>
            </div>
            <Icon 
              src={CaretRightBold} 
              width={20} 
              height={20} 
              className={styles.chevron}
            />
          </div>
        </Link>
      ))}</div>

      {/* Footer Links */}
      <div className={styles.footerLinks}>
        <div className={styles.divider} />
        <div className={styles.footerLink}>Правила оплаты</div>
        <div className={styles.footerLink}>Правила отмены и возврата</div>
        <div className={styles.footerLink}>Договор офферта</div>
        <div className={styles.footerLink}>Техника безопасности</div>
        <div className={styles.divider} />
        <div className={styles.footerLink}>Разработка приложения: @yalbakov</div>
      </div>
    </div>
  );
};