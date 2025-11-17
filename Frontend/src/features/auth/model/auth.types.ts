// src/features/auth/model/auth.types.ts

//Internal app-level types used for UI, hooks, and state.
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

//Interface implemented by the REST adapter 
export interface IAuthService {
  login(username: string, password: string): Promise<AuthResult>;
}
