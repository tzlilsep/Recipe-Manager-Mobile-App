// Backend\src\api\auth\auth.routes.ts

import { Router } from "express";
import type { IAuthService } from "../../engine/auth/auth.types";
import { createAuthController } from "./auth.controller";

export function createAuthRouter(authService: IAuthService) {
  const router = Router();
  const controller = createAuthController(authService);

  router.post("/login", controller.login);

  return router;
}
