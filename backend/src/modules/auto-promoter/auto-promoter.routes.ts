import { Router } from "express";

import { asyncHandler } from "../../common/middleware/async-handler.js";
import { validateRequest } from "../../common/middleware/validate-request.js";
import { requireAuth } from "../auth/auth.middleware.js";

import { AutoPromoterController } from "./auto-promoter.controller.js";
import { updateAutoPromoterSettingsSchema } from "./dto/auto-promoter.schema.js";

const router = Router();
const controller = new AutoPromoterController();

router.use(requireAuth);
router.get("/settings", asyncHandler(controller.getSettings));
router.put("/settings", validateRequest(updateAutoPromoterSettingsSchema), asyncHandler(controller.updateSettings));
router.get("/logs", asyncHandler(controller.listLogs));
router.post("/logs/:id/approve", asyncHandler(controller.approveLog));
router.post("/logs/:id/dismiss", asyncHandler(controller.dismissLog));
router.post("/ai-suggest", asyncHandler(controller.aiSuggest));

export const autoPromoterRouter = router;
