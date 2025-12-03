import { useState } from 'react';
import { PageLayout } from '@/widgets/page-layout';
import { useActivateCertificate } from '@/shared/api';
import { Button, TextInput } from '@/shared/ui';
import { pluralize } from '@/shared/lib';
import { useNavigator } from '@/shared/navigation';
import styles from './CertificateActivationPage.module.scss';

export function CertificateActivationPage() {
  const [error, setError] = useState<null | string>(null);
  const [code, setCode] = useState('');
  const activateCertificate = useActivateCertificate();
  const navigator = useNavigator();

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCode(e.target.value);
    setError(null);
  };

  const handleActivateClick = () => {
    // Placeholder for activation logic
    if (code.trim() === '') {
      setError('Пожалуйста, введите корректный код.');
      return;
    }

    activateCertificate.mutate(code, {
      onError: (error: any) => {
        setError(error.message || 'Ошибка активации сертификата');
      },
      onSuccess: (res) => {
        setError(null);
        setCode('');
        const title = 'Сертификат активирован';

        let desc = '';

        if (res.result.type === 'bonus') {
          desc = `Зачислили на бонусный счёт ${res.result.bonusOperation.amount} ₽`;

        } else if (res.result.type === 'season_ticket') {
          desc = `Добавили абонемент на ${res.result.seasonTicket.remainingPasses} ${pluralize(
            res.result.seasonTicket.remainingPasses, ['тренировку', 'тренировки', 'тренировок']
          )}`;
        }

        navigator.replace(
          `/payment-success?type=certificate-activation` + 
          `&title=${encodeURIComponent(title)}` +
          `&description=${encodeURIComponent(desc)}` +
          `&primaryButton=${encodeURIComponent(JSON.stringify({text: "В профиль", link: "/profile"}))}` +
          `&primaryButton=${encodeURIComponent(JSON.stringify({text: "На главную", link: "/"}))}`
        );
      },
    });
  };

  return (
    <PageLayout title="Сертификат">
      <div className={styles.wrapper}>
        <form className={styles.form}>
          <TextInput
            label="Код"
            placeholder="Введите код для активации"
            value={code}
            onChange={handleCodeChange}
            error={!!error}
            hint={error ? String(error) : undefined}
          />
        </form>
        <Button
          mode="primary"
          size="l"
          stretched
          style={{ flexGrow: 0 }}
          onClick={handleActivateClick}
        >
          Активировать
        </Button>
      </div>
    </PageLayout>
  );
}
