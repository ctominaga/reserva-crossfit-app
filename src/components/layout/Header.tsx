import { Bell } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export function Header() {
  const location = useLocation();
  const { user } = useAuth();
  if (location.pathname === "/onboarding") return null;

  const isAdmin = user?.role === "admin";
  const profileLink = isAdmin ? "/admin" : "/perfil";

  return (
    <header className="sticky top-0 z-30 bg-bg/90 backdrop-blur border-b border-border">
      <div className="max-w-xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 select-none">
          <img src="/logo.jpeg" alt="Reserva CrossFit" className="h-8 w-auto object-contain" />
          {isAdmin && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-bold uppercase tracking-wider">
              ADMIN
            </span>
          )}
        </Link>
        <div className="flex items-center gap-3">
          <button
            aria-label="Notificações"
            className="relative w-9 h-9 rounded-full bg-surface border border-border flex items-center justify-center hover:border-primary/40 transition"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
          </button>
          <Link
            to={profileLink}
            aria-label="Perfil"
            className="w-9 h-9 rounded-full bg-primary/20 border border-primary/40 text-primary font-display font-black flex items-center justify-center"
          >
            {user?.avatar ?? "?"}
          </Link>
        </div>
      </div>
    </header>
  );
}
