import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

import { AppError } from "../errors/app-error.js";

export const errorHandler = (
  error: Error,
  request: Request,
  response: Response,
  _next: NextFunction
) => {
  console.error(`[${request.method} ${request.originalUrl}]`, error);

  if (error instanceof ZodError) {
    return response.status(400).json({
      message: "Validation failed",
      errors: error.flatten()
    });
  }

  if (error instanceof AppError) {
    return response.status(error.statusCode).json({
      message: error.message,
      details: error.details
    });
  }

  return response.status(500).json({
    message: "Internal server error"
  });
};
