import styles from './MyCertificatesPage.module.scss';
import { PageLayout } from '@/widgets/page-layout';
import { Button, Spinner } from '@/shared/ui';
import { useNavigate } from '@/shared/navigation';
import { useCertificateProducts } from '@/shared/api';
import { formatPrice } from '@/shared/lib/format-utils';

export function MyCertificatesPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useCertificateProducts();

  const handlePurchaseClick = () => {
    navigate('/certificates/purchase');
  };

  const handleActivateClick = () => {
    navigate('certificates/activate');
  };

  const passesProduct = data?.items.find(item => item.type === 'passes');
  const denominationProduct = data?.items.find(item => item.type === 'denomination');

  return (
    <PageLayout title="Сертификат">
      <div className={styles.wrapper}>
        <div className={styles.offers}>
          <h2 className={styles.title}>Предложения по Сертификатам</h2>

          {isLoading ? (
            <div className={styles.loading}>
              <Spinner size="m" />
            </div>
          ) : (
            <>
              {passesProduct && (
                <div className={styles.card}>
                  <div className={styles.cardInfo}>
                    <div className={styles.cardTitle}>Сертификат</div>
                    <div className={styles.cardSubtitle}>Разовая тренировка по серфингу</div>
                  </div>
                  <div className={styles.cardPrice}>
                    {formatPrice(passesProduct.price)}
                  </div>
                </div>
              )}

              {denominationProduct && (
                <div className={styles.card}>
                  <div className={styles.cardInfo}>
                    <div className={styles.cardTitle}>Сертификат</div>
                    <div className={styles.cardSubtitle}>Номинал</div>
                  </div>
                  <div className={styles.cardPrice}>
                    {denominationProduct.minAmount
                      ? `от ${formatPrice(denominationProduct.minAmount)}`
                      : 'Любая сумма'}
                  </div>
                </div>
              )}
            </>
          )}
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