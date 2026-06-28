import type { Request, Response } from "express";

import { getNetworkMetrics, getNetworkSummary } from "../services/network.service";
import { parseSummaryMonthQuery } from "../utils/validation";

export const getNetworkMetricsController = async (_req: Request, res: Response) => {
  res.json(await getNetworkMetrics());
};

export const getNetworkSummaryController = async (req: Request, res: Response) => {
  res.json(await getNetworkSummary(parseSummaryMonthQuery(req.query.year, req.query.month)));
};
