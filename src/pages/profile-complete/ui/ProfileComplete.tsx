import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useCompleteProfile, useContents } from '@/shared/api';
import { TextInput } from '@/shared/ui/text-input';
import { Button, ButtonContainer, MarkdownRenderer, Spinner } from '@/shared/ui';
import { PageLayout } from '@/widgets/page-layout'
import { Modal, Checkbox } from '@/shared/ui';
import type { CompleteProfileDto } from '@/shared/api/types';
import styles from './ProfileComplete.module.scss';

/**
 * Profile completion page for first-time users
 *
 * Requires users to provide:
 * - Full name (firstName, lastName)
 * - Phone number
 * - All required consents (fetched dynamically from CMS)
 */
export const ProfileComplete = () => {
  const navigate = useNavigate();
  const { mutate: completeProfile, isPending, error: apiError } = useCompleteProfile();

  // Fetch ALL consent content items dynamically
  const { data: consentData, isLoading: isLoadingConsents } = useContents({ keyPrefix: 'consent.' });
  const consentItems = consentData?.items ?? [];

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  // Dynamic consents state: { 'consent.personalData': false, 'consent.privacyPolicy': false, ... }
  const [consents, setConsents] = useState<Record<string, boolean>>({});

  // Initialize consents when content loads
  useEffect(() => {
    if (consentItems.length > 0 && Object.keys(consents).length === 0) {
      const initialConsents: Record<string, boolean> = {};
      consentItems.forEach(item => {
        initialConsents[item.key] = false;
      });
      setConsents(initialConsents);
    }
  }, [consentItems, consents]);

  // Modal state for viewing consent text
  const [activeConsentKey, setActiveConsentKey] = useState<string | null>(null);
  const activeConsent = consentItems.find(c => c.key === activeConsentKey);

  // Form validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = useCallback((): boolean => {
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

    // Validate all consents are accepted
    consentItems.forEach(item => {
      if (!consents[item.key]) {
        newErrors[item.key] = 'Необходимо принять согласие';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [firstName, lastName, phone, consents, consentItems]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const data: CompleteProfileDto = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      consents, // Dynamic consents object
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

  const handleConsentChange = (key: string, checked: boolean) => {
    setConsents(prev => ({ ...prev, [key]: checked }));
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
            {isLoadingConsents ? (
              <div className={styles.loadingConsents}>
                <Spinner size="m" />
              </div>
            ) : (
              consentItems.map(item => (
                <div key={item.key}>
                  <div className={`${styles.consent} ${errors[item.key] ? styles.consentError : ''}`}>
                    <Checkbox
                      type="checkbox"
                      checked={consents[item.key] || false}
                      onChange={(e) => handleConsentChange(item.key, e.target.checked)}
                      disabled={isPending}
                      className={styles.checkbox}
                    />
                    <ButtonContainer
                      className={styles.consentLink}
                      onClick={() => setActiveConsentKey(item.key)}
                    >
                      {item.title}
                    </ButtonContainer>
                  </div>
                  {errors[item.key] && (
                    <div className={styles.consentErrorText}>{errors[item.key]}</div>
                  )}
                </div>
              ))
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
          disabled={isPending || isLoadingConsents}
          onClick={handleSubmit}
        >
          Готово
        </Button>
      </div>

      {activeConsent && (
        <Modal
          open={true}
          onOpenChange={(open) => !open && setActiveConsentKey(null)}
          header={<Modal.Header />}
        >
          <div className={styles.modalContent}>
            <h2 className={styles.consentTextTitle}>{activeConsent.title}</h2>
            <MarkdownRenderer
              content={activeConsent.content || ''}
              className={styles.consentTextContent}
            />
          </div>
        </Modal>
      )}
    </PageLayout>
  );
};
