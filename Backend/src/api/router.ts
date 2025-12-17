// Backend\src\api\router.ts

import { Router } from "express";
import { createAuthRouter } from "./auth/auth.routes";
import { AuthService } from "../engine/auth/auth.service";
import { shoppingListRoutes } from "./shoppingList/shoppingList.routes";
import { createRecipeRouter } from "./recipeBook/recipe.routes";

export const apiRouter = Router();

const authService = new AuthService();
apiRouter.use("/auth", createAuthRouter(authService));

apiRouter.use("/", shoppingListRoutes);
apiRouter.use("/recipes", createRecipeRouter());
