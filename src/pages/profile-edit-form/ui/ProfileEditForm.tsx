
import { useMemo, useEffect, useActionState, useState } from 'react';
import { TextInput, Button, useBottomBar } from '@/shared/ui';
import { UploadPhotoInput } from './upload-photo-input';
import styles from './ProfileEditForm.module.scss';
import { useNavigate } from '@/shared/navigation';

import { useCurrentClient } from '@/shared/api';

import { PageLayout } from '@/widgets/page-layout';
import { profileFormSchema, getFieldErrors } from '../lib';

type FormState = {
  success: boolean;
  error?: string;
  message?: string;
  fieldErrors?: Record<string, string>;
};

export const ProfileEditForm = () => {
  // Fetch user profile
  const { user, isLoading, error, updateUser, isUpdating } = useCurrentClient();
  const { setOverride } = useBottomBar();
  const navigate = useNavigate();

  // Track photo deletion state
  const [shouldDeletePhoto, setShouldDeletePhoto] = useState(false);

  // Form action function
  const formAction = async (_prevState: FormState, formData: FormData): Promise<FormState> => {
    try {
      // Extract form fields
      const firstName = formData.get('firstName') as string;
      const lastName = formData.get('lastName') as string;
      const phone = formData.get('phone') as string;
      const email = formData.get('email') as string;
      const dateOfBirth = formData.get('dateOfBirth') as string;
      const photoFile = formData.get('pic_file') as File | null;

      // Validate form data
      const validationResult = profileFormSchema.safeParse({
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        phone: phone || undefined,
        email: email || undefined,
        dateOfBirth: dateOfBirth || undefined,
      });

      if (!validationResult.success) {
        return {
          success: false,
          error: 'Пожалуйста, исправьте ошибки в форме',
          fieldErrors: getFieldErrors(validationResult.error),
        };
      }

      // Prepare update data with only changed fields
      const updateData: Record<string, string | undefined> = {};

      // Helper to check if field was intentionally cleared
      const wasFilledAndCleared = (originalValue: string | null | undefined, newValue: string) => {
        return (originalValue != null && originalValue !== '') && newValue === '';
      };

      // Helper to check if field changed
      const hasChanged = (originalValue: string | null | undefined, newValue: string) => {
        const original = originalValue ?? '';
        return original !== newValue;
      };

      // Process firstName
      if (hasChanged(user?.firstName, firstName)) {
        updateData.firstName = wasFilledAndCleared(user?.firstName, firstName) ? '' : firstName;
      }

      // Process lastName
      if (hasChanged(user?.lastName, lastName)) {
        updateData.lastName = wasFilledAndCleared(user?.lastName, lastName) ? '' : lastName;
      }

      // Process phone
      if (hasChanged(user?.phone, phone)) {
        updateData.phone = wasFilledAndCleared(user?.phone, phone) ? '' : phone;
      }

      // Process email
      if (hasChanged(user?.email, email)) {
        updateData.email = wasFilledAndCleared(user?.email, email) ? '' : email;
      }

      // Process dateOfBirth
      const originalDateStr = user?.dateOfBirth ? (() => {
        const date = new Date(user.dateOfBirth);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
      })() : '';

      if (originalDateStr !== dateOfBirth) {
        if (dateOfBirth) {
          // Parse DD.MM.YYYY format and convert to ISO
          const [day, month, year] = dateOfBirth.split('.');
          const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          updateData.dateOfBirth = date.toISOString();
        } else {
          // Field was cleared - send empty string to reset
          updateData.dateOfBirth = '';
        }
      }

      // Check if there are any changes
      const hasPhotoFile = photoFile && photoFile.size > 0;
      const hasChanges = Object.keys(updateData).length > 0 || hasPhotoFile || shouldDeletePhoto;

      if (!hasChanges) {
        return {
          success: false,
          error: 'Нет изменений для сохранения',
        };
      }

      // Get photo file if it exists and has size > 0
      const photo = hasPhotoFile ? photoFile : undefined;

      // Call update mutation
      await new Promise<void>((resolve, reject) => {
        updateUser(
          { data: updateData, photo, deletePhoto: shouldDeletePhoto },
          {
            onSuccess: () => {
              resolve();
              // Reset deletion flag after successful update
              setShouldDeletePhoto(false);
              navigate('/profile', { reset: true });
            },
            onError: (err) => reject(err),
          }
        );
      });

      return {
        success: true,
        message: 'Профиль успешно обновлен',
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Произошла ошибка при обновлении профиля',
      };
    }
  };

  const [state, submitAction, isPending] = useActionState(formAction, {
    success: false,
  });

  const bottomBarContent = useMemo(() => (
    <div className={styles.bottomBarContent}>
      <Button
        size='l'
        mode='primary'
        stretched={true}
        loading={isPending || isUpdating}
        disabled={isPending || isUpdating || !user}
        type="submit"
        form="profile-edit-form"
      >
        Готово
      </Button>
    </div>
  ), [user, isPending, isUpdating]);

  useEffect(() => {
    setOverride(bottomBarContent);
    return () => setOverride(null);
  }, [setOverride, bottomBarContent]);

  if (isLoading) {
    return <div className={styles.wrapper}>Загрузка</div>;
  }

  if (error) {
    return <div className={styles.wrapper}>Ошибка загрузки профиля</div>;
  }

  if (!user) {
    return <div className={styles.wrapper}>Пользователь не найден</div>;
  }

  return (
    <PageLayout>
      <form id="profile-edit-form" className={styles.wrapper} action={submitAction}>
        <div className={styles.header}>
          <UploadPhotoInput
            name="pic_file"
            disabled={isPending || isUpdating}
            previewInit={user.photoUrl ? {
              src: user.photoUrl,
              alt: 'Фото пользователь'
            } : undefined}
            onDelete={() => setShouldDeletePhoto(true)}
          />
        </div>

        <div className={styles.body}>
          {state.error && !state.fieldErrors && (
            <div className={styles.error}>{state.error}</div>
          )}

          <TextInput
            name="firstName"
            type="text"
            label="Имя"
            defaultValue={user.firstName ?? ''}
            disabled={isPending || isUpdating}
            error={Boolean(state.fieldErrors?.firstName)}
            hint={state.fieldErrors?.firstName}
          />
          <TextInput
            name="lastName"
            type="text"
            label="Фамилия"
            defaultValue={user.lastName ?? ''}
            disabled={isPending || isUpdating}
            error={Boolean(state.fieldErrors?.lastName)}
            hint={state.fieldErrors?.lastName}
          />
          <TextInput
            name="phone"
            type="tel"
            label="Телефон"
            defaultValue={user.phone ?? ''}
            disabled={isPending || isUpdating}
            error={Boolean(state.fieldErrors?.phone)}
            hint={state.fieldErrors?.phone}
          />
          <TextInput
            name="email"
            type="email"
            label="Email"
            defaultValue={user.email ?? ''}
            disabled={isPending || isUpdating}
            error={Boolean(state.fieldErrors?.email)}
            hint={state.fieldErrors?.email}
          />
          <TextInput
            name="dateOfBirth"
            type="date"
            label="Дата рождения"
            defaultValue={user.dateOfBirth ? (() => {
              const date = new Date(user.dateOfBirth);
              const day = String(date.getDate()).padStart(2, '0');
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const year = date.getFullYear();
              return `${day}.${month}.${year}`;
            })() : ''}
            disabled={isPending || isUpdating}
            error={Boolean(state.fieldErrors?.dateOfBirth)}
            hint={state.fieldErrors?.dateOfBirth}
          />
        </div>
      </form>
    </PageLayout>
  );
};