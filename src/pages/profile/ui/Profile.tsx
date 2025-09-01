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

import { Icon, Button } from '@/shared/ui';
import { useUserProfile } from '@/shared/api/hooks/use-user';
import styles from './Profile.module.scss';

const menuItems = [
  {
    icon: CalendarBlankBold,
    title: 'Мои записи',
    subtitle: 'Ближайшее: 4 июля в 21:30',
  },
  {
    icon: ClockBold,
    title: 'Лист ожиданий',
    subtitle: 'Доступно: 2/10',
  },
  {
    icon: ListChecksBold,
    title: 'Аттестация ProSurf',
    subtitle: 'Что это?',
  },
  {
    icon: ArrowsLeftRightBold,
    title: 'История покупок',
    subtitle: '5 транзакций',
  },
  {
    icon: ChatCircleTextBold,
    title: 'Поддержка',
    subtitle: 'Написать в ТГ',
  }
];

export const Profile = () => {
  // const { data: user, isLoading, error } = useUserProfile();
  const { data: user, isLoading, error } = {
    data: {
      email: 'coovenbm@gmail.com',
      firstName: 'Birzhan',
      lastName: 'Utegenov',
      phone: '+ 7 983 582 6345',
      // avatarSrc: '/images/qvenge.jpeg',
      cashback: {
        value: 2500,
        currency: 'RUB'
      },
      certificates: [
        {
          value: 5000,
          currency: 'RUB',
        }
      ],
      subscriptionCount: 10
    },
    isLoading: false,
    error: null
  }

  if (isLoading) {
    return <div className={styles.wrapper}>Loading...</div>;
  }

  if (error) {
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
          {user.avatarSrc ? (<img 
            src={user.avatarSrc} 
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
        {user.cashback && (
          <div className={styles.statItem}>
            <div className={styles.statLabel}>Кэшбек</div>
            <div className={styles.statValue}>{user.cashback.value} {user.cashback.currency === 'RUB' ? '₽' : '$'}</div>
          </div>
        )}
        {user.subscriptionCount && user.subscriptionCount > 0 &&  (
          <div className={styles.statItem}>
            <div className={styles.statLabel}>Абонемент</div>
            <div className={styles.statValue}>{user.subscriptionCount}</div>
          </div>
        )}
        {user.certificates.length > 0 &&  (
          <div className={styles.statItem}>
            <div className={styles.statLabel}>Сертификат</div>
            <div className={styles.statValue}>{user.certificates[0].value} {user.certificates[0].currency === 'RUB' ? '₽' : '$'}</div>
          </div>
        )}
      </div>

      {/* Menu Items */}
      <div className={styles.menuSection}>{menuItems.map((item, index) => (
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