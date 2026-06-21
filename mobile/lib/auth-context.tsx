import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { clearToken, endpoints, setToken, type User } from "@/lib/api";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (name: string, email: string, password: string) => Promise<User>;
  refreshUser: () => Promise<void>;
  updateUser: (user: User) => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshUser() {
    try {
      const result = await endpoints.me();
      setUser(result.user);
    } catch {
      await clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshUser();
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    async signIn(email, password) {
      const result = await endpoints.login({ email, password });
      await setToken(result.token);
      setUser(result.user);
      return result.user;
    },
    async signUp(name, email, password) {
      const result = await endpoints.signup({ name, email, password });
      await setToken(result.token);
      setUser(result.user);
      return result.user;
    },
    refreshUser,
    updateUser: setUser,
    async signOut() {
      await clearToken();
      setUser(null);
    },
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within AuthProvider");
  return value;
}
