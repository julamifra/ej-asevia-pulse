import { Paper, Text } from "@mantine/core";

import classes from "./KpiCard.module.css";

type Delta = {
  label: string;
  value: string;
  tone: "positive" | "negative" | "neutral";
};

type KpiCardProps = {
  label: string;
  value: string;
  hint?: string;
  delta?: Delta | null;
};

export function KpiCard({ label, value, hint, delta }: KpiCardProps) {
  const deltaClass = delta
    ? {
        positive: classes.deltaPositive,
        negative: classes.deltaNegative,
        neutral: classes.deltaNeutral
      }[delta.tone]
    : "";

  return (
    <Paper className={classes.card}>
      <Text className={classes.label}>{label}</Text>
      <Text className={classes.value}>{value}</Text>
      <Text className={classes.hint}>{hint ?? " "}</Text>

      {delta ? (
        <span className={`${classes.delta} ${deltaClass}`.trim()}>
          <span>{delta.value}</span>
          <span>{delta.label}</span>
        </span>
      ) : null}
    </Paper>
  );
}
