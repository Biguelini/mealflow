import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiFetch, setAuthToken, removeAuthToken, getAuthToken } from "../services/api";

type User = {
  id: number;
  name: string;
  email: string;
};

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const token = await getAuthToken();
        if (!token) {
          setLoading(false);
          return;
        }

        const me = await apiFetch<User>("/auth/me");
        setUser(me);
      } catch {
        await removeAuthToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
	console.log("login called with", email, password);
    const data = await apiFetch<{ user: User; token: string }>("/auth/login", {
      method: "POST",
      data: { email, password },
    });

    await setAuthToken(data.token);
    setUser(data.user);
  };

  const register = async (name: string, email: string, password: string) => {
    const data = await apiFetch<{ user: User; token: string }>("/auth/register", {
      method: "POST",
      data: { name, email, password },
    });

    await setAuthToken(data.token);
    setUser(data.user);
  };

  const logout = async () => {
    await removeAuthToken();
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      loading,
      login,
      register,
      logout,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return ctx;
}
