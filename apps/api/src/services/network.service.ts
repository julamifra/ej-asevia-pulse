import { prisma } from "../db/prisma";
import { AppError } from "../errors/app-error";
import {
  buildSummary,
  calculateFacturacionTotal,
  calculateTasaResolucion,
  calculateTotalDeclaraciones,
  decimalToNumber,
  formatDate,
  round,
  type MetricDto
} from "../lib/metrics";

type SummaryMonthParams = {
  year: number;
  month: number;
  selectedMonth: string;
};

type AggregateBucket = {
  mes: Date;
  clientesActivos: number;
  clientesNuevos: number;
  clientesBaja: number;
  facturacionAsesoriaEur: number;
  facturacionGestionEur: number;
  facturacionConsultoriaEur: number;
  facturacionTotal: number;
  declaracionesRenta: number;
  declaracionesIva: number;
  declaracionesSociedades: number;
  declaracionesOtros: number;
  totalDeclaraciones: number;
  consultasRecibidas: number;
  consultasResueltas: number;
  satisfaccionSum: number;
  satisfaccionCount: number;
};

const aggregateMetricsByMonth = async (): Promise<MetricDto[]> => {
  const metrics = await prisma.metricaMensual.findMany({ orderBy: { mes: "asc" } });
  const buckets = new Map<string, AggregateBucket>();

  for (const metric of metrics) {
    const key = formatDate(metric.mes);
    const bucket = buckets.get(key) ?? {
      mes: metric.mes,
      clientesActivos: 0,
      clientesNuevos: 0,
      clientesBaja: 0,
      facturacionAsesoriaEur: 0,
      facturacionGestionEur: 0,
      facturacionConsultoriaEur: 0,
      facturacionTotal: 0,
      declaracionesRenta: 0,
      declaracionesIva: 0,
      declaracionesSociedades: 0,
      declaracionesOtros: 0,
      totalDeclaraciones: 0,
      consultasRecibidas: 0,
      consultasResueltas: 0,
      satisfaccionSum: 0,
      satisfaccionCount: 0
    };

    bucket.clientesActivos += metric.clientesActivos;
    bucket.clientesNuevos += metric.clientesNuevos;
    bucket.clientesBaja += metric.clientesBaja;
    bucket.facturacionAsesoriaEur += decimalToNumber(metric.facturacionAsesoriaEur);
    bucket.facturacionGestionEur += decimalToNumber(metric.facturacionGestionEur);
    bucket.facturacionConsultoriaEur += decimalToNumber(metric.facturacionConsultoriaEur);
    bucket.facturacionTotal += calculateFacturacionTotal(metric);
    bucket.declaracionesRenta += metric.declaracionesRenta;
    bucket.declaracionesIva += metric.declaracionesIva;
    bucket.declaracionesSociedades += metric.declaracionesSociedades;
    bucket.declaracionesOtros += metric.declaracionesOtros;
    bucket.totalDeclaraciones += calculateTotalDeclaraciones(metric);
    bucket.consultasRecibidas += metric.consultasRecibidas;
    bucket.consultasResueltas += metric.consultasResueltas;
    bucket.satisfaccionSum += decimalToNumber(metric.satisfaccionCliente);
    bucket.satisfaccionCount += 1;

    buckets.set(key, bucket);
  }

  return [...buckets.values()].map((bucket) => ({
    mes: formatDate(bucket.mes),
    clientesActivos: bucket.clientesActivos,
    clientesNuevos: bucket.clientesNuevos,
    clientesBaja: bucket.clientesBaja,
    clientesNetos: bucket.clientesNuevos - bucket.clientesBaja,
    facturacionAsesoriaEur: round(bucket.facturacionAsesoriaEur),
    facturacionGestionEur: round(bucket.facturacionGestionEur),
    facturacionConsultoriaEur: round(bucket.facturacionConsultoriaEur),
    facturacionTotal: round(bucket.facturacionTotal),
    declaracionesRenta: bucket.declaracionesRenta,
    declaracionesIva: bucket.declaracionesIva,
    declaracionesSociedades: bucket.declaracionesSociedades,
    declaracionesOtros: bucket.declaracionesOtros,
    totalDeclaraciones: bucket.totalDeclaraciones,
    consultasRecibidas: bucket.consultasRecibidas,
    consultasResueltas: bucket.consultasResueltas,
    tasaResolucion: calculateTasaResolucion({
      consultasRecibidas: bucket.consultasRecibidas,
      consultasResueltas: bucket.consultasResueltas
    }),
    satisfaccionCliente: round(bucket.satisfaccionSum / bucket.satisfaccionCount, 1)
  }));
};

export const getNetworkMetrics = async () => {
  return {
    items: await aggregateMetricsByMonth()
  };
};

export const getNetworkSummary = async (selectedMonth?: SummaryMonthParams) => {
  const items = await aggregateMetricsByMonth();
  const summary = buildSummary(items, selectedMonth?.selectedMonth);

  if (selectedMonth && !summary) {
    throw new AppError(404, "NOT_FOUND", "Metrics not found for selected month");
  }

  return (
    summary ?? {
      latestMonth: null,
      selectedMonth: null,
      current: null,
      comparison: null
    }
  );
};
