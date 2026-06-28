import type { Asesoria } from "@prisma/client";

import { prisma } from "../db/prisma";
import { AppError } from "../errors/app-error";
import { buildSummary, mapMetricToDto } from "../lib/metrics";

type ListParams = {
  search?: string;
  provincia?: string;
  especialidad?: string;
  page: number;
  limit: number;
};

type SummaryMonthParams = {
  year: number;
  month: number;
  selectedMonth: string;
};

type AsesoriaWhere = {
  OR?: Array<
    | { nombre: { contains: string; mode: "insensitive" } }
    | { ciudad: { contains: string; mode: "insensitive" } }
    | { cif: { contains: string; mode: "insensitive" } }
  >;
  provincia?: string;
  especialidad?: string;
};

type ProvinciaRow = { provincia: string };
type EspecialidadRow = { especialidad: string };

const buildWhere = ({ search, provincia, especialidad }: Omit<ListParams, "page" | "limit">): AsesoriaWhere => {
  const where: AsesoriaWhere = {};

  if (search) {
    where.OR = [
      { nombre: { contains: search, mode: "insensitive" } },
      { ciudad: { contains: search, mode: "insensitive" } },
      { cif: { contains: search, mode: "insensitive" } }
    ];
  }

  if (provincia) {
    where.provincia = provincia;
  }

  if (especialidad) {
    where.especialidad = especialidad;
  }

  return where;
};

const ensureAsesoriaExists = async (id: number) => {
  const asesoria = await prisma.asesoria.findUnique({ where: { id } });

  if (!asesoria) {
    throw new AppError(404, "NOT_FOUND", "Asesoria not found");
  }

  return asesoria;
};

export const listAsesorias = async ({ page, limit, ...filters }: ListParams) => {
  const where = buildWhere(filters);
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.asesoria.findMany({
      where,
      orderBy: { nombre: "asc" },
      skip,
      take: limit
    }),
    prisma.asesoria.count({ where })
  ]);

  return {
    items: items.map((item: Asesoria) => ({
      id: item.id,
      nombre: item.nombre,
      provincia: item.provincia,
      ciudad: item.ciudad,
      numEmpleados: item.numEmpleados,
      especialidad: item.especialidad,
      fechaAlta: item.fechaAlta.toISOString().slice(0, 10)
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

export const getAsesoriaFilters = async () => {
  const [provincias, especialidades] = await Promise.all([
    prisma.asesoria.findMany({
      distinct: ["provincia"],
      select: { provincia: true },
      orderBy: { provincia: "asc" }
    }),
    prisma.asesoria.findMany({
      distinct: ["especialidad"],
      select: { especialidad: true },
      orderBy: { especialidad: "asc" }
    })
  ]);

  return {
    provincias: provincias.map((item: ProvinciaRow) => item.provincia),
    especialidades: especialidades.map((item: EspecialidadRow) => item.especialidad)
  };
};

export const getAsesoriaDetail = async (id: number) => {
  const asesoria = await ensureAsesoriaExists(id);

  return {
    id: asesoria.id,
    nombre: asesoria.nombre,
    cif: asesoria.cif,
    provincia: asesoria.provincia,
    ciudad: asesoria.ciudad,
    fechaAlta: asesoria.fechaAlta.toISOString().slice(0, 10),
    numEmpleados: asesoria.numEmpleados,
    especialidad: asesoria.especialidad
  };
};

export const getAsesoriaMetrics = async (id: number) => {
  await ensureAsesoriaExists(id);

  const metrics = await prisma.metricaMensual.findMany({
    where: { asesoriaId: id },
    orderBy: { mes: "asc" }
  });

  return {
    asesoriaId: id,
    items: metrics.map(mapMetricToDto)
  };
};

export const getAsesoriaSummary = async (id: number, selectedMonth?: SummaryMonthParams) => {
  const metrics = await getAsesoriaMetrics(id);
  const summary = buildSummary(metrics.items, selectedMonth?.selectedMonth);

  if (selectedMonth && !summary) {
    throw new AppError(404, "NOT_FOUND", "Metrics not found for selected month");
  }

  return {
    asesoriaId: id,
    ...(summary ?? {
      latestMonth: null,
      selectedMonth: null,
      current: null,
      comparison: null
    })
  };
};
