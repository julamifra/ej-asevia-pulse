import { SimpleGrid } from "@mantine/core";

import { MetricChartCard } from "../../components/charts/MetricChartCard";
import { KpiCard } from "../../components/data-display/KpiCard";
import { EmptyState } from "../../components/feedback/EmptyState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { LoadingState } from "../../components/feedback/LoadingState";
import { PageHeader } from "../../components/layout/PageHeader";
import { useNetworkMetrics, useNetworkSummary } from "../../hooks/use-api";
import {
  formatCompactCurrency,
  formatCompactNumber,
  formatCurrency,
  formatMonthLabel,
  formatNumber,
  formatPercent,
  formatSignedPercent,
  formatSignedValue
} from "../../utils/format";
import classes from "./NetworkDashboardPage.module.css";

const getDeltaTone = (value: number) => {
  if (value > 0) {
    return "positive" as const;
  }

  if (value < 0) {
    return "negative" as const;
  }

  return "neutral" as const;
};

export function NetworkDashboardPage() {
  const summaryQuery = useNetworkSummary();
  const metricsQuery = useNetworkMetrics();

  if (summaryQuery.isLoading || metricsQuery.isLoading) {
    return <LoadingState title="Cargando dashboard" />;
  }

  if (summaryQuery.error || metricsQuery.error) {
    return (
      <ErrorState
        message={
          summaryQuery.error?.message ??
          metricsQuery.error?.message ??
          "No se pudo cargar la vista agregada de la red."
        }
        onRetry={() => {
          void summaryQuery.refetch();
          void metricsQuery.refetch();
        }}
      />
    );
  }

  const summary = summaryQuery.data;
  const metrics = metricsQuery.data?.items ?? [];

  if (!summary?.current || metrics.length === 0) {
    return (
      <EmptyState
        title="No hay metricas agregadas"
        message="Cuando existan datos mensuales de la red, esta vista mostrara la evolucion global y los KPIs principales."
      />
    );
  }

  const comparison = summary.comparison;

  return (
    <>
      <PageHeader
        eyebrow="Fase 1"
        title="Vision agregada de la red"
        description="Una lectura directa del comportamiento conjunto de la red: tamano actual, evolucion comercial y capacidad de respuesta a lo largo del tiempo."
      />

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} className={classes.grid}>
        <KpiCard
          label="Clientes activos"
          value={formatNumber(summary.current.clientesActivos)}
          hint="Cartera activa del ultimo mes disponible"
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
          value={formatCurrency(summary.current.facturacionTotal)}
          hint="Ingresos combinados de asesoria, gestion y consultoria"
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
          label="Clientes netos"
          value={formatNumber(summary.current.clientesNetos)}
          hint="Altas menos bajas durante el ultimo mes"
          delta={
            comparison
              ? {
                  value: formatSignedValue(comparison.clientesNetosDelta, formatNumber),
                  label: `vs ${formatMonthLabel(comparison.againstMonth)}`,
                  tone: getDeltaTone(comparison.clientesNetosDelta)
                }
              : null
          }
        />
        <KpiCard
          label="Total declaraciones"
          value={formatNumber(summary.current.totalDeclaraciones)}
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
          value={formatPercent(summary.current.tasaResolucion)}
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
          value={summary.current.satisfaccionCliente.toFixed(1)}
          hint="Media simple de satisfaccion mensual de la red"
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

      {comparison ? (
        <div className={classes.comparison}>
          <h2 className={classes.comparisonTitle}>Lectura rapida</h2>
          <p className={classes.comparisonText}>
            Frente a {formatMonthLabel(comparison.againstMonth)}, la red
            {comparison.facturacionTotalDelta >= 0 ? " mejora " : " reduce "}
            su facturacion en {formatSignedValue(comparison.facturacionTotalDelta, formatCurrency)} y
            se mantiene en {formatPercent(summary.current.tasaResolucion)} de tasa de resolucion.
          </p>
        </div>
      ) : null}

      <SimpleGrid cols={{ base: 1, xl: 2 }} className={classes.section}>
        <MetricChartCard
          title="Facturacion mensual"
          description="La evolucion del negocio combinado en toda la red."
          data={metrics}
          dataKey="facturacionTotal"
          color="#0f766e"
          valueFormatter={formatCurrency}
          axisFormatter={formatCompactCurrency}
        />
        <MetricChartCard
          title="Clientes activos"
          description="Tamano consolidado de la cartera mes a mes."
          data={metrics}
          dataKey="clientesActivos"
          color="#2563eb"
          valueFormatter={formatNumber}
          axisFormatter={formatCompactNumber}
        />
        <MetricChartCard
          title="Total declaraciones"
          description="Suma mensual de declaracion IRPF, IVA, Impuesto Sociedades y otras."
          data={metrics}
          dataKey="totalDeclaraciones"
          color="#7c3aed"
          valueFormatter={formatNumber}
          axisFormatter={formatCompactNumber}
        />
        <MetricChartCard
          title="Tasa de resolucion"
          description="Capacidad de respuesta consolidada de la red."
          data={metrics}
          dataKey="tasaResolucion"
          color="#ea580c"
          valueFormatter={formatPercent}
          axisFormatter={formatPercent}
        />
      </SimpleGrid>
    </>
  );
}
