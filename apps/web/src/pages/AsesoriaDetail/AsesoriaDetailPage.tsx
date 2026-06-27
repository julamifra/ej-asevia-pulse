import { Anchor, Badge, Group, Paper, SimpleGrid, Stack, Text } from "@mantine/core";
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
import classes from "./AsesoriaDetailPage.module.css";

const getDeltaTone = (value: number) => {
  if (value > 0) {
    return "positive" as const;
  }

  if (value < 0) {
    return "negative" as const;
  }

  return "neutral" as const;
};

export function AsesoriaDetailPage() {
  const params = useParams();
  const id = Number.parseInt(params.id ?? "", 10);
  const isValidId = Number.isInteger(id) && id > 0;

  const detailQuery = useAsesoriaDetail(id, isValidId);
  const metricsQuery = useAsesoriaMetrics(id, isValidId);
  const summaryQuery = useAsesoriaSummary(id, isValidId);

  if (!isValidId) {
    return <ErrorState title="Asesoria invalida" message="El identificador indicado no es valido." />;
  }

  if (detailQuery.isLoading || metricsQuery.isLoading || summaryQuery.isLoading) {
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
  const metrics = metricsQuery.data?.items ?? [];
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

  return (
    <>
      <PageHeader
        eyebrow="Detalle"
        title={detail.nombre}
        description="Una vista pensada para leer la historia de la asesoria: volumen de clientes activos gestionados, intensidad operativa, facturacion y calidad de respuesta a lo largo del tiempo."
        actions={
          <Anchor component={Link} to="/asesorias" c="teal" fw={700}>
            Volver al listado
          </Anchor>
        }
      />

      {summary.latestMonth ? (
        <div className={classes.latestMonth}>
          Datos actualizados a {formatMonthLabel(summary.latestMonth)}
        </div>
      ) : null}

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

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
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
          description="Ingresos mensuales para leer el pulso comercial."
          data={metrics}
          dataKey="facturacionTotal"
          color="#2563eb"
          valueFormatter={formatCurrency}
          axisFormatter={formatCompactCurrency}
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
          description="Calidad operativa y capacidad de respuesta mensual."
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
