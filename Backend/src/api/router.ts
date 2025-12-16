// Backend\src\api\router.ts

import { Router } from "express";
import { createAuthRouter } from "./auth/auth.routes";
import { AuthService } from "../engine/auth/auth.service";
import { shoppingListRoutes } from "./shoppingList/shoppingList.routes";

export const apiRouter = Router();

const authService = new AuthService();
apiRouter.use("/auth", createAuthRouter(authService));

apiRouter.use("/", shoppingListRoutes);
