import React, { createContext, useContext, useMemo, useState, ReactNode } from 'react';

type AuthInfo = {
  token?: string | null;
  userId?: string | null;
  userName?: string | null;
};

type AuthContextValue = {
  auth: AuthInfo;
  setAuth: (info: AuthInfo) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuthState] = useState<AuthInfo>({ token: null, userId: null, userName: null });

  const setAuth = (info: AuthInfo) => setAuthState(info);
  const signOut = () => setAuthState({ token: null, userId: null, userName: null });

  const value = useMemo(() => ({ auth, setAuth, signOut }), [auth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
