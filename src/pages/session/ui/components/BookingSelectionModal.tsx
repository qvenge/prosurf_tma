import { Modal, type ModalProps, Button, type ButtonProps } from '@/shared/ui';
import type { Session, SeasonTicket } from '@/shared/api';
import styles from './BookingSelectionModal.module.scss';

export interface BookingSelectionModalProps extends ModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: Session;
  seasonTickets: SeasonTicket[];
  onUseSubscription: (seasonTicketId: string) => void;
  onGoToPayment: () => void;
  isRedeeming: boolean;
  isBooking: boolean;
}

export function BookingSelectionModal({
  isOpen,
  onClose,
  session: _session,
  seasonTickets,
  onUseSubscription,
  onGoToPayment,
  isRedeeming,
  isBooking
}: BookingSelectionModalProps) {
  const activeSeasonTicket = seasonTickets.find((ticket) =>
    ticket.status === 'ACTIVE' &&
    // TODO: Check if subscription applies to this event type once plan details are available
    ticket.remainingPasses > 0 &&
    (ticket.validUntil ? new Date(ticket.validUntil) > new Date() : true)
  );

  const handleUseSubscription = () => {
    if (activeSeasonTicket) {
      onUseSubscription(activeSeasonTicket.id);
    }
  };

  return (
    <Modal
      open={isOpen}
      onOpenChange={onClose}
      overlayComponent={<Modal.Overlay />}
      header={<Modal.Header />}
    >
      <div className={styles.modalContent}>
        {activeSeasonTicket && (
          <BookingSelectionButon
            onClick={handleUseSubscription}
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