import jwt from "jsonwebtoken";

import { env } from "../../config/env.js";

type JwtPayload = {
  userId: string;
  email: string;
};

export const signAccessToken = (payload: JwtPayload) =>
  jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: "7d"
  });

export const verifyAccessToken = (token: string) =>
  jwt.verify(token, env.JWT_SECRET) as JwtPayload;
