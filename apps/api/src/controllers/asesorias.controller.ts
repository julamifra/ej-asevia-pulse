import type { Request, Response } from "express";

import {
  ensureAsesoria,
  getAsesoriaDetail,
  getAsesoriaFilters,
  getAsesoriaMetrics,
  getAsesoriaSummary,
  listAsesorias
} from "../services/asesorias.service";
import { askSupportQuestion, listSupportDocuments } from "../services/support.service";
import {
  parseIdParam,
  parseLimitParam,
  parseOptionalStringParam,
  parsePageParam,
  parseRequiredStringBody,
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

export const getSupportDocumentsController = async (req: Request, res: Response) => {
  const asesoriaId = parseIdParam(req.params.id);
  await ensureAsesoria(asesoriaId);

  res.json(
    await listSupportDocuments(asesoriaId, {
      q: parseOptionalStringParam(req.query.q),
      tipo: parseOptionalStringParam(req.query.tipo),
      categoria: parseOptionalStringParam(req.query.categoria),
      estado: parseOptionalStringParam(req.query.estado),
      page: parsePageParam(req.query.page),
      limit: parseLimitParam(req.query.limit)
    })
  );
};

export const askSupportQuestionController = async (req: Request, res: Response) => {
  const asesoriaId = parseIdParam(req.params.id);
  await ensureAsesoria(asesoriaId);

  res.json(
    await askSupportQuestion(asesoriaId, {
      question: parseRequiredStringBody(req.body?.question, "question")
    })
  );
};
