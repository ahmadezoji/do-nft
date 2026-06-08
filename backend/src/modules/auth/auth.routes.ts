import { Router } from "express";

import { asyncHandler } from "../../common/middleware/async-handler.js";
import { validateRequest } from "../../common/middleware/validate-request.js";

import { AuthController } from "./auth.controller.js";
import { requireAuth } from "./auth.middleware.js";
import { loginSchema, registerSchema } from "./dto/auth.schema.js";

const router = Router();
const controller = new AuthController();

router.post("/register", validateRequest(registerSchema), asyncHandler(controller.register));
router.post("/login", validateRequest(loginSchema), asyncHandler(controller.login));
router.get("/me", requireAuth, asyncHandler(controller.me));

export const authRouter = router;
