"use strict";
// Backend\src\api\auth\auth.routes.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuthRouter = createAuthRouter;
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
function createAuthRouter(authService) {
    const router = (0, express_1.Router)();
    const controller = (0, auth_controller_1.createAuthController)(authService);
    router.post("/login", controller.login);
    return router;
}
