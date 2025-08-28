export const getCurrentAndNextMonth = () => {
  const now = new Date();
  const currentMonth = now.toLocaleDateString('ru-RU', { month: 'long' });
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1).toLocaleDateString('ru-RU', { month: 'long' });
  return {
    current: currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1),
    next: nextMonth.charAt(0).toUpperCase() + nextMonth.slice(1)
  };
};

export const getMonthDateRange = (monthName: string) => {
  const now = new Date();
  const currentMonthName = now.toLocaleDateString('ru-RU', { month: 'long' });
  const isCurrentMonth = monthName.toLowerCase() === currentMonthName;
  
  const targetDate = isCurrentMonth ? now : new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth();
  
  const dateFrom = new Date(year, month, 1).toISOString();
  const dateTo = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
  
  return { dateFrom, dateTo };
};