import cors from "cors";
import express from "express";
import morgan from "morgan";

import { env } from "./config/env.js";
import { errorHandler } from "./common/middleware/error-handler.js";
import { notFoundHandler } from "./common/middleware/not-found.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { brandingRouter } from "./modules/branding/branding.routes.js";
import { collectionsRouter } from "./modules/collections/collections.routes.js";
import { credentialsRouter } from "./modules/credentials/credentials.routes.js";
import { dashboardRouter } from "./modules/dashboard/dashboard.routes.js";
import { marketplaceRouter } from "./modules/marketplace/marketplace.routes.js";
import { nftsRouter } from "./modules/nfts/nfts.routes.js";
import { promotionsRouter } from "./modules/promotions/promotions.routes.js";
import { usersRouter } from "./modules/users/users.routes.js";

export const app = express();

app.use(
  cors({
    origin: env.FRONTEND_URL ?? true
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

app.get("/api/health", (_request, response) => {
  response.json({
    status: "ok"
  });
});

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/credentials", credentialsRouter);
app.use("/api/branding", brandingRouter);
app.use("/api/collections", collectionsRouter);
app.use("/api/nfts", nftsRouter);
app.use("/api/promotions", promotionsRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/marketplace", marketplaceRouter);

app.use(notFoundHandler);
app.use(errorHandler);
