"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseLoginRequest = parseLoginRequest;
function parseLoginRequest(req) {
    const body = req.body;
    if (!body)
        return { ok: false, error: "Invalid request body." };
    if (typeof body.username !== "string" || typeof body.password !== "string") {
        return { ok: false, error: "Username and password are required." };
    }
    return { ok: true, data: { username: body.username, password: body.password } };
}
