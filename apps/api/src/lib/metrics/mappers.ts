import {
  calculateClientesNetos,
  calculateFacturacionTotal,
  calculateTasaResolucion,
  calculateTotalDeclaraciones,
  decimalToNumber,
  round
} from "./calculations";
import { formatDate, subtractMonths } from "./dates";
import type { MetricDto, MetricLike, SummaryDto, SummaryMetricLike } from "./types";

export const mapMetricToDto = (metric: MetricLike): MetricDto => {
  const facturacionAsesoriaEur = round(decimalToNumber(metric.facturacionAsesoriaEur));
  const facturacionGestionEur = round(decimalToNumber(metric.facturacionGestionEur));
  const facturacionConsultoriaEur = round(decimalToNumber(metric.facturacionConsultoriaEur));

  return {
    mes: formatDate(metric.mes),
    clientesActivos: metric.clientesActivos,
    clientesNuevos: metric.clientesNuevos,
    clientesBaja: metric.clientesBaja,
    clientesNetos: calculateClientesNetos(metric),
    facturacionAsesoriaEur,
    facturacionGestionEur,
    facturacionConsultoriaEur,
    facturacionTotal: calculateFacturacionTotal(metric),
    declaracionesRenta: metric.declaracionesRenta,
    declaracionesIva: metric.declaracionesIva,
    declaracionesSociedades: metric.declaracionesSociedades,
    declaracionesOtros: metric.declaracionesOtros,
    totalDeclaraciones: calculateTotalDeclaraciones(metric),
    consultasRecibidas: metric.consultasRecibidas,
    consultasResueltas: metric.consultasResueltas,
    tasaResolucion: calculateTasaResolucion(metric),
    satisfaccionCliente: round(decimalToNumber(metric.satisfaccionCliente), 1)
  };
};

export const buildSummary = (
  items: SummaryMetricLike[],
  selectedMonth?: string
): SummaryDto | null => {
  if (items.length === 0) {
    return null;
  }

  const latest = items[items.length - 1];
  const current = selectedMonth
    ? items.find((item) => item.mes === selectedMonth) ?? null
    : latest;

  if (!current) {
    return null;
  }

  const compareMonth = subtractMonths(current.mes, 6);
  const previous = items.find((item) => item.mes === compareMonth) ?? null;

  return {
    latestMonth: latest.mes,
    selectedMonth: current.mes,
    current: {
      clientesActivos: current.clientesActivos,
      clientesNetos: current.clientesNetos,
      facturacionTotal: current.facturacionTotal,
      totalDeclaraciones: current.totalDeclaraciones,
      tasaResolucion: current.tasaResolucion,
      satisfaccionCliente: current.satisfaccionCliente
    },
    comparison: previous
      ? {
          againstMonth: previous.mes,
          clientesActivosDelta: current.clientesActivos - previous.clientesActivos,
          clientesNetosDelta: current.clientesNetos - previous.clientesNetos,
          facturacionTotalDelta: round(current.facturacionTotal - previous.facturacionTotal),
          totalDeclaracionesDelta: current.totalDeclaraciones - previous.totalDeclaraciones,
          tasaResolucionDelta: round(current.tasaResolucion - previous.tasaResolucion, 4),
          satisfaccionClienteDelta: round(
            current.satisfaccionCliente - previous.satisfaccionCliente,
            1
          )
        }
      : null
  };
};
