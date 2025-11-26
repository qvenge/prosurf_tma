import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { TextInput } from '@/shared/ui';
import styles from './DenominationOptions.module.scss';

interface DenominationOptionsProps {
  selectedAmount: number | null;
  onAmountChange: (amount: number) => void;
  minAmount?: number;
}

const options = [
  { id: '3000', label: '3000 ₽', value: 3000 },
  { id: '5000', label: '5000 ₽', value: 5000 },
  { id: '10000', label: '10000 ₽', value: 10000 },
  { id: 'custom', label: 'Другая' },
];

export function DenominationOptions({
  selectedAmount,
  onAmountChange,
  minAmount = 3000,
}: DenominationOptionsProps) {
  const [selected, setSelected] = useState<string>(options.find(option => option.value === selectedAmount)?.id || options[0].id);
  const [customAmount, setCustomAmount] = useState<string>('');
  const isCustom = selected === 'custom';
  const isAmountValid = !isCustom || (Boolean(customAmount) && parseFloat(customAmount) >= minAmount);

  useEffect(() => {
    let value;

    if (selected === 'custom') {
        const amount = parseFloat(customAmount);

      if (!isNaN(amount) && amount >= minAmount) {
        value = Math.round(amount);
      }
    } else {
      value = options.find(opt => opt.id === selected)?.value;
    }

    if (value != null && value !== selectedAmount) {
      onAmountChange(value);
    }
  }, [selected, customAmount]);

  const handleOptionClick = (id: string) => {
    setSelected(id);
  };

  const handleCustomAmountChange = (value: string) => {
    // Allow only numbers and one decimal point
    const cleaned = value.replace(/[^\d.]/g, '');
    setCustomAmount(cleaned);
  };

  return (
    <div className={styles.container}>
      <div className={styles.options}>
        {options.map(({id, label, value}) => (
          <button
            key={value}
            type="button"
            className={clsx(styles.card, id === selected && styles.cardSelected)}
            onClick={() => handleOptionClick(id)}
          >
            <div className={styles.cardLabel}>{label}</div>
          </button>
        ))}
      </div>

      {isCustom && (
        <TextInput
          type="text"
          inputMode="decimal"
          className={styles.customInput}
          value={customAmount}
          onChange={(e) => handleCustomAmountChange(e.target.value)}
          placeholder={`от ${minAmount.toLocaleString('ru-RU')} ₽`}
          autoFocus
          error={!isAmountValid}
          hint={!isAmountValid ? `Минимальная сумма: ${minAmount.toLocaleString('ru-RU')} ₽` : undefined}
          onClick={(e) => e.stopPropagation()}
        />
      )}
    </div>
  );
}
