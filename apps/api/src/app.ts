import express from "express";

import { asesoriasRouter } from "./routes/asesorias.routes";
import { healthRouter } from "./routes/health.routes";
import { networkRouter } from "./routes/network.routes";
import { errorHandler } from "./middleware/error-handler";
import { notFoundHandler } from "./middleware/not-found";

export const createApp = () => {
  const app = express();

  app.use((_req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (_req.method === "OPTIONS") {
      res.sendStatus(204);
      return;
    }

    next();
  });

  app.use(express.json());

  app.use("/api", healthRouter);
  app.use("/api", asesoriasRouter);
  app.use("/api", networkRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
