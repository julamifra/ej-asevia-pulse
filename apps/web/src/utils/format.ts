const currencyFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0
});

const compactFormatter = new Intl.NumberFormat("es-ES", {
  notation: "compact",
  maximumFractionDigits: 1
});

const integerFormatter = new Intl.NumberFormat("es-ES");

export const formatCurrency = (value: number) => currencyFormatter.format(value);

export const formatCompactCurrency = (value: number) => formatCurrency(value).replace(",00", "");

export const formatNumber = (value: number) => integerFormatter.format(value);

export const formatCompactNumber = (value: number) => compactFormatter.format(value);

export const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;

export const formatDecimal = (value: number) => value.toFixed(1);

export const formatMonthLabel = (value: string) =>
  new Intl.DateTimeFormat("es-ES", {
    month: "short",
    year: "numeric"
  }).format(new Date(`${value}T00:00:00.000Z`));

export const formatSignedValue = (
  value: number,
  formatter: (input: number) => string
) => {
  if (value === 0) {
    return formatter(0);
  }

  return `${value > 0 ? "+" : "-"}${formatter(Math.abs(value))}`;
};

export const formatSignedPercent = (value: number) => {
  if (value === 0) {
    return "0,0%";
  }

  return `${value > 0 ? "+" : "-"}${formatPercent(Math.abs(value))}`;
};

export const parsePositiveInt = (value: string | null, fallback: number) => {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};
