export const formatDate = (date: Date) => date.toISOString().slice(0, 10);

export const subtractMonths = (value: string, months: number) => {
  const date = new Date(`${value}T00:00:00.000Z`);
  date.setUTCMonth(date.getUTCMonth() - months);
  return formatDate(date);
};
