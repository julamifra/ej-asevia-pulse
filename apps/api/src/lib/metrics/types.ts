export type DecimalLike = number | string | { toNumber(): number };

export type MetricLike = {
  mes: Date;
  clientesActivos: number;
  clientesNuevos: number;
  clientesBaja: number;
  declaracionesRenta: number;
  declaracionesIva: number;
  declaracionesSociedades: number;
  declaracionesOtros: number;
  facturacionAsesoriaEur: DecimalLike;
  facturacionGestionEur: DecimalLike;
  facturacionConsultoriaEur: DecimalLike;
  consultasRecibidas: number;
  consultasResueltas: number;
  satisfaccionCliente: DecimalLike;
};

export type MetricDto = {
  mes: string;
  clientesActivos: number;
  clientesNuevos: number;
  clientesBaja: number;
  clientesNetos: number;
  facturacionTotal: number;
  totalDeclaraciones: number;
  tasaResolucion: number;
  satisfaccionCliente: number;
};

export type SummaryDto = {
  latestMonth: string;
  current: Omit<MetricDto, "mes" | "clientesNuevos" | "clientesBaja">;
  comparison: {
    againstMonth: string;
    clientesActivosDelta: number;
    clientesNetosDelta: number;
    facturacionTotalDelta: number;
    totalDeclaracionesDelta: number;
    tasaResolucionDelta: number;
    satisfaccionClienteDelta: number;
  } | null;
};
