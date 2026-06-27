import type { DecimalLike, MetricLike } from "./types";

export const round = (value: number, decimals = 2) => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

export const decimalToNumber = (value: DecimalLike) => {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    return Number.parseFloat(value);
  }

  return value.toNumber();
};

export const calculateFacturacionTotal = (
  metric: Pick<MetricLike, "facturacionAsesoriaEur" | "facturacionGestionEur" | "facturacionConsultoriaEur">
) => {
  return round(
    decimalToNumber(metric.facturacionAsesoriaEur) +
      decimalToNumber(metric.facturacionGestionEur) +
      decimalToNumber(metric.facturacionConsultoriaEur)
  );
};

export const calculateTotalDeclaraciones = (
  metric: Pick<
    MetricLike,
    "declaracionesRenta" | "declaracionesIva" | "declaracionesSociedades" | "declaracionesOtros"
  >
) => {
  return (
    metric.declaracionesRenta +
    metric.declaracionesIva +
    metric.declaracionesSociedades +
    metric.declaracionesOtros
  );
};

export const calculateClientesNetos = (
  metric: Pick<MetricLike, "clientesNuevos" | "clientesBaja">
) => {
  return metric.clientesNuevos - metric.clientesBaja;
};

export const calculateTasaResolucion = (
  metric: Pick<MetricLike, "consultasRecibidas" | "consultasResueltas">
) => {
  if (metric.consultasRecibidas === 0) {
    return 0;
  }

  return round(metric.consultasResueltas / metric.consultasRecibidas, 4);
};
