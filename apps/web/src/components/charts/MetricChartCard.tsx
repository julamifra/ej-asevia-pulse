import { Paper, Text } from "@mantine/core";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { formatMonthLabel } from "../../utils/format";
import classes from "./MetricChartCard.module.css";

type MetricChartCardProps<T extends Record<string, number | string>> = {
  title: string;
  description: string;
  data: T[];
  dataKey?: keyof T;
  color?: string;
  series?: Array<{
    key: keyof T;
    color: string;
    label: string;
    yAxisId?: "left" | "right";
    valueFormatter?: (value: number) => string;
    strokeWidth?: number;
  }>;
  valueFormatter: (value: number) => string;
  axisFormatter?: (value: number) => string;
  rightAxisFormatter?: (value: number) => string;
};

export function MetricChartCard<T extends Record<string, number | string>>({
  title,
  description,
  data,
  dataKey,
  color,
  series,
  valueFormatter,
  axisFormatter,
  rightAxisFormatter
}: MetricChartCardProps<T>) {
  const chartSeries =
    series ??
    (dataKey && color
      ? [
          {
            key: dataKey,
            color,
            label: String(dataKey),
            yAxisId: "left" as const
          }
        ]
      : []);
  const hasRightAxis = chartSeries.some((item) => item.yAxisId === "right");
  const seriesByKey = new Map(chartSeries.map((item) => [String(item.key), item]));

  return (
    <Paper className={classes.card}>
      <Text className={classes.title}>{title}</Text>
      <Text className={classes.description}>{description}</Text>

      <div className={classes.chart}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="mes"
              tickFormatter={(value) => formatMonthLabel(String(value))}
              tick={{ fill: "#64748b", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="left"
              tickFormatter={(value) =>
                axisFormatter ? axisFormatter(Number(value)) : valueFormatter(Number(value))
              }
              tick={{ fill: "#64748b", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={72}
            />
            {hasRightAxis ? (
              <YAxis
                yAxisId="right"
                orientation="right"
                tickFormatter={(value) =>
                  rightAxisFormatter
                    ? rightAxisFormatter(Number(value))
                    : valueFormatter(Number(value))
                }
                tick={{ fill: "#64748b", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={64}
              />
            ) : null}
            <Tooltip
              contentStyle={{ borderRadius: 12, borderColor: "#cbd5e1" }}
              labelFormatter={(label) => formatMonthLabel(String(label))}
              formatter={(value, _name, item) => {
                const seriesItem = seriesByKey.get(String(item.dataKey));

                return [
                  (seriesItem?.valueFormatter ?? valueFormatter)(Number(value)),
                  item.name
                ];
              }}
            />
            {chartSeries.length > 1 ? <Legend /> : null}
            {chartSeries.map((item) => (
              <Line
                key={String(item.key)}
                type="monotone"
                dataKey={String(item.key)}
                name={item.label}
                yAxisId={item.yAxisId ?? "left"}
                stroke={item.color}
                strokeWidth={item.strokeWidth ?? 3}
                dot={false}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Paper>
  );
}
