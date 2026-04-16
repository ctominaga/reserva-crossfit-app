import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { supabase, isSupabaseEnabled } from "../lib/supabase";
import { getCurrentProfile, signIn as supabaseSignIn, signUp as supabaseSignUp, signOut as supabaseSignOut } from "../services/auth.service";

export type UserRole = "athlete" | "admin" | "coach";

export interface AuthUser {
  id: string;
  name: string;
  firstName: string;
  avatar: string;
  role: UserRole;
  isDemo: boolean;
}

const MOCK_USERS: Record<"athlete" | "admin", AuthUser> = {
  athlete: { id: "mock-athlete", name: "Lucas Mendes", firstName: "Lucas", avatar: "L", role: "athlete", isDemo: true },
  admin:   { id: "mock-admin",   name: "Admin Reserva", firstName: "Admin", avatar: "A", role: "admin",   isDemo: true },
};

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  isSupabase: boolean;
  login: (role: "athlete" | "admin") => void;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function profileToUser(p: { id: string; full_name: string; role: UserRole | string }): AuthUser {
  const role = (p.role === "admin" || p.role === "coach" || p.role === "athlete" ? p.role : "athlete") as UserRole;
  const firstName = p.full_name.split(" ")[0] || p.full_name;
  return {
    id: p.id,
    name: p.full_name,
    firstName,
    avatar: (p.full_name[0] ?? "?").toUpperCase(),
    role,
    isDemo: false,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseEnabled) {
      try {
        const saved = localStorage.getItem("reserva-role");
        if (saved === "athlete" || saved === "admin") setUser(MOCK_USERS[saved]);
      } catch { /* noop */ }
      setLoading(false);
      return;
    }

    // Demo mode persists across reloads even when Supabase is enabled
    try {
      const saved = localStorage.getItem("reserva-role");
      if (saved === "athlete" || saved === "admin") setUser(MOCK_USERS[saved]);
    } catch { /* noop */ }

    let active = true;
    supabase!.auth.getSession().then(async ({ data: { session } }) => {
      if (!active) return;
      if (session) {
        const profile = await getCurrentProfile();
        if (profile && active) setUser(profileToUser(profile));
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase!.auth.onAuthStateChange(async (_event, session) => {
      if (!session) {
        try {
          const saved = localStorage.getItem("reserva-role");
          if (saved === "athlete" || saved === "admin") {
            setUser(MOCK_USERS[saved]);
            return;
          }
        } catch { /* noop */ }
        setUser(null);
        return;
      }
      const profile = await getCurrentProfile();
      if (profile) setUser(profileToUser(profile));
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = useCallback((role: "athlete" | "admin") => {
    localStorage.setItem("reserva-role", role);
    localStorage.setItem("reserva-onboarded", "true");
    setUser(MOCK_USERS[role]);
  }, []);

  const loginWithEmail = useCallback(async (email: string, password: string) => {
    if (!isSupabaseEnabled) throw new Error("Supabase não configurado");
    await supabaseSignIn(email, password);
    const profile = await getCurrentProfile();
    if (profile) {
      localStorage.setItem("reserva-onboarded", "true");
      localStorage.removeItem("reserva-role");
      setUser(profileToUser(profile));
    }
  }, []);

  const signUpWithEmail = useCallback(async (email: string, password: string, fullName: string) => {
    if (!isSupabaseEnabled) throw new Error("Supabase não configurado");
    await supabaseSignUp(email, password, fullName, "athlete");
  }, []);

  const logout = useCallback(async () => {
    localStorage.removeItem("reserva-role");
    localStorage.removeItem("reserva-onboarded");
    if (isSupabaseEnabled) await supabaseSignOut();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isSupabase: isSupabaseEnabled, login, loginWithEmail, signUpWithEmail, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
