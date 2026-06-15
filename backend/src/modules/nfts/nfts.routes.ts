import { Router } from "express";

import { asyncHandler } from "../../common/middleware/async-handler.js";
import { validateRequest } from "../../common/middleware/validate-request.js";
import { requireAuth } from "../auth/auth.middleware.js";

import {
  createNftSchema,
  generateImageSchema,
  generatePromptSchema,
  listOnMarketplaceSchema,
  updateNftSchema,
  uploadImageSchema
} from "./dto/nft.schema.js";
import { NftsController } from "./nfts.controller.js";

const router = Router();
const controller = new NftsController();

router.use(requireAuth);
router.get("/", asyncHandler(controller.list));
router.get("/templates", asyncHandler(controller.templates));
router.post("/studio/prompt", validateRequest(generatePromptSchema), asyncHandler(controller.generatePrompt));
router.post("/studio/image", validateRequest(generateImageSchema), asyncHandler(controller.generateImage));
router.post("/studio/upload-image", validateRequest(uploadImageSchema), asyncHandler(controller.uploadImage));
router.post("/", validateRequest(createNftSchema), asyncHandler(controller.create));
router.get("/:id", asyncHandler(controller.getById));
router.put("/:id", validateRequest(updateNftSchema), asyncHandler(controller.update));
router.delete("/:id", asyncHandler(controller.delete));
router.post("/:id/ipfs", asyncHandler(controller.uploadToIpfs));
router.post("/:id/mint", asyncHandler(controller.mintNft));
router.post("/:id/list", validateRequest(listOnMarketplaceSchema), asyncHandler(controller.listOnMarketplace));
router.post("/:id/unlist", asyncHandler(controller.unlistFromMarketplace));

export const nftsRouter = router;
