import { Router } from "express";

import { asyncHandler } from "../../common/middleware/async-handler.js";
import { validateRequest } from "../../common/middleware/validate-request.js";
import { requireAuth } from "../auth/auth.middleware.js";

import { CredentialsController } from "./credentials.controller.js";
import { credentialProviderSchema, upsertCredentialSchema } from "./dto/credentials.schema.js";

const router = Router();
const controller = new CredentialsController();

router.get("/", requireAuth, asyncHandler(controller.list));
router.put(
  "/:provider",
  requireAuth,
  (request, _response, next) => {
    request.params.provider = credentialProviderSchema.parse(request.params.provider);
    next();
  },
  validateRequest(upsertCredentialSchema),
  asyncHandler(controller.upsert)
);

export const credentialsRouter = router;
