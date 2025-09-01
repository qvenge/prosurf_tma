import { Icon } from '@/shared/ui';
import { CaretRightBold, UserBold, CalendarBlankBold, ConfettiBold, BarbellBold } from '@/shared/ds/icons';
import { useUserProfile } from '@/shared/api/hooks/use-user';
import styles from './Profile.module.scss';

export const Profile = () => {
  const { data: user, isLoading, error } = useUserProfile();

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
          <img 
            src="/images/avatar.jpg" 
            alt="Profile avatar"
            className={styles.avatarImage}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.parentElement!.style.backgroundColor = '#4A5568';
            }}
          />
          <div className={styles.avatarFallback}>
            <Icon 
              src={UserBold} 
              width={24} 
              height={24} 
              className={styles.avatarIcon}
            />
          </div>
        </div>
        
        <div className={styles.contactInfo}>
          <div className={styles.phone}>+ 7 999 962 70 70</div>
          <div className={styles.email}>{user.email}</div>
        </div>
        
        <button className={styles.editButton}>
          <span className={styles.editIcon}>✏️</span>
        </button>
      </div>

      {/* Status Badge */}
      <div className={styles.statusBadge}>
        <span className={styles.starIcon}>⭐</span>
        Серебряный серфер
        <Icon 
          src={CaretRightBold} 
          width={16} 
          height={16} 
          className={styles.chevron}
        />
      </div>

      {/* Stats Section */}
      <div className={styles.statsSection}>
        <div className={styles.statItem}>
          <div className={styles.statLabel}>Кэшбек</div>
          <div className={styles.statValue}>2 500 ₽</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statLabel}>Абонемент</div>
          <div className={styles.statValue}>10</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statLabel}>Сертификат</div>
          <div className={styles.statValue}>5 000₽</div>
        </div>
      </div>

      {/* Menu Items */}
      <div className={styles.menuSection}>
        <div className={styles.menuItem}>
          <span className={styles.menuIcon}>📅</span>
          <div className={styles.menuContent}>
            <div className={styles.menuTitle}>Мои записи</div>
            <div className={styles.menuSubtitle}>Ближайшее: 4 июля в 21:30</div>
          </div>
          <Icon 
            src={CaretRightBold} 
            width={20} 
            height={20} 
            className={styles.chevron}
          />
        </div>

        <div className={styles.menuItem}>
          <span className={styles.menuIcon}>🕐</span>
          <div className={styles.menuContent}>
            <div className={styles.menuTitle}>Лист ожиданий</div>
            <div className={styles.menuSubtitle}>Доступно: 2/10</div>
          </div>
          <Icon 
            src={CaretRightBold} 
            width={20} 
            height={20} 
            className={styles.chevron}
          />
        </div>

        <div className={styles.menuItem}>
          <span className={styles.menuIcon}>📋</span>
          <div className={styles.menuContent}>
            <div className={styles.menuTitle}>Аттестация ProSurf</div>
            <div className={styles.menuSubtitle}>Что это?</div>
          </div>
          <Icon 
            src={CaretRightBold} 
            width={20} 
            height={20} 
            className={styles.chevron}
          />
        </div>

        <div className={styles.menuItem}>
          <span className={styles.menuIcon}>💸</span>
          <div className={styles.menuContent}>
            <div className={styles.menuTitle}>История покупок</div>
            <div className={styles.menuSubtitle}>5 транзакций</div>
          </div>
          <Icon 
            src={CaretRightBold} 
            width={20} 
            height={20} 
            className={styles.chevron}
          />
        </div>

        <div className={styles.menuItem}>
          <span className={styles.menuIcon}>💬</span>
          <div className={styles.menuContent}>
            <div className={styles.menuTitle}>Поддержка</div>
            <div className={styles.menuSubtitle}>Написать в ТГ</div>
          </div>
          <Icon 
            src={CaretRightBold} 
            width={20} 
            height={20} 
            className={styles.chevron}
          />
        </div>
      </div>

      {/* Footer Links */}
      <div className={styles.footerLinks}>
        <div className={styles.footerLink}>Правила оплаты</div>
        <div className={styles.footerLink}>Правила отмены и возврата</div>
        <div className={styles.footerLink}>Договор офферта</div>
        <div className={styles.footerLink}>Техника безопасности</div>
      </div>

      {/* Developer Attribution */}
      <div className={styles.developerCredit}>
        Разработка приложения: @yalbakov
      </div>
    </div>
  );
};