import { Router } from "express";

import { asyncHandler } from "../../common/middleware/async-handler.js";
import { validateRequest } from "../../common/middleware/validate-request.js";
import { requireAuth } from "../auth/auth.middleware.js";

import { UsersController } from "./users.controller.js";
import { updateUserSettingsSchema } from "./dto/user-settings.schema.js";

const router = Router();
const controller = new UsersController();

router.get("/me", requireAuth, asyncHandler(controller.me));
router.put("/settings", requireAuth, validateRequest(updateUserSettingsSchema), asyncHandler(controller.updateSettings));

export const usersRouter = router;
