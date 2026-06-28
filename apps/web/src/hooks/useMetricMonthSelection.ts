import { useEffect, useMemo, useState } from "react";

import type { MetricPoint } from "../types/api";

export function useMetricMonthSelection(metrics: MetricPoint[]) {
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  const availableMonthsByYear = useMemo(() => {
    const result = new Map<string, Set<number>>();

    for (const item of metrics) {
      const year = item.mes.slice(0, 4);
      const month = Number.parseInt(item.mes.slice(5, 7), 10);
      const existing = result.get(year) ?? new Set<number>();
      existing.add(month);
      result.set(year, existing);
    }

    return result;
  }, [metrics]);

  const yearOptions = useMemo(
    () => [...availableMonthsByYear.keys()].sort().map((year) => ({ value: year, label: year })),
    [availableMonthsByYear]
  );

  useEffect(() => {
    if (metrics.length === 0) {
      return;
    }

    const latest = metrics[metrics.length - 1];
    const latestYear = latest.mes.slice(0, 4);
    const latestMonth = Number.parseInt(latest.mes.slice(5, 7), 10);
    const selectedYearMonths = selectedYear ? availableMonthsByYear.get(selectedYear) : undefined;

    if (!selectedYear || !selectedMonth || !selectedYearMonths?.has(selectedMonth)) {
      setSelectedYear(latestYear);
      setSelectedMonth(latestMonth);
    }
  }, [availableMonthsByYear, metrics, selectedMonth, selectedYear]);

  const handleYearChange = (value: string | null) => {
    if (!value) {
      return;
    }

    setSelectedYear(value);
    const latestAvailableMonth = Math.max(...(availableMonthsByYear.get(value) ?? new Set<number>()));
    setSelectedMonth(Number.isFinite(latestAvailableMonth) ? latestAvailableMonth : null);
  };

  return {
    availableMonthsByYear,
    hasSelectedMonth: selectedYear !== null && selectedMonth !== null,
    handleYearChange,
    selectedMonth,
    selectedYear,
    setSelectedMonth,
    yearOptions
  };
}
