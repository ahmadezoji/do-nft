import { Router } from "express";

import { asyncHandler } from "../../common/middleware/async-handler.js";
import { validateRequest } from "../../common/middleware/validate-request.js";
import { requireAuth } from "../auth/auth.middleware.js";

import { assistCollectionSchema, createCollectionSchema, updateCollectionSchema } from "./dto/collection.schema.js";
import { CollectionsController } from "./collections.controller.js";

const router = Router();
const controller = new CollectionsController();

router.use(requireAuth);
router.get("/", asyncHandler(controller.list));
router.post("/", validateRequest(createCollectionSchema), asyncHandler(controller.create));
router.post("/assist", validateRequest(assistCollectionSchema), asyncHandler(controller.assist));
router.post("/:id/deploy-contract", asyncHandler(controller.deployContract));
router.post("/:id/publish", asyncHandler(controller.publish));
router.get("/:id", asyncHandler(controller.getById));
router.put("/:id", validateRequest(updateCollectionSchema), asyncHandler(controller.update));

export const collectionsRouter = router;
