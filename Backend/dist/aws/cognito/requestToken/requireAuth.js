"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const tokenVerifier_1 = require("./tokenVerifier");
function extractBearerToken(req) {
    const h = req.headers.authorization;
    if (!h)
        return null;
    const m = h.match(/^Bearer\s+(.+)$/i);
    return m ? m[1] : null;
}
// Middleware: checks that request has a real Cognito token
async function requireAuth(req, res, next) {
    try {
        const token = extractBearerToken(req);
        if (!token)
            return res.status(401).json({ ok: false, error: "MISSING_TOKEN" });
        const payload = await tokenVerifier_1.tokenVerifier.verify(token);
        const userId = String(payload.sub || "").trim();
        if (!userId)
            return res.status(401).json({ ok: false, error: "MISSING_SUB" });
        const username = (typeof payload["cognito:username"] === "string" ? payload["cognito:username"] : undefined) ??
            (typeof payload["username"] === "string" ? payload["username"] : undefined);
        req.user = { userId, username };
        next();
    }
    catch (err) {
        console.error("Auth error:", err);
        return res.status(401).json({ ok: false, error: "INVALID_TOKEN" });
    }
}
