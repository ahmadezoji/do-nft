import { Router } from "express";

import { asyncHandler } from "../../common/middleware/async-handler.js";
import { validateRequest } from "../../common/middleware/validate-request.js";
import { requireAuth } from "../auth/auth.middleware.js";

import { PromotionsController } from "./promotions.controller.js";
import { createPromotionSchema } from "./dto/promotion.schema.js";

const router = Router();
const controller = new PromotionsController();

router.use(requireAuth);
router.get("/", asyncHandler(controller.list));
router.post("/", validateRequest(createPromotionSchema), asyncHandler(controller.create));
router.post("/:campaignId/posts/:postId/publish", asyncHandler(controller.publishPost));

export const promotionsRouter = router;
