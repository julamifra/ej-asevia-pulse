import type { ErrorRequestHandler } from "express";

import { AppError } from "../errors/app-error";

export const errorHandler: ErrorRequestHandler = (error, _req, res, next) => {
  void next;

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message
      }
    });

    return;
  }

  console.error(error);

  res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error"
    }
  });
};
