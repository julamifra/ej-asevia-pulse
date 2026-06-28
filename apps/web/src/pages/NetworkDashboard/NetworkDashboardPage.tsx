import { SimpleGrid } from "@mantine/core";

import { MetricChartCard } from "../../components/charts/MetricChartCard";
import { EmptyState } from "../../components/feedback/EmptyState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { LoadingState } from "../../components/feedback/LoadingState";
import { PageHeader } from "../../components/layout/PageHeader";
import { MetricMonthSelector } from "../../components/metrics/MetricMonthSelector";
import { SummaryKpiGrid } from "../../components/metrics/SummaryKpiGrid";
import { useMetricMonthSelection } from "../../hooks/useMetricMonthSelection";
import { useNetworkMetrics, useNetworkSummary } from "../../hooks/use-api";
import {
  formatCompactCurrency,
  formatCompactNumber,
  formatCurrency,
  formatMonthLabel,
  formatNumber,
  formatPercent,
  formatSignedValue
} from "../../utils/format";
import type { MetricPoint } from "../../types/api";
import classes from "./NetworkDashboardPage.module.css";

const emptyMetrics: MetricPoint[] = [];

export function NetworkDashboardPage() {
  const metricsQuery = useNetworkMetrics();
  const metrics = metricsQuery.data?.items ?? emptyMetrics;
  const {
    availableMonthsByYear,
    hasSelectedMonth,
    handleYearChange,
    selectedMonth,
    selectedYear,
    setSelectedMonth,
    yearOptions
  } = useMetricMonthSelection(metrics);
  const summaryMonthParams =
    selectedYear !== null && selectedMonth !== null
      ? {
          year: Number(selectedYear),
          month: selectedMonth
        }
      : undefined;
  const summaryQuery = useNetworkSummary(
    summaryMonthParams,
    hasSelectedMonth
  );

  if (metricsQuery.isLoading || (metrics.length > 0 && !hasSelectedMonth) || (!summaryQuery.data && summaryQuery.isLoading)) {
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

  if (!summary?.current || metrics.length === 0) {
    return (
      <EmptyState
        title="No hay metricas agregadas"
        message="Cuando existan datos mensuales de la red, esta vista mostrara la evolucion global y los KPIs principales."
      />
    );
  }

  const comparison = summary.comparison;
  const isSummaryUpdating = summaryQuery.isFetching && !summaryQuery.isLoading;

  return (
    <>
      <PageHeader
        eyebrow="Fase 1"
        title="Vision agregada de la red"
        description="Una lectura directa del comportamiento conjunto de la red: tamano actual, evolucion comercial y capacidad de respuesta a lo largo del tiempo."
      />

      {summary.latestMonth ? (
        <div className={classes.latestMonth}>
          Datos mostrados: {formatMonthLabel(summary.selectedMonth ?? summary.latestMonth)}
          {summary.comparison ? ` · comparado con ${formatMonthLabel(summary.comparison.againstMonth)}` : " · sin comparativa a 6 meses"}
          {isSummaryUpdating ? " · actualizando..." : ""}
        </div>
      ) : null}

      <MetricMonthSelector
        availableMonthsByYear={availableMonthsByYear}
        onMonthChange={setSelectedMonth}
        onYearChange={handleYearChange}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        yearOptions={yearOptions}
      />

      <SummaryKpiGrid
        className={classes.grid}
        comparison={comparison}
        current={summary.current}
        hints={{
          clientesActivos: "Cartera activa del ultimo mes disponible",
          facturacionTotal: "Ingresos combinados de asesoria, gestion y consultoria",
          satisfaccion: "Media simple de satisfaccion mensual de la red"
        }}
        isUpdating={isSummaryUpdating}
      />

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
          description="Desglose mensual agregado entre asesoria, gestion, consultoria y total combinado de la red."
          data={metrics}
          series={[
            {
              key: "facturacionTotal",
              color: "#0f172a",
              label: "Facturacion total",
              valueFormatter: formatCurrency,
              strokeWidth: 3.4
            },
            {
              key: "facturacionAsesoriaEur",
              color: "#0f766e",
              label: "Asesoria",
              valueFormatter: formatCurrency,
              strokeWidth: 2.4
            },
            {
              key: "facturacionGestionEur",
              color: "#2563eb",
              label: "Gestion",
              valueFormatter: formatCurrency,
              strokeWidth: 2.4
            },
            {
              key: "facturacionConsultoriaEur",
              color: "#7c3aed",
              label: "Consultoria",
              valueFormatter: formatCurrency,
              strokeWidth: 2.4
            }
          ]}
          valueFormatter={formatCurrency}
          axisFormatter={formatCompactCurrency}
        />
        <MetricChartCard
          title="Clientes activos"
          description="Actividad mensual agregada: clientes activos gestionados, altas, bajas y balance neto."
          data={metrics}
          series={[
            {
              key: "clientesActivos",
              color: "#0f172a",
              label: "Clientes activos",
              valueFormatter: formatNumber,
              strokeWidth: 3.4
            },
            {
              key: "clientesNuevos",
              color: "#16a34a",
              label: "Clientes nuevos",
              valueFormatter: formatNumber,
              strokeWidth: 2.4
            },
            {
              key: "clientesBaja",
              color: "#dc2626",
              label: "Clientes baja",
              valueFormatter: formatNumber,
              strokeWidth: 2.4
            },
            {
              key: "clientesNetos",
              color: "#2563eb",
              label: "Clientes netos",
              valueFormatter: formatNumber,
              strokeWidth: 2.4
            }
          ]}
          valueFormatter={formatNumber}
          axisFormatter={formatCompactNumber}
        />
        <MetricChartCard
          title="Total declaraciones"
          description="Desglose mensual agregado entre IRPF, IVA, Sociedades, otras y el total conjunto."
          data={metrics}
          series={[
            {
              key: "totalDeclaraciones",
              color: "#0f172a",
              label: "Total",
              valueFormatter: formatNumber,
              strokeWidth: 3.4
            },
            {
              key: "declaracionesRenta",
              color: "#16a34a",
              label: "IRPF",
              valueFormatter: formatNumber,
              strokeWidth: 2.4
            },
            {
              key: "declaracionesIva",
              color: "#2563eb",
              label: "IVA",
              valueFormatter: formatNumber,
              strokeWidth: 2.4
            },
            {
              key: "declaracionesSociedades",
              color: "#ea580c",
              label: "Sociedades",
              valueFormatter: formatNumber,
              strokeWidth: 2.4
            },
            {
              key: "declaracionesOtros",
              color: "#7c3aed",
              label: "Otras",
              valueFormatter: formatNumber,
              strokeWidth: 2.4
            }
          ]}
          valueFormatter={formatNumber}
          axisFormatter={formatCompactNumber}
        />
        <MetricChartCard
          title="Tasa de resolucion"
          description="Relacion agregada entre consultas recibidas, consultas resueltas y la tasa final mensual de resolucion."
          data={metrics}
          series={[
            {
              key: "consultasRecibidas",
              color: "#dc2626",
              label: "Consultas recibidas",
              valueFormatter: formatNumber,
              strokeWidth: 2.6
            },
            {
              key: "consultasResueltas",
              color: "#16a34a",
              label: "Consultas resueltas",
              valueFormatter: formatNumber,
              strokeWidth: 2.6
            },
            {
              key: "tasaResolucion",
              color: "#ea580c",
              label: "Tasa de resolucion",
              yAxisId: "right",
              valueFormatter: formatPercent,
              strokeWidth: 3.2
            }
          ]}
          valueFormatter={formatPercent}
          axisFormatter={formatCompactNumber}
          rightAxisFormatter={formatPercent}
        />
      </SimpleGrid>
    </>
  );
}
