import type { NextFunction, Request, Response } from "express";

import { AppError } from "../../common/errors/app-error.js";
import { verifyAccessToken } from "../../common/utils/jwt.js";

export const requireAuth = (request: Request, _response: Response, next: NextFunction) => {
  const authorization = request.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    next(new AppError("Authentication required", 401));
    return;
  }

  const token = authorization.replace("Bearer ", "");

  try {
    request.auth = verifyAccessToken(token);
    next();
  } catch {
    next(new AppError("Invalid or expired token", 401));
  }
};
