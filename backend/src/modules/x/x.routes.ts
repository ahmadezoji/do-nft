import { Router } from "express";

import { asyncHandler } from "../../common/middleware/async-handler.js";
import { requireAuth } from "../auth/auth.middleware.js";

import { XController } from "./x.controller.js";

const router = Router();
const controller = new XController();

router.get("/oauth/start", requireAuth, asyncHandler(controller.startOAuth));
router.get("/oauth/callback", asyncHandler(controller.oauthCallback));

export const xRouter = router;
