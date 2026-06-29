export type SummaryMonthParams = {
  year: number;
  month: number;
  selectedMonth: string;
};

export type AggregateBucket = {
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