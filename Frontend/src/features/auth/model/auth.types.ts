// src/features/auth/model/auth.types.ts


/**
 * Internal app-level types used for UI, hooks, and state.
 */
export interface User {
  id: string;
  name: string;
}

export interface AuthResult {
  ok: boolean;
  user?: User;
  token?: string;
  refreshToken?: string;
  error?: string;
}

/**
 * Interface implemented by the REST adapter (auth.service).
 */
export interface IAuthService {
  login(username: string, password: string): Promise<AuthResult>;
  register(username: string, password: string): Promise<AuthResult>;
}
