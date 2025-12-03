import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useCompleteProfile } from '@/shared/api';
import { TextInput } from '@/shared/ui/text-input';
import { Button, ButtonContainer } from '@/shared/ui';
import { PageLayout } from '@/widgets/page-layout'
import { Modal, Checkbox } from '@/shared/ui';
import type { CompleteProfileDto } from '@/shared/api/types';
import styles from './ProfileComplete.module.scss';
import { SOGLASIE, TEHNIKA } from './docs';

/**
 * Profile completion page for first-time users
 *
 * Requires users to provide:
 * - Full name (firstName, lastName)
 * - Phone number
 * - All required consents
 */
export const ProfileComplete = () => {
  const navigate = useNavigate();
  const { mutate: completeProfile, isPending, error: apiError } = useCompleteProfile();

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [consents, setConsents] = useState({
    personalData: false,
    privacyPolicy: false,
    safetyRules: false,
  });

  // Modal state for consent texts
  const [activeModal, setActiveModal] = useState<'personalData' | 'privacyPolicy' | 'safetyRules' | null>(null);

  // Form validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) {
      newErrors.firstName = 'Введите имя';
    }
    if (!lastName.trim()) {
      newErrors.lastName = 'Введите фамилию';
    }
    if (!phone.trim()) {
      newErrors.phone = 'Введите номер телефона';
    }
    if (!consents.personalData) {
      newErrors.personalDataConsent = 'Необходимо принять согласие';
    }
    if (!consents.privacyPolicy) {
      newErrors.privacyPolicyConsent = 'Необходимо принять согласие';
    }
    if (!consents.safetyRules) {
      newErrors.safetyRulesConsent = 'Необходимо принять согласие';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const data: CompleteProfileDto = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      personalDataConsent: consents.personalData,
      privacyPolicyConsent: consents.privacyPolicy,
      safetyRulesConsent: consents.safetyRules,
    };

    completeProfile(data, {
      onSuccess: () => {
        navigate('/', { replace: true });
      },
      onError: (error) => {
        console.error('Failed to complete profile:', error);
      },
    });
  }, [firstName, lastName, phone, consents, validateForm, completeProfile, navigate]);

  const getConsentText = (type: 'personalData' | 'privacyPolicy' | 'safetyRules'): { title: string; content: string } => {
    switch (type) {
      case 'personalData':
        return {
          title: 'Согласие на обработку персональных данных',
          content: SOGLASIE,
        };
      case 'privacyPolicy':
        return {
          title: 'Политика конфиденциальности',
          content: 'Я ознакомлен(а) с политикой конфиденциальности и принимаю её условия.\n\nПолитика конфиденциальности определяет порядок сбора, хранения и использования персональных данных пользователей.',
        };
      case 'safetyRules':
        return {
          title: 'Техника безопасности',
          content: TEHNIKA,
        };
    }
  };

  return (
    <PageLayout>
      <div className={styles.wrapper}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <h2 className={styles.sectionTitle}>Укажите актуальные личные данные</h2>

          <div className={styles.section}>
            <TextInput
              type="text"
              name="firstName"
              label="Имя"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              error={!!errors.firstName}
              hint={errors.firstName}
              disabled={isPending}
            />

            <TextInput
              type="text"
              name="lastName"
              label="Фамилия"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              error={!!errors.lastName}
              hint={errors.lastName}
              disabled={isPending}
            />

            <TextInput
              type="tel"
              name="phone"
              label="Телефон"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              error={!!errors.phone}
              hint={errors.phone}
              disabled={isPending}
            />
          </div>
          
          <h2 className={styles.sectionTitle}>Я даю согласие</h2>

          <div className={styles.section}>
            <div className={`${styles.consent} ${errors.personalDataConsent ? styles.consentError : ''}`}>
              <Checkbox
                type="checkbox"
                checked={consents.personalData}
                onChange={(e) => setConsents({ ...consents, personalData: e.target.checked })}
                disabled={isPending}
                className={styles.checkbox}
              />
              <ButtonContainer
                className={styles.consentLink}
                onClick={() => setActiveModal('personalData')}
              >
                Политика конфиденциальности
              </ButtonContainer>
            </div>
            {errors.personalDataConsent && (
              <div className={styles.consentErrorText}>{errors.personalDataConsent}</div>
            )}

            <div className={`${styles.consent} ${errors.privacyPolicyConsent ? styles.consentError : ''}`}>
              <Checkbox
                type="checkbox"
                checked={consents.privacyPolicy}
                onChange={(e) => setConsents({ ...consents, privacyPolicy: e.target.checked })}
                disabled={isPending}
                className={styles.checkbox}
              />
              <ButtonContainer
                className={styles.consentLink}
                onClick={() => setActiveModal('privacyPolicy')}
              >
                Согласие на обработку персональных данных
              </ButtonContainer>
            </div>
            {errors.privacyPolicyConsent && (
              <div className={styles.consentErrorText}>{errors.privacyPolicyConsent}</div>
            )}

            <div className={`${styles.consent} ${errors.safetyRulesConsent ? styles.consentError : ''}`}>
              <Checkbox
                type="checkbox"
                checked={consents.safetyRules}
                onChange={(e) => setConsents({ ...consents, safetyRules: e.target.checked })}
                disabled={isPending}
                className={styles.checkbox}
              />
              <ButtonContainer
                className={styles.consentLink}
                onClick={() => setActiveModal('safetyRules')}
              >
                Техника безопасности
              </ButtonContainer>
            </div>
            {errors.safetyRulesConsent && (
              <div className={styles.consentErrorText}>{errors.safetyRulesConsent}</div>
            )}
          </div>

          {apiError && (
            <div className={styles.apiError}>
              Произошла ошибка при сохранении данных. Попробуйте еще раз.
            </div>
          )}
        </form>

        <Button
          type="submit"
          mode="primary"
          size="l"
          stretched
          loading={isPending}
          disabled={isPending}
          onClick={handleSubmit}
        >
          Готово
        </Button>
      </div>

      {activeModal && (
        <Modal
          open={true}
          onOpenChange={(open) => !open && setActiveModal(null)}
          header={<Modal.Header />}
        >
          <div className={styles.modalContent}>
            <h2 className={styles.consentTextTitle}>{getConsentText(activeModal).title}</h2>
            <p className={styles.consentTextContent}>
              {getConsentText(activeModal).content}
            </p>
          </div>
        </Modal>
      )}
    </PageLayout>
  );
};
