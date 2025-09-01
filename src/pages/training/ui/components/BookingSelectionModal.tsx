import { Modal, type ModalProps, Button, type ButtonProps } from '@/shared/ui';
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
      overlayComponent={<Modal.Overlay />}
      header={<Modal.Header>Only iOS header</Modal.Header>}
    >
      <div className={styles.modalContent}>
        <BookingSelectionButon>Использовать абонемент</BookingSelectionButon>
        <BookingSelectionButon>Использовать сертификат</BookingSelectionButon>
        <BookingSelectionButon>Перейти к оплате</BookingSelectionButon>
      </div>
    </Modal>
  );
}

function BookingSelectionButon({children, onClick}: { children: ButtonProps['children'], onClick?: () => void }) {
  return (
    <Button
      size='l'
      mode='secondary'
      stretched={true}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}