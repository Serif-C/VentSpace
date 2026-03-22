import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import type { ReactNode } from "react";
import type { User, AuthResponse } from "../types/auth";


type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (data: AuthResponse) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Load from localStorage on refresh
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");

      if (!storedUser || !storedToken) return;

      const parsedUser = JSON.parse(storedUser);

      if (parsedUser && typeof parsedUser === "object") {
        setUser(parsedUser);
        setToken(storedToken);
      } else {
        throw new Error("Invalid user data");
      }
    } catch (error) {
      console.error("Auth load error:", error);
      localStorage.clear(); // 🔥 optional: reset bad state
    }
  }, []);

  const login = (data: AuthResponse) => {
    setUser(data.user);
    setToken(data.token);

    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("token", data.token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);

    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}