import {
  Home,
  Calendar,
  Dumbbell,
  TrendingUp,
  User,
  MessageSquare,
  LayoutDashboard,
  Users,
  CheckSquare,
  Brain,
  UserCog,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface Tab {
  to: string;
  label: string;
  Icon: typeof Home;
  end?: boolean;
}

const athleteTabs: Tab[] = [
  { to: "/", label: "Início", Icon: Home, end: true },
  { to: "/agenda", label: "Agenda", Icon: Calendar },
  { to: "/wod", label: "WOD", Icon: Dumbbell },
  { to: "/evolucao", label: "Evolução", Icon: TrendingUp },
  { to: "/feed", label: "Feed", Icon: MessageSquare },
  { to: "/perfil", label: "Perfil", Icon: User },
];

const adminTabs: Tab[] = [
  { to: "/admin", label: "Dashboard", Icon: LayoutDashboard, end: true },
  { to: "/admin/alunos", label: "Alunos", Icon: Users },
  { to: "/admin/checkin", label: "Check-in", Icon: CheckSquare },
  { to: "/admin/wod", label: "WOD", Icon: Dumbbell },
  { to: "/admin/coaches", label: "Coaches", Icon: UserCog },
  { to: "/admin/feed", label: "Feed", Icon: MessageSquare },
  { to: "/admin/analise", label: "IA", Icon: Brain },
];

export function TabBar() {
  const location = useLocation();
  const { user } = useAuth();

  if (location.pathname === "/onboarding") return null;

  const tabs = user?.role === "admin" ? adminTabs : athleteTabs;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 bg-bg/95 backdrop-blur border-t border-border">
      <div
        className="max-w-xl mx-auto grid h-[68px] pb-[env(safe-area-inset-bottom)]"
        style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}
      >
        {tabs.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 transition ${
                isActive ? "text-primary" : "text-muted hover:text-text"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className="w-4 h-4"
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span className="text-[9px] font-semibold uppercase tracking-wide leading-tight">
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
