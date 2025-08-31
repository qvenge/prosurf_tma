import { Modal, type ModalProps, Button } from '@/shared/ui';
import styles from './BookingSelectionModal.module.scss';

export interface BookingSelectionModalProps extends ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BookingSelectionModal({ isOpen, onClose }: BookingSelectionModalProps) {
  return (
    <Modal
      open={isOpen}
      onOpenChange={onClose}
    >
      <div className={styles.modalContent}>
        <Button size='l' mode='filled' stretched={true}>Использовать абонемент</Button>
        <Button size='l' mode='filled' stretched={true}>Использовать сертификат</Button>
        <Button size='l' mode='filled' stretched={true}>Перейти к оплате</Button>
      </div>
    </Modal>
  );
}