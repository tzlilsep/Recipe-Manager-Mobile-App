"use strict";
// Backend\src\app.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const router_1 = require("./api/router");
function createApp() {
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)());
    app.use(express_1.default.json());
    app.use("/api", router_1.apiRouter);
    // 404 fallback
    app.use((_req, res) => {
        res.status(404).json({ ok: false, error: "NOT_FOUND" });
    });
    // Error handler with proper types + JSON response
    app.use((err, _req, res, _next) => {
        console.error(err);
        res.status(500).json({ ok: false, error: "INTERNAL_ERROR" });
    });
    return app;
}
