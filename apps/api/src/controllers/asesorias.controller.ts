import type { Request, Response } from "express";

import {
  getAsesoriaDetail,
  getAsesoriaFilters,
  getAsesoriaMetrics,
  getAsesoriaSummary,
  listAsesorias
} from "../services/asesorias.service";
import {
  parseIdParam,
  parseLimitParam,
  parseOptionalStringParam,
  parsePageParam,
  parseSummaryMonthQuery
} from "../utils/validation";

export const listAsesoriasController = async (req: Request, res: Response) => {
  const result = await listAsesorias({
    search: parseOptionalStringParam(req.query.search),
    provincia: parseOptionalStringParam(req.query.provincia),
    especialidad: parseOptionalStringParam(req.query.especialidad),
    page: parsePageParam(req.query.page),
    limit: parseLimitParam(req.query.limit)
  });

  res.json(result);
};

export const getAsesoriaFiltersController = async (_req: Request, res: Response) => {
  res.json(await getAsesoriaFilters());
};

export const getAsesoriaDetailController = async (req: Request, res: Response) => {
  res.json(await getAsesoriaDetail(parseIdParam(req.params.id)));
};

export const getAsesoriaMetricsController = async (req: Request, res: Response) => {
  res.json(await getAsesoriaMetrics(parseIdParam(req.params.id)));
};

export const getAsesoriaSummaryController = async (req: Request, res: Response) => {
  res.json(
    await getAsesoriaSummary(
      parseIdParam(req.params.id),
      parseSummaryMonthQuery(req.query.year, req.query.month)
    )
  );
};
