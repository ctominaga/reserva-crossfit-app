import {
  HashRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { useEffect } from "react";
import { Header } from "./components/layout/Header";
import { TabBar } from "./components/layout/TabBar";
import { ToastProvider } from "./components/ui/Toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Onboarding from "./pages/Onboarding";
import Home from "./pages/Home";
import Agenda from "./pages/Agenda";
import WOD from "./pages/WOD";
import Evolucao from "./pages/Evolucao";
import Perfil from "./pages/Perfil";
import Feed from "./pages/Feed";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Alunos from "./pages/admin/Alunos";
import CheckinAdmin from "./pages/admin/CheckinAdmin";
import WODEditor from "./pages/admin/WODEditor";
import AnaliseIA from "./pages/admin/AnaliseIA";
import CoachesAdmin from "./pages/admin/Coaches";
import CoachesPublic from "./pages/Coaches";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AthleteShell() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/agenda" element={<Agenda />} />
      <Route path="/wod" element={<WOD />} />
      <Route path="/evolucao" element={<Evolucao />} />
      <Route path="/feed" element={<Feed />} />
      <Route path="/coaches" element={<CoachesPublic />} />
      <Route path="/perfil" element={<Perfil />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function AdminShell() {
  return (
    <Routes>
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/alunos" element={<Alunos />} />
      <Route path="/admin/checkin" element={<CheckinAdmin />} />
      <Route path="/admin/wod" element={<WODEditor />} />
      <Route path="/admin/coaches" element={<CoachesAdmin />} />
      <Route path="/admin/feed" element={<Feed />} />
      <Route path="/admin/analise" element={<AnaliseIA />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}

function AppShell() {
  const { user } = useAuth();
  const location = useLocation();
  const isOnboarding = location.pathname === "/onboarding";

  return (
    <div className="min-h-[100dvh] bg-bg text-text">
      {!isOnboarding && <Header />}
      <main className="animate-fade-in">
        <Routes>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/*" element={user ? (user.role === "admin" ? <AdminShell /> : <AthleteShell />) : <Navigate to="/onboarding" replace />} />
        </Routes>
      </main>
      {!isOnboarding && <TabBar />}
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <ScrollToTop />
      <AuthProvider>
        <ToastProvider>
          <AppShell />
        </ToastProvider>
      </AuthProvider>
    </HashRouter>
  );
}
