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
  tasaResolucion: number;
  satisfaccionCliente: number;
};

export type SummaryCurrentDto = {
  clientesActivos: number;
  clientesNetos: number;
  facturacionTotal: number;
  totalDeclaraciones: number;
  tasaResolucion: number;
  satisfaccionCliente: number;
};

export type SummaryMetricLike = Pick<MetricDto, "mes" | keyof SummaryCurrentDto>;

export type SummaryDto = {
  latestMonth: string;
  selectedMonth: string;
  current: SummaryCurrentDto;
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
