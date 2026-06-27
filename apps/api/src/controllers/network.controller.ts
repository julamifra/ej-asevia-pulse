import type { Request, Response } from "express";

import { getNetworkMetrics, getNetworkSummary } from "../services/network.service";

export const getNetworkMetricsController = async (_req: Request, res: Response) => {
  res.json(await getNetworkMetrics());
};

export const getNetworkSummaryController = async (_req: Request, res: Response) => {
  res.json(await getNetworkSummary());
};
