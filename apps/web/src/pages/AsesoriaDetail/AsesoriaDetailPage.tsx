import { Anchor, Badge, Group, Paper, SimpleGrid, Stack, Tabs, Text } from "@mantine/core";
import { Link, useParams } from "react-router-dom";

import { MetricChartCard } from "../../components/charts/MetricChartCard";
import { EmptyState } from "../../components/feedback/EmptyState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { LoadingState } from "../../components/feedback/LoadingState";
import { PageHeader } from "../../components/layout/PageHeader";
import { MetricMonthSelector } from "../../components/metrics/MetricMonthSelector";
import { SummaryKpiGrid } from "../../components/metrics/SummaryKpiGrid";
import { useMetricMonthSelection } from "../../hooks/useMetricMonthSelection";
import {
  useAsesoriaDetail,
  useAsesoriaMetrics,
  useAsesoriaSummary
} from "../../hooks/use-api";
import {
  formatCompactCurrency,
  formatCompactNumber,
  formatCurrency,
  formatMonthLabel,
  formatNumber,
  formatPercent
} from "../../utils/format";
import type { MetricPoint } from "../../types/api";
import { SupportAssistedPanel } from "./SupportAssistedPanel";
import classes from "./AsesoriaDetailPage.module.css";

const emptyMetrics: MetricPoint[] = [];

export function AsesoriaDetailPage() {
  const params = useParams();
  const id = Number.parseInt(params.id ?? "", 10);
  const isValidId = Number.isInteger(id) && id > 0;

  const detailQuery = useAsesoriaDetail(id, isValidId);
  const metricsQuery = useAsesoriaMetrics(id, isValidId);
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
  const summaryQuery = useAsesoriaSummary(
    id,
    summaryMonthParams,
    isValidId && hasSelectedMonth
  );

  if (!isValidId) {
    return <ErrorState title="Asesoria invalida" message="El identificador indicado no es valido." />;
  }

  if (
    detailQuery.isLoading ||
    metricsQuery.isLoading ||
    (metrics.length > 0 && !hasSelectedMonth) ||
    (!summaryQuery.data && summaryQuery.isLoading)
  ) {
    return <LoadingState title="Cargando ficha de asesoria" />;
  }

  if (detailQuery.error || metricsQuery.error || summaryQuery.error) {
    return (
      <ErrorState
        message={
          detailQuery.error?.message ??
          metricsQuery.error?.message ??
          summaryQuery.error?.message ??
          "No se pudo cargar el detalle de la asesoria."
        }
        onRetry={() => {
          void detailQuery.refetch();
          void metricsQuery.refetch();
          void summaryQuery.refetch();
        }}
      />
    );
  }

  const detail = detailQuery.data;
  const summary = summaryQuery.data;

  if (!detail || !summary?.current || metrics.length === 0) {
    return (
      <EmptyState
        title="Sin datos suficientes"
        message="La asesoria existe, pero todavia no hay informacion mensual lista para construir la ficha de analisis."
      />
    );
  }

  const comparison = summary.comparison;
  const isSummaryUpdating = summaryQuery.isFetching && !summaryQuery.isLoading;

  return (
    <>
      <PageHeader
        eyebrow="Detalle"
        title={detail.nombre}
        description="Una vista para seguir la evolucion mensual de la asesoria: clientes activos, altas y bajas, facturacion, declaraciones y capacidad de respuesta."
        actions={
          <Anchor component={Link} to="/asesorias" c="teal" fw={700}>
            Volver al listado
          </Anchor>
        }
      />

      <SimpleGrid cols={{ base: 1, sm: 2, xl: 4 }} className={classes.facts}>
        <Paper className={classes.factCard}>
          <span className={classes.factLabel}>Ubicacion</span>
          <span className={classes.factValue}>
            {detail.ciudad}, {detail.provincia}
          </span>
        </Paper>
        <Paper className={classes.factCard}>
          <span className={classes.factLabel}>Especialidad</span>
          <Group gap="xs">
            <Badge color="teal" variant="light">
              {detail.especialidad}
            </Badge>
          </Group>
        </Paper>
        <Paper className={classes.factCard}>
          <span className={classes.factLabel}>Equipo</span>
          <span className={classes.factValue}>{formatNumber(detail.numEmpleados)} personas</span>
        </Paper>
        <Paper className={classes.factCard}>
          <span className={classes.factLabel}>Identificacion</span>
          <Stack gap={2}>
            <span className={classes.factValue}>{detail.cif}</span>
            <Text size="sm" c="dimmed">
              Alta: {detail.fechaAlta}
            </Text>
          </Stack>
        </Paper>
      </SimpleGrid>

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
        comparison={comparison}
        current={summary.current}
        hints={{
          clientesActivos: "Clientes activos gestionados durante el ultimo mes disponible",
          facturacionTotal: "Suma mensual de asesoria, gestion y consultoria",
          satisfaccion: "Valoracion media mensual de clientes"
        }}
        isUpdating={isSummaryUpdating}
      />

      <Tabs defaultValue="metrics" className={classes.tabsSection}>
        <Tabs.List>
          <Tabs.Tab value="metrics">Metricas</Tabs.Tab>
          <Tabs.Tab value="support">Soporte asistido</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="metrics">
          <SimpleGrid cols={{ base: 1, xl: 2 }} className={classes.section}>
            <MetricChartCard
              title="Clientes activos"
              description="Evolucion mensual de los clientes activos gestionados por esta asesoria."
              data={metrics}
              dataKey="clientesActivos"
              color="#0f766e"
              valueFormatter={formatNumber}
              axisFormatter={formatCompactNumber}
            />
            <MetricChartCard
              title="Altas, bajas y balance mensual"
              description="Movimiento mensual de clientes para entender crecimiento y rotacion."
              data={metrics}
              series={[
                { key: "clientesNuevos", color: "#16a34a", label: "Clientes nuevos" },
                { key: "clientesBaja", color: "#dc2626", label: "Clientes baja" },
                { key: "clientesNetos", color: "#2563eb", label: "Clientes netos" }
              ]}
              valueFormatter={formatNumber}
              axisFormatter={formatCompactNumber}
            />
            <MetricChartCard
              title="Facturacion total"
              description="Desglose mensual entre asesoria, gestion, consultoria y total agregado."
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
              title="Total declaraciones"
              description="Desglose mensual entre IRPF, IVA, Sociedades, otras y el total agregado."
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
              description="Relacion entre consultas recibidas, consultas resueltas y tasa final de resolucion del mes."
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
        </Tabs.Panel>

        <Tabs.Panel value="support">
          <SupportAssistedPanel asesoriaId={id} />
        </Tabs.Panel>
      </Tabs>
    </>
  );
}
