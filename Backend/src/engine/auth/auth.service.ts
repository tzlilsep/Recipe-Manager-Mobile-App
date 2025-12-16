// Backend\src\engine\auth\auth.service.ts

import type { IAuthService, SignInResult } from "./auth.types";
import { cognitoSignIn } from "../../aws/cognito/signIn/cognito.auth";

export class AuthService implements IAuthService {
  async signIn(username: string, password: string): Promise<SignInResult> {
    const u = username?.trim();
    const p = password?.trim();

    if (!u || !p) {
      return { ok: false, error: "Username and password are required." };
    }

    return cognitoSignIn(u, p);
  }
}
