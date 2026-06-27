import { prisma } from "../db/prisma";
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

type AggregateBucket = {
  mes: Date;
  clientesActivos: number;
  clientesNuevos: number;
  clientesBaja: number;
  facturacionTotal: number;
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
      facturacionTotal: 0,
      totalDeclaraciones: 0,
      consultasRecibidas: 0,
      consultasResueltas: 0,
      satisfaccionSum: 0,
      satisfaccionCount: 0
    };

    bucket.clientesActivos += metric.clientesActivos;
    bucket.clientesNuevos += metric.clientesNuevos;
    bucket.clientesBaja += metric.clientesBaja;
    bucket.facturacionTotal += calculateFacturacionTotal(metric);
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
    facturacionTotal: round(bucket.facturacionTotal),
    totalDeclaraciones: bucket.totalDeclaraciones,
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

export const getNetworkSummary = async () => {
  const items = await aggregateMetricsByMonth();

  return (
    buildSummary(items) ?? {
      latestMonth: null,
      current: null,
      comparison: null
    }
  );
};
