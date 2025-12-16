import type { Request, Response } from "express";
import type { IAuthService } from "../../engine/auth/auth.types";
import type { LoginResponseDto } from "./auth.types";
import { parseLoginRequest } from "./auth.validators";

export function createAuthController(authService: IAuthService) {
  return {
    login: async (req: Request, res: Response) => {
      const parsed = parseLoginRequest(req);
      if (!parsed.ok) return res.status(400).send(parsed.error);

      const { username, password } = parsed.data;

      const result = await authService.signIn(username, password);

      if (!result.ok || !result.userId || !result.idToken) {
        return res.status(401).send(result.error?.trim() || "Invalid credentials.");
      }

      const response: LoginResponseDto = {
        ok: true,
        user: { userId: result.userId, userName: username.trim() },
        token: result.idToken,
      };

      return res.status(200).json(response);
    },
  };
}
