import { z } from 'zod';

// Регулярное выражение для российского телефона в формате +7 (XXX) XXX-XX-XX
const phoneRegex = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/;

// Функция для проверки даты в формате DD.MM.YYYY
const parseDateDDMMYYYY = (dateStr: string) => {
  if (!dateStr) return null;

  const [day, month, year] = dateStr.split('.');
  if (!day || !month || !year) return null;

  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

  // Проверяем, что дата валидна
  if (
    date.getDate() !== parseInt(day) ||
    date.getMonth() !== parseInt(month) - 1 ||
    date.getFullYear() !== parseInt(year)
  ) {
    return null;
  }

  return date;
};

export const profileFormSchema = z.object({
  firstName: z
    .string()
    .max(128, 'Имя не должно превышать 128 символов')
    .optional(),

  lastName: z
    .string()
    .max(128, 'Фамилия не должна превышать 128 символов')
    .optional(),

  phone: z
    .string()
    .refine(
      (val) => !val || phoneRegex.test(val),
      'Некорректный формат телефона. Используйте формат: +7 (XXX) XXX-XX-XX'
    )
    .optional(),

  email: z
    .string()
    .refine(
      (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      'Некорректный формат email'
    )
    .optional(),

  dateOfBirth: z
    .string()
    .refine(
      (val) => {
        if (!val) return true; // Пустое значение допустимо
        const date = parseDateDDMMYYYY(val);
        return date !== null;
      },
      'Некорректная дата. Используйте формат: ДД.ММ.ГГГГ'
    )
    .refine(
      (val) => {
        if (!val) return true;
        const date = parseDateDDMMYYYY(val);
        if (!date) return true; // Если дата невалидна, это будет поймано предыдущей проверкой
        return date <= new Date();
      },
      'Дата рождения не может быть в будущем'
    )
    .optional(),
});

export type ProfileFormData = z.infer<typeof profileFormSchema>;

// Функция для получения русских сообщений об ошибках Zod
export const getFieldErrors = (error: z.ZodError<ProfileFormData>): Record<string, string> => {
  const fieldErrors: Record<string, string> = {};

  error.issues.forEach((err: z.ZodIssue) => {
    const field = err.path[0] as string;
    if (field && !fieldErrors[field]) {
      fieldErrors[field] = err.message;
    }
  });

  return fieldErrors;
};
