import { Router } from "express";
import { shoppingListController } from "./shoppingList.controller";
import { requireAuth } from "../../aws/cognito/requestToken/requireAuth";

export const shoppingListRoutes = Router();

shoppingListRoutes.use(requireAuth);

shoppingListRoutes.get("/shopping/lists", shoppingListController.getLists);
shoppingListRoutes.post("/shopping/lists", shoppingListController.createList);
shoppingListRoutes.get("/shopping/lists/:listId", shoppingListController.loadList);
shoppingListRoutes.put("/shopping/lists/:listId", shoppingListController.saveList);
shoppingListRoutes.delete("/shopping/lists/:listId", shoppingListController.deleteList);

shoppingListRoutes.post("/shopping/lists/:listId/share", shoppingListController.shareList);
shoppingListRoutes.post("/shopping/lists/:listId/leave", shoppingListController.leaveList);
