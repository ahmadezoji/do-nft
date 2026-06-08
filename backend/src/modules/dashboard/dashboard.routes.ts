import { Router } from "express";

import { asyncHandler } from "../../common/middleware/async-handler.js";
import { requireAuth } from "../auth/auth.middleware.js";

import { DashboardController } from "./dashboard.controller.js";

const router = Router();
const controller = new DashboardController();

router.get("/summary", requireAuth, asyncHandler(controller.summary));

export const dashboardRouter = router;
