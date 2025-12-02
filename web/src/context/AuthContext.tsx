import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  useMemo,
} from "react";

type User = {
  id: number;
  name: string;
  email: string;
};

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    setUser({
      id: 1,
      name: "Usuário Demo",
      email,
    });
  };

  const logout = () => setUser(null);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      login,
      logout,
    }),
    [user]
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
