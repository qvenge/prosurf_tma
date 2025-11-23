import { useState } from 'react';
import styles from './DenominationOptions.module.scss';

interface DenominationOptionsProps {
  selectedAmount: number | null;
  onAmountChange: (amount: number) => void;
  minAmount?: number;
}

const FIXED_DENOMINATIONS = [3000, 5000, 10000];

export function DenominationOptions({
  selectedAmount,
  onAmountChange,
  minAmount = 3000,
}: DenominationOptionsProps) {
  const [customAmount, setCustomAmount] = useState('');
  const [isCustom, setIsCustom] = useState(false);

  const handleFixedDenominationClick = (amount: number) => {
    setIsCustom(false);
    setCustomAmount('');
    onAmountChange(amount);
  };

  const handleCustomClick = () => {
    setIsCustom(true);
    if (customAmount) {
      const amount = parseFloat(customAmount);
      if (!isNaN(amount) && amount >= minAmount) {
        onAmountChange(Math.round(amount));
      }
    }
  };

  const handleCustomAmountChange = (value: string) => {
    // Allow only numbers and one decimal point
    const cleaned = value.replace(/[^\d.]/g, '');
    setCustomAmount(cleaned);

    const amount = parseFloat(cleaned);
    if (!isNaN(amount) && amount >= minAmount) {
      onAmountChange(Math.round(amount));
    }
  };

  const isFixedSelected = (amount: number) => {
    return !isCustom && selectedAmount === amount;
  };

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {FIXED_DENOMINATIONS.map((amount) => (
          <button
            key={amount}
            type="button"
            className={`${styles.card} ${isFixedSelected(amount) ? styles.cardSelected : ''}`}
            onClick={() => handleFixedDenominationClick(amount)}
          >
            <div className={styles.cardAmount}>{(amount).toLocaleString('ru-RU')} ₽</div>
          </button>
        ))}

        <button
          type="button"
          className={`${styles.card} ${styles.cardCustom} ${isCustom ? styles.cardSelected : ''}`}
          onClick={handleCustomClick}
        >
          <div className={styles.cardLabel}>Другая сумма</div>
          {isCustom && (
            <input
              type="text"
              inputMode="decimal"
              className={styles.customInput}
              value={customAmount}
              onChange={(e) => handleCustomAmountChange(e.target.value)}
              placeholder={`от ${minAmount.toLocaleString('ru-RU')} ₽`}
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </button>
      </div>

      {isCustom && customAmount && parseFloat(customAmount) < minAmount && (
        <div className={styles.error}>
          Минимальная сумма: {minAmount.toLocaleString('ru-RU')} ₽
        </div>
      )}
    </div>
  );
}
