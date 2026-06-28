import { SimpleGrid } from "@mantine/core";

import type { SummaryComparison, SummaryCurrent } from "../../types/api";
import {
  formatCurrency,
  formatMonthLabel,
  formatNumber,
  formatPercent,
  formatSignedPercent,
  formatSignedValue,
  getDeltaTone
} from "../../utils/format";
import { KpiCard } from "../KpiCards/KpiCard";
import classes from "./SummaryKpiGrid.module.css";

type SummaryKpiGridProps = {
  className?: string;
  comparison: SummaryComparison | null;
  current: SummaryCurrent;
  hints: {
    clientesActivos: string;
    facturacionTotal: string;
    satisfaccion: string;
  };
  isUpdating?: boolean;
};

export function SummaryKpiGrid({
  className,
  comparison,
  current,
  hints,
  isUpdating = false
}: SummaryKpiGridProps) {
  const gridClassName = [classes.root, className, isUpdating ? classes.updating : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} className={gridClassName}>
      <KpiCard
        label="Clientes activos"
        value={formatNumber(current.clientesActivos)}
        hint={hints.clientesActivos}
        delta={
          comparison
            ? {
                value: formatSignedValue(comparison.clientesActivosDelta, formatNumber),
                label: `vs ${formatMonthLabel(comparison.againstMonth)}`,
                tone: getDeltaTone(comparison.clientesActivosDelta)
              }
            : null
        }
      />
      <KpiCard
        label="Facturacion total"
        value={formatCurrency(current.facturacionTotal)}
        hint={hints.facturacionTotal}
        delta={
          comparison
            ? {
                value: formatSignedValue(comparison.facturacionTotalDelta, formatCurrency),
                label: `vs ${formatMonthLabel(comparison.againstMonth)}`,
                tone: getDeltaTone(comparison.facturacionTotalDelta)
              }
            : null
        }
      />
      <KpiCard
        label="Total declaraciones"
        value={formatNumber(current.totalDeclaraciones)}
        hint="Suma mensual de declaracion IRPF, IVA, Impuesto Sociedades y otras."
        delta={
          comparison
            ? {
                value: formatSignedValue(comparison.totalDeclaracionesDelta, formatNumber),
                label: `vs ${formatMonthLabel(comparison.againstMonth)}`,
                tone: getDeltaTone(comparison.totalDeclaracionesDelta)
              }
            : null
        }
      />
      <KpiCard
        label="Tasa de resolucion"
        value={formatPercent(current.tasaResolucion)}
        hint="Consultas resueltas sobre consultas recibidas"
        delta={
          comparison
            ? {
                value: formatSignedPercent(comparison.tasaResolucionDelta),
                label: `vs ${formatMonthLabel(comparison.againstMonth)}`,
                tone: getDeltaTone(comparison.tasaResolucionDelta)
              }
            : null
        }
      />
      <KpiCard
        label="Satisfaccion"
        value={current.satisfaccionCliente.toFixed(1)}
        hint={hints.satisfaccion}
        delta={
          comparison
            ? {
                value: formatSignedValue(comparison.satisfaccionClienteDelta, (value) =>
                  value.toFixed(1)
                ),
                label: `vs ${formatMonthLabel(comparison.againstMonth)}`,
                tone: getDeltaTone(comparison.satisfaccionClienteDelta)
              }
            : null
        }
      />
    </SimpleGrid>
  );
}
