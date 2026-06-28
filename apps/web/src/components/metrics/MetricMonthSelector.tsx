import { Button, Select, Stack } from "@mantine/core";

import classes from "./MetricMonthSelector.module.css";

const months = [
  { value: 1, label: "Ene" },
  { value: 2, label: "Feb" },
  { value: 3, label: "Mar" },
  { value: 4, label: "Abr" },
  { value: 5, label: "May" },
  { value: 6, label: "Jun" },
  { value: 7, label: "Jul" },
  { value: 8, label: "Ago" },
  { value: 9, label: "Sep" },
  { value: 10, label: "Oct" },
  { value: 11, label: "Nov" },
  { value: 12, label: "Dic" }
];

type MetricMonthSelectorProps = {
  availableMonthsByYear: Map<string, Set<number>>;
  onMonthChange: (month: number) => void;
  onYearChange: (value: string | null) => void;
  selectedMonth: number | null;
  selectedYear: string | null;
  yearOptions: Array<{ value: string; label: string }>;
};

export function MetricMonthSelector({
  availableMonthsByYear,
  onMonthChange,
  onYearChange,
  selectedMonth,
  selectedYear,
  yearOptions
}: MetricMonthSelectorProps) {
  return (
    <Stack gap="sm" className={classes.root}>
      <Select label="Año" data={yearOptions} value={selectedYear} onChange={onYearChange} w={180} />

      <div className={classes.monthButtons}>
        {months.map((month) => {
          const isAvailable = selectedYear
            ? availableMonthsByYear.get(selectedYear)?.has(month.value) ?? false
            : false;

          return (
            <Button
              key={month.value}
              size="xs"
              variant={selectedMonth === month.value ? "filled" : "light"}
              color={selectedMonth === month.value ? "teal" : "gray"}
              disabled={!isAvailable}
              onClick={() => onMonthChange(month.value)}
            >
              {month.label}
            </Button>
          );
        })}
      </div>
    </Stack>
  );
}
