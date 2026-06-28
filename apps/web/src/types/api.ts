export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type AsesoriaListItem = {
  id: number;
  nombre: string;
  provincia: string;
  ciudad: string;
  numEmpleados: number;
  especialidad: string;
  fechaAlta: string;
};

export type AsesoriaListResponse = {
  items: AsesoriaListItem[];
  pagination: Pagination;
};

export type AsesoriaFiltersResponse = {
  provincias: string[];
  especialidades: string[];
};

export type AsesoriaDetail = {
  id: number;
  nombre: string;
  cif: string;
  provincia: string;
  ciudad: string;
  fechaAlta: string;
  numEmpleados: number;
  especialidad: string;
};

export type MetricPoint = {
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

export type AsesoriaMetricsResponse = {
  asesoriaId: number;
  items: MetricPoint[];
};

export type SummaryCurrent = {
  clientesActivos: number;
  clientesNetos: number;
  facturacionTotal: number;
  totalDeclaraciones: number;
  tasaResolucion: number;
  satisfaccionCliente: number;
};

export type SummaryComparison = {
  againstMonth: string;
  clientesActivosDelta: number;
  clientesNetosDelta: number;
  facturacionTotalDelta: number;
  totalDeclaracionesDelta: number;
  tasaResolucionDelta: number;
  satisfaccionClienteDelta: number;
};

export type AsesoriaSummaryResponse = {
  asesoriaId: number;
  latestMonth: string | null;
  selectedMonth: string | null;
  current: SummaryCurrent | null;
  comparison: SummaryComparison | null;
};

export type NetworkMetricsResponse = {
  items: MetricPoint[];
};

export type NetworkSummaryResponse = {
  latestMonth: string | null;
  selectedMonth: string | null;
  current: SummaryCurrent | null;
  comparison: SummaryComparison | null;
};

export type SummaryMonthParams = {
  year: number;
  month: number;
};

export type AsesoriaFilters = {
  search?: string;
  provincia?: string;
  especialidad?: string;
  page?: number;
  limit?: number;
};
