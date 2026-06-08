import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";

export const validateRequest =
  <T>(schema: ZodSchema<T>) =>
  (request: Request, _response: Response, next: NextFunction) => {
    request.body = schema.parse(request.body);
    next();
  };
