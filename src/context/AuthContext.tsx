import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type UserRole = "athlete" | "admin";

export interface AuthUser {
  name: string;
  firstName: string;
  avatar: string;
  role: UserRole;
}

const USERS: Record<UserRole, AuthUser> = {
  athlete: { name: "Lucas Mendes", firstName: "Lucas", avatar: "L", role: "athlete" },
  admin: { name: "Admin Reserva", firstName: "Admin", avatar: "A", role: "admin" },
};

interface AuthContextValue {
  user: AuthUser | null;
  login: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem("reserva-role");
      if (saved === "athlete" || saved === "admin") return USERS[saved];
    } catch { /* noop */ }
    return null;
  });

  const login = useCallback((role: UserRole) => {
    const u = USERS[role];
    localStorage.setItem("reserva-role", role);
    localStorage.setItem("reserva-onboarded", "true");
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("reserva-role");
    localStorage.removeItem("reserva-onboarded");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
