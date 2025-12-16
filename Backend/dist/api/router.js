"use strict";
// Backend\src\api\router.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiRouter = void 0;
const express_1 = require("express");
const auth_routes_1 = require("./auth/auth.routes");
const auth_service_1 = require("../engine/auth/auth.service");
const shoppingList_routes_1 = require("./shoppingList/shoppingList.routes");
exports.apiRouter = (0, express_1.Router)();
const authService = new auth_service_1.AuthService();
exports.apiRouter.use("/auth", (0, auth_routes_1.createAuthRouter)(authService));
exports.apiRouter.use("/", shoppingList_routes_1.shoppingListRoutes);
