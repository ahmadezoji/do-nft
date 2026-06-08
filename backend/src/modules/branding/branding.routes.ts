import { Router } from "express";

import { asyncHandler } from "../../common/middleware/async-handler.js";
import { validateRequest } from "../../common/middleware/validate-request.js";
import { requireAuth } from "../auth/auth.middleware.js";

import { BrandingController } from "./branding.controller.js";
import { upsertBrandingSchema } from "./dto/branding.schema.js";

const router = Router();
const controller = new BrandingController();

router.get("/", requireAuth, asyncHandler(controller.get));
router.put("/", requireAuth, validateRequest(upsertBrandingSchema), asyncHandler(controller.upsert));

export const brandingRouter = router;
