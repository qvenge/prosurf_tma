
import { useMemo, useEffect, useActionState, useState } from 'react';
import { TextInput, Button, useBottomBar } from '@/shared/ui';
import { UploadPhotoInput } from './upload-photo-input';
import styles from './ProfileEditForm.module.scss';

import { useCurrentUserProfile } from '@/shared/api';

import { PageLayout } from '@/widgets/page-layout';

type FormState = {
  success: boolean;
  error?: string;
  message?: string;
};

export const ProfileEditForm = () => {
  // Fetch user profile
  const { user, isLoading, error, updateUser, isUpdating } = useCurrentUserProfile();
  const { setOverride } = useBottomBar();

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

      // Prepare update data with all fields (including empty for deletion)
      const updateData: Record<string, string | undefined> = {};

      // Always include fields (empty string deletes the field)
      updateData.firstName = firstName || '';
      updateData.lastName = lastName || '';
      updateData.phone = phone || '';
      updateData.email = email || '';

      // Handle dateOfBirth
      if (dateOfBirth) {
        // Parse DD.MM.YYYY format
        const [day, month, year] = dateOfBirth.split('.');
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        updateData.dateOfBirth = date.toISOString();
      } else {
        updateData.dateOfBirth = '';
      }

      // Get photo file if it exists and has size > 0
      const photo = photoFile && photoFile.size > 0 ? photoFile : undefined;

      // Call update mutation
      await new Promise<void>((resolve, reject) => {
        updateUser(
          { data: updateData, photo, deletePhoto: shouldDeletePhoto },
          {
            onSuccess: () => {
              resolve();
              // Reset deletion flag after successful update
              setShouldDeletePhoto(false);
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
          {state.error && (
            <div className={styles.error}>{state.error}</div>
          )}
          {state.success && state.message && (
            <div className={styles.success}>{state.message}</div>
          )}

          <TextInput
            name="firstName"
            type="text"
            label="Имя"
            defaultValue={user.firstName ?? ''}
            disabled={isPending || isUpdating}
          />
          <TextInput
            name="lastName"
            type="text"
            label="Фамилия"
            defaultValue={user.lastName ?? ''}
            disabled={isPending || isUpdating}
          />
          <TextInput
            name="phone"
            type="tel"
            label="Телефон"
            defaultValue={user.phone ?? ''}
            disabled={isPending || isUpdating}
          />
          <TextInput
            name="email"
            type="email"
            label="Email"
            defaultValue={user.email ?? ''}
            disabled={isPending || isUpdating}
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
          />
        </div>
      </form>
    </PageLayout>
  );
};