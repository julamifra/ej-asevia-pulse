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
  }>;
  valueFormatter: (value: number) => string;
  axisFormatter?: (value: number) => string;
};

export function MetricChartCard<T extends Record<string, number | string>>({
  title,
  description,
  data,
  dataKey,
  color,
  series,
  valueFormatter,
  axisFormatter
}: MetricChartCardProps<T>) {
  const chartSeries =
    series ??
    (dataKey && color
      ? [
          {
            key: dataKey,
            color,
            label: String(dataKey)
          }
        ]
      : []);

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
              tickFormatter={(value) =>
                axisFormatter ? axisFormatter(Number(value)) : valueFormatter(Number(value))
              }
              tick={{ fill: "#64748b", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={72}
            />
            <Tooltip
              contentStyle={{ borderRadius: 12, borderColor: "#cbd5e1" }}
              labelFormatter={(label) => formatMonthLabel(String(label))}
              formatter={(value, _name, item) => [
                valueFormatter(Number(value)),
                item.name
              ]}
            />
            {chartSeries.length > 1 ? <Legend /> : null}
            {chartSeries.map((item) => (
              <Line
                key={String(item.key)}
                type="monotone"
                dataKey={String(item.key)}
                name={item.label}
                stroke={item.color}
                strokeWidth={3}
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
