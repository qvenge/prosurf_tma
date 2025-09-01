import { Modal, type ModalProps, Button, type ButtonProps } from '@/shared/ui';
import type { EventSession, SubscriptionResponse } from '@/shared/api';
import styles from './BookingSelectionModal.module.scss';

export interface BookingSelectionModalProps extends ModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: EventSession;
  subscriptions: SubscriptionResponse[];
  onUseSubscription: () => void;
  onGoToPayment: () => void;
  isRedeeming: boolean;
  isBooking: boolean;
}

export function BookingSelectionModal({ 
  isOpen, 
  onClose, 
  session, 
  subscriptions, 
  onUseSubscription, 
  onGoToPayment,
  isRedeeming,
  isBooking
}: BookingSelectionModalProps) {
  const hasActiveSubscription = subscriptions.some(sub => 
    sub.status === 'ACTIVE' && 
    sub.plan.eventType === session.type && 
    sub.remaining > 0 &&
    new Date(sub.expiresAt) > new Date()
  );

  return (
    <Modal
      open={isOpen}
      onOpenChange={onClose}
      overlayComponent={<Modal.Overlay />}
      header={<Modal.Header>Выберите способ оплаты</Modal.Header>}
    >
      <div className={styles.modalContent}>
        {hasActiveSubscription && (
          <BookingSelectionButon 
            onClick={onUseSubscription}
            disabled={isRedeeming || isBooking}
            loading={isRedeeming}
          >
            Использовать абонемент
          </BookingSelectionButon>
        )}
        {/* TODO: uncomment when api will be ready 
          <BookingSelectionButon>Использовать сертификат</BookingSelectionButon>
        */}
        <BookingSelectionButon 
          onClick={onGoToPayment}
          disabled={isRedeeming || isBooking}
          loading={isBooking}
        >
          Перейти к оплате
        </BookingSelectionButon>
      </div>
    </Modal>
  );
}

function BookingSelectionButon({
  children, 
  onClick, 
  disabled = false, 
  loading = false
}: { 
  children: ButtonProps['children'], 
  onClick?: () => void,
  disabled?: boolean,
  loading?: boolean
}) {
  return (
    <Button
      size='l'
      mode='secondary'
      stretched={true}
      onClick={onClick}
      disabled={disabled}
      loading={loading}
    >
      {children}
    </Button>
  );
}