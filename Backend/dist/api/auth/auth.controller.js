"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuthController = createAuthController;
const auth_validators_1 = require("./auth.validators");
function createAuthController(authService) {
    return {
        login: async (req, res) => {
            const parsed = (0, auth_validators_1.parseLoginRequest)(req);
            if (!parsed.ok)
                return res.status(400).send(parsed.error);
            const { username, password } = parsed.data;
            const result = await authService.signIn(username, password);
            if (!result.ok || !result.userId || !result.idToken) {
                return res.status(401).send(result.error?.trim() || "Invalid credentials.");
            }
            const response = {
                ok: true,
                user: { userId: result.userId, userName: username.trim() },
                token: result.idToken,
            };
            return res.status(200).json(response);
        },
    };
}
