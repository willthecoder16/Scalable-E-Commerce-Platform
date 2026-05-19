import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { api } from '../api/client';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

function loadStored(): { user: User | null; token: string | null } {
  try {
    const token = localStorage.getItem('token');
    const userRaw = localStorage.getItem('user');
    const user = userRaw ? (JSON.parse(userRaw) as User) : null;
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => loadStored().user);
  const [token, setToken] = useState<string | null>(() => loadStored().token);
  const [loading, setLoading] = useState(true);

  const persist = useCallback((u: User | null, t: string | null) => {
    setUser(u);
    setToken(t);
    if (t) localStorage.setItem('token', t);
    else localStorage.removeItem('token');
    if (u) localStorage.setItem('user', JSON.stringify(u));
    else localStorage.removeItem('user');
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user?.id) return;
    const { user: fresh } = await api.getProfile(user.id);
    persist(fresh, token);
  }, [user?.id, token, persist]);

  useEffect(() => {
    async function init() {
      const stored = loadStored();
      if (stored.token && stored.user?.id) {
        try {
          const { user: fresh } = await api.getProfile(stored.user.id);
          persist(fresh, stored.token);
        } catch {
          persist(null, null);
        }
      }
      setLoading(false);
    }
    init();
  }, [persist]);

  const login = useCallback(
    async (email: string, password: string) => {
      const { user: u, token: t } = await api.login(email, password);
      persist(u, t);
    },
    [persist]
  );

  const register = useCallback(
    async (data: {
      email: string;
      password: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
    }) => {
      const { user: u, token: t } = await api.register(data);
      persist(u, t);
    },
    [persist]
  );

  const logout = useCallback(() => persist(null, null), [persist]);

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout, refreshProfile }),
    [user, token, loading, login, register, logout, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
