// Backend\src\engine\auth\auth.types.ts

export type SignInResult = {
  ok: boolean;
  userId?: string;
  idToken?: string;
  error?: string;
};

export interface IAuthService {
  signIn(username: string, password: string): Promise<SignInResult>;
}
