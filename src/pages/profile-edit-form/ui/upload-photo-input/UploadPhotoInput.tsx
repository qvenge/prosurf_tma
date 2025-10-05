'use client';

import clsx from 'clsx';
import { useRef, useState } from 'react';

import { Icon, ButtonContainer } from '@/shared/ui';
import { CameraRegular } from '@/shared/ds/icons';

import styles from './UploadPhotoInput.module.scss';

type InptyProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'accept' | 'ref'>

export interface UploadPhotoInputProps extends InptyProps {
  previewInit?: {
    src: string;
    alt: string;
  }
  onDelete?: () => void;
}

export function UploadPhotoInput({
  className,
  previewInit,
  onDelete,
  ...inputProps
}: UploadPhotoInputProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [showPreviewSrc, setShowPreviewSrc] = useState(previewInit != null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file); // Превращает файл в base64 для предпросмотра
      setShowPreviewSrc(false);
    }
  };


  const handleEditClick = () => {
    fileInputRef.current?.click();
  }
  const handleRemoveClick = () => {
    setPreview(null);
    setShowPreviewSrc(false);

    if (fileInputRef.current) {
      // @ts-expect-error - удобный способ очистить инпут
      fileInputRef.current.value = '';
    }

    // Notify parent about deletion
    onDelete?.();
  }

  return (
    <div ref={ref} className={clsx(
      className,
      styles.root,
      inputProps.disabled && styles.disabled
    )}>
      <input
        {...inputProps}
        className={styles.input}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/bmp,image/avif,image/heic"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <div className={styles.preview}>
        {showPreviewSrc && previewInit ? (
          <img
            className={styles.previewImg}
            src={previewInit.src}
            alt={previewInit.alt}
          />
        ) : (
          preview ? (
            <img
              className={styles.previewImg}
              src={preview}
              alt="preview"
            />  
          ) : (
            <Icon
              // className={styles.previewImg}
              src={CameraRegular}
              width={36}
              height={36}
            />
          )
        )}
      </div>

      <div className={styles.controls}>
        <ButtonContainer
          onClick={handleEditClick}
        >
          <div className={clsx(styles.control, styles.controlSelect)}>
            Выбрать фотографию
          </div>
        </ButtonContainer>
        <ButtonContainer
          onClick={handleRemoveClick}
        >
          <div className={clsx(styles.control, styles.controlRemove)}>
            Удалить
          </div>
        </ButtonContainer>
      </div>
    </div>
  );
}