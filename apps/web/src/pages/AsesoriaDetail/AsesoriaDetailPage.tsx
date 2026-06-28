import { Anchor, Badge, Button, Group, Paper, Select, SimpleGrid, Stack, Text } from "@mantine/core";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { MetricChartCard } from "../../components/charts/MetricChartCard";
import { KpiCard } from "../../components/data-display/KpiCard";
import { EmptyState } from "../../components/feedback/EmptyState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { LoadingState } from "../../components/feedback/LoadingState";
import { PageHeader } from "../../components/layout/PageHeader";
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
  formatPercent,
  formatSignedPercent,
  formatSignedValue
} from "../../utils/format";
import type { MetricPoint } from "../../types/api";
import classes from "./AsesoriaDetailPage.module.css";

const emptyMetrics: MetricPoint[] = [];

const getDeltaTone = (value: number) => {
  if (value > 0) {
    return "positive" as const;
  }

  if (value < 0) {
    return "negative" as const;
  }

  return "neutral" as const;
};

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

export function AsesoriaDetailPage() {
  const params = useParams();
  const id = Number.parseInt(params.id ?? "", 10);
  const isValidId = Number.isInteger(id) && id > 0;
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  const detailQuery = useAsesoriaDetail(id, isValidId);
  const metricsQuery = useAsesoriaMetrics(id, isValidId);
  const metrics = metricsQuery.data?.items ?? emptyMetrics;
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

  const hasSelectedMonth = selectedYear !== null && selectedMonth !== null;
  const summaryQuery = useAsesoriaSummary(
    id,
    hasSelectedMonth
      ? {
          year: Number(selectedYear),
          month: selectedMonth
        }
      : undefined,
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

      <Stack gap="sm" className={classes.monthSelector}>
        <Select
          label="Año"
          data={yearOptions}
          value={selectedYear}
          onChange={(value) => {
            if (!value) {
              return;
            }

            setSelectedYear(value);
            const firstAvailableMonth = Math.max(...(availableMonthsByYear.get(value) ?? new Set<number>()));
            setSelectedMonth(Number.isFinite(firstAvailableMonth) ? firstAvailableMonth : null);
          }}
          w={180}
        />

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
                onClick={() => setSelectedMonth(month.value)}
              >
                {month.label}
              </Button>
            );
          })}
        </div>
      </Stack>

      <SimpleGrid
        cols={{ base: 1, sm: 2, lg: 3 }}
        className={`${classes.summaryArea} ${isSummaryUpdating ? classes.summaryAreaUpdating : ""}`.trim()}
      >
        <KpiCard
          label="Clientes activos"
          value={formatNumber(summary.current.clientesActivos)}
          hint="Clientes activos gestionados durante el ultimo mes disponible"
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
          hint="Suma mensual de asesoria, gestion y consultoria"
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
          hint="Valoracion media mensual de clientes"
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
    </>
  );
}
