import { Router } from "express";

import { asyncHandler } from "../../common/middleware/async-handler.js";
import { requireAuth } from "../auth/auth.middleware.js";

import { MarketplaceController } from "./marketplace.controller.js";

const router = Router();
const controller = new MarketplaceController();

router.get("/trending-collections", requireAuth, asyncHandler(controller.trendingCollections));

export const marketplaceRouter = router;
