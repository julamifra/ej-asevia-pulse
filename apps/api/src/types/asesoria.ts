
export type ListParams = {
  search?: string;
  provincia?: string;
  especialidad?: string;
  page: number;
  limit: number;
};

export type SummaryMonthParams = {
  year: number;
  month: number;
  selectedMonth: string;
};

export type AsesoriaWhere = {
  OR?: Array<
    | { nombre: { contains: string; mode: "insensitive" } }
    | { ciudad: { contains: string; mode: "insensitive" } }
    | { cif: { contains: string; mode: "insensitive" } }
  >;
  provincia?: string;
  especialidad?: string;
};

export type ProvinciaRow = { provincia: string };
export type EspecialidadRow = { especialidad: string };
export type AsesoriaListRow = {
  id: number;
  nombre: string;
  provincia: string;
  ciudad: string;
  numEmpleados: number;
  especialidad: string;
  fechaAlta: Date;
};