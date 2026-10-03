import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { fetchApi } from '@/lib/api';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'CUSTOMER';
}

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

interface StoredUser {
  token: string;
  user: AuthUser | null;
}

const readStoredUser = (): StoredUser | null => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;

  let user: AuthUser | null = null;
  try {
    const parsed = JSON.parse(localStorage.getItem(USER_KEY) || 'null');
    if (parsed && typeof parsed === 'object' && 'id' in parsed) {
      user = parsed as AuthUser;
    }
  } catch {
    // A corrupted cached user should never block sign-in.
    user = null;
  }

  return { token, user };
};

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  /** True while the stored session is being revalidated on page load. */
  initializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoredUser | null>(() => readStoredUser());
  const [initializing, setInitializing] = useState(() => !!localStorage.getItem(TOKEN_KEY));

  const store = useCallback((token: string, user: AuthUser | null) => {
    localStorage.setItem(TOKEN_KEY, token);
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
    setState({ token, user });
  }, []);

  const clear = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setState(null);
  }, []);

  // Re-validate the cached session once on mount. A revoked or expired token
  // must not leave the UI showing a signed-in header while every request 401s.
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetchApi<{ user: AuthUser }>('/auth/me');
        if (cancelled) return;
        if (res.error || !res.data?.user) {
          clear();
        } else {
          store(token, res.data.user);
        }
      } catch {
        if (!cancelled) clear();
      } finally {
        if (!cancelled) setInitializing(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [clear, store]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await fetchApi<{ user: AuthUser; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (res.error) throw new Error(res.error);
      if (!res.data?.token) throw new Error('Sign-in did not return a session. Please try again.');
      store(res.data.token, res.data.user ?? null);
    },
    [store]
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const res = await fetchApi<{ user: AuthUser; token: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      if (res.error) throw new Error(res.error);
      if (!res.data?.token) throw new Error('Registration did not return a session. Please try again.');
      store(res.data.token, res.data.user ?? null);
    },
    [store]
  );

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    const res = await fetchApi<{ user: AuthUser }>('/auth/me');
    if (res.error || !res.data?.user) {
      clear();
      return;
    }
    store(token, res.data.user);
  }, [clear, store]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: state?.user ?? null,
      token: state?.token ?? null,
      isAuthenticated: !!state?.token,
      isAdmin: state?.user?.role === 'ADMIN',
      initializing,
      login,
      register,
      logout: clear,
      refreshUser,
    }),
    [state, initializing, login, register, clear, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}