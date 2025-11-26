import styles from './MyCertificatesPage.module.scss';
import { PageLayout } from '@/widgets/page-layout';
import { Button } from '@/shared/ui';
import { useNavigate } from '@/shared/navigation';

export function MyCertificatesPage() {
  const navigate = useNavigate();

  const handlePurchaseClick = () => {
    navigate('/certificates/purchase');
  };

  const handleActivateClick = () => {
    navigate('certificates/activate');
  };

  return (
    <PageLayout title="Сертификат">
      <div className={styles.wrapper}>
        <div className={styles.offers}>
          <h2 className={styles.title}>Предложения по Сертификатам</h2>

          {/* Разовая тренировка */}
          <div className={styles.card}>
            <div className={styles.cardInfo}>
              <div className={styles.cardTitle}>Сертификат</div>
              <div className={styles.cardSubtitle}>Разовая тренировка по серфингу</div>
            </div>
            <div className={styles.cardPrice}>7 900 ₽</div>
          </div>

          {/* Номинал */}
          <div className={styles.card}>
            <div className={styles.cardInfo}>
              <div className={styles.cardTitle}>Сертификат</div>
              <div className={styles.cardSubtitle}>Номинал</div>
            </div>
            <div className={styles.cardPrice}>от 3 000 ₽</div>
          </div>
        </div>

        <div className={styles.actions}>
          <Button
            mode="primary"
            size="l"
            stretched
            onClick={handlePurchaseClick}
          >
            Купить
          </Button>
          <Button
            mode="secondary"
            size="l"
            stretched
            onClick={handleActivateClick}
          >
            Активировать
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}