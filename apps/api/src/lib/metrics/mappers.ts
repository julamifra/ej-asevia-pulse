import {
  calculateClientesNetos,
  calculateFacturacionTotal,
  calculateTasaResolucion,
  calculateTotalDeclaraciones,
  decimalToNumber,
  round
} from "./calculations";
import { formatDate, subtractMonths } from "./dates";
import type { MetricDto, MetricLike, SummaryDto } from "./types";

export const mapMetricToDto = (metric: MetricLike): MetricDto => {
  return {
    mes: formatDate(metric.mes),
    clientesActivos: metric.clientesActivos,
    clientesNuevos: metric.clientesNuevos,
    clientesBaja: metric.clientesBaja,
    clientesNetos: calculateClientesNetos(metric),
    facturacionTotal: calculateFacturacionTotal(metric),
    totalDeclaraciones: calculateTotalDeclaraciones(metric),
    tasaResolucion: calculateTasaResolucion(metric),
    satisfaccionCliente: round(decimalToNumber(metric.satisfaccionCliente), 1)
  };
};

export const buildSummary = (items: MetricDto[]): SummaryDto | null => {
  if (items.length === 0) {
    return null;
  }

  const latest = items[items.length - 1];
  const compareMonth = subtractMonths(latest.mes, 6);
  const previous = items.find((item) => item.mes === compareMonth) ?? null;

  return {
    latestMonth: latest.mes,
    current: {
      clientesActivos: latest.clientesActivos,
      clientesNetos: latest.clientesNetos,
      facturacionTotal: latest.facturacionTotal,
      totalDeclaraciones: latest.totalDeclaraciones,
      tasaResolucion: latest.tasaResolucion,
      satisfaccionCliente: latest.satisfaccionCliente
    },
    comparison: previous
      ? {
          againstMonth: previous.mes,
          clientesActivosDelta: latest.clientesActivos - previous.clientesActivos,
          clientesNetosDelta: latest.clientesNetos - previous.clientesNetos,
          facturacionTotalDelta: round(latest.facturacionTotal - previous.facturacionTotal),
          totalDeclaracionesDelta: latest.totalDeclaraciones - previous.totalDeclaraciones,
          tasaResolucionDelta: round(latest.tasaResolucion - previous.tasaResolucion, 4),
          satisfaccionClienteDelta: round(
            latest.satisfaccionCliente - previous.satisfaccionCliente,
            1
          )
        }
      : null
  };
};
