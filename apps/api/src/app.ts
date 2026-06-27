import express from "express";

import { asesoriasRouter } from "./routes/asesorias.routes";
import { healthRouter } from "./routes/health.routes";
import { networkRouter } from "./routes/network.routes";
import { errorHandler } from "./middleware/error-handler";
import { notFoundHandler } from "./middleware/not-found";

export const createApp = () => {
  const app = express();

  app.use(express.json());

  app.use("/api", healthRouter);
  app.use("/api", asesoriasRouter);
  app.use("/api", networkRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
