import { Router } from "express";

import {
  askSupportQuestionController,
  getAsesoriaDetailController,
  getAsesoriaFiltersController,
  getAsesoriaMetricsController,
  getSupportDocumentsController,
  getAsesoriaSummaryController,
  listAsesoriasController
} from "../controllers/asesorias.controller";
import { asyncHandler } from "../utils/async-handler";

export const asesoriasRouter = Router();

asesoriasRouter.get("/asesorias", asyncHandler(listAsesoriasController));
asesoriasRouter.get("/asesorias/filters", asyncHandler(getAsesoriaFiltersController));
asesoriasRouter.get("/asesorias/:id", asyncHandler(getAsesoriaDetailController));
asesoriasRouter.get("/asesorias/:id/metrics", asyncHandler(getAsesoriaMetricsController));
asesoriasRouter.get("/asesorias/:id/summary", asyncHandler(getAsesoriaSummaryController));
asesoriasRouter.get("/asesorias/:id/support-documents", asyncHandler(getSupportDocumentsController));
asesoriasRouter.post("/asesorias/:id/support/ask", asyncHandler(askSupportQuestionController));
