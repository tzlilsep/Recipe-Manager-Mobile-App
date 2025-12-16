"use strict";
// Backend\src\engine\auth\auth.service.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const cognito_auth_1 = require("../../aws/cognito/signIn/cognito.auth");
class AuthService {
    async signIn(username, password) {
        const u = username?.trim();
        const p = password?.trim();
        if (!u || !p) {
            return { ok: false, error: "Username and password are required." };
        }
        return (0, cognito_auth_1.cognitoSignIn)(u, p);
    }
}
exports.AuthService = AuthService;
