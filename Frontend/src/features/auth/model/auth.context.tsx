// src/features/auth/model/auth.context.tsx
import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  ReactNode,
  useEffect,
  useRef
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AuthInfo = {
  token?: string | null;
  userId?: string | null;
  userName?: string | null;
};

type AuthContextValue = {
  auth: AuthInfo;
  sessionId: number;                 // Identifier for the current session (used to invalidate old operations)
  setAuth: (info: AuthInfo) => Promise<void>;
  signOut: () => Promise<void>;
};

const STORAGE_KEY = '@auth';

// Prefixes used for clearing cached user-related data on logout
const DATA_PREFIXES = ['@auth', '@lists:', '@cache:', '@offline:', '@ds:', 'shopping/'];

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Utility function to remove all stored keys that start with specific prefixes
async function wipeByPrefixes(prefixes: string[]) {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const toRemove = keys.filter(k => prefixes.some(p => k.startsWith(p)));
    if (toRemove.length) await AsyncStorage.multiRemove(toRemove);
  } catch {}
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Holds the current authentication info for the logged-in user
  const [auth, setAuthState] = useState<AuthInfo>({ token: null, userId: null, userName: null });

  // Tracks the "current session" — any change invalidates pending async operations
  const [sessionId, setSessionId] = useState<number>(Date.now());

  // Tracks whether the component is still mounted (prevents setting state after unmount)
  const mountedRef = useRef(true);

  // Load auth data from persistent storage on first mount
  useEffect(() => {
    mountedRef.current = true;

    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw && mountedRef.current) setAuthState(JSON.parse(raw));
      } catch {}
    })();

    // Cleanup — mark component as unmounted
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Update in-memory auth state and persist to storage
  const setAuth = async (info: AuthInfo) => {
    setAuthState(info);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(info));
    } catch {}
  };

  // Clear session and remove all cached data when logging out
  const signOut = async () => {
    setSessionId(Date.now());   // Invalidate pending operations
    setAuthState({ token: null, userId: null, userName: null });
    await wipeByPrefixes(DATA_PREFIXES);
  };

  // Memoize value to avoid unnecessary re-renders
  const value = useMemo(
    () => ({ auth, sessionId, setAuth, signOut }),
    [auth, sessionId]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  
  // Ensures the hook is used inside AuthProvider
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  
  return ctx;
}
