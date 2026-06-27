import { Router } from "express";

import {
  getNetworkMetricsController,
  getNetworkSummaryController
} from "../controllers/network.controller";
import { asyncHandler } from "../utils/async-handler";

export const networkRouter = Router();

networkRouter.get("/network/metrics", asyncHandler(getNetworkMetricsController));
networkRouter.get("/network/summary", asyncHandler(getNetworkSummaryController));
