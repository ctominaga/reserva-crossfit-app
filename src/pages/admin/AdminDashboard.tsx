import { Users, Dumbbell, TrendingUp, DollarSign, ChevronRight, Edit2, Brain, ClipboardCheck, LogOut } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Link, useNavigate } from "react-router-dom";
import { Card } from "../../components/ui/Card";
import { useAuth } from "../../context/AuthContext";
import { mockAdminAthletes, mockWeekdayCheckins } from "../../data/mock";

export default function AdminDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const avgFreq = Math.round(mockAdminAthletes.reduce((s, a) => s + a.frequency, 0) / mockAdminAthletes.length);

  return (
    <div className="px-4 py-4 max-w-xl mx-auto pb-24 space-y-5">
      <h1 className="font-display font-black uppercase text-2xl">Dashboard</h1>

      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard icon={Users} label="Alunos ativos" value="10" />
        <MetricCard icon={Dumbbell} label="Coaches ativos" value="4" />
        <MetricCard icon={TrendingUp} label="Freq. média" value={`${avgFreq}%`} />
        <MetricCard icon={DollarSign} label="Receita/mês" value="R$1.990" />
      </div>

      {/* Check-ins chart */}
      <section>
        <h2 className="section-title mb-3">Check-ins por dia da semana</h2>
        <Card>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={mockWeekdayCheckins}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
              <XAxis dataKey="day" tick={{ fill: "#888", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#888", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#111", border: "1px solid #2A2A2A", borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: "#F5F5F5" }}
              />
              <Bar dataKey="count" fill="#22C55E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </section>

      {/* Quick actions */}
      <section>
        <h2 className="section-title mb-3">Ações rápidas</h2>
        <div className="space-y-2">
          <Link to="/admin/wod" className="block">
            <Card className="card-hover !p-3.5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center">
                  <Edit2 className="w-4 h-4 text-primary" />
                </div>
                <span className="flex-1 text-sm font-semibold">Publicar WOD de amanhã</span>
                <ChevronRight className="w-4 h-4 text-muted" />
              </div>
            </Card>
          </Link>
          <Link to="/admin/checkin" className="block">
            <Card className="card-hover !p-3.5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-warning/15 flex items-center justify-center">
                  <ClipboardCheck className="w-4 h-4 text-warning" />
                </div>
                <span className="flex-1 text-sm font-semibold">Fazer check-in de aula</span>
                <ChevronRight className="w-4 h-4 text-muted" />
              </div>
            </Card>
          </Link>
          <Link to="/admin/analise" className="block">
            <Card className="card-hover !p-3.5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-primary" />
                </div>
                <span className="flex-1 text-sm font-semibold">Gerar análise semanal</span>
                <ChevronRight className="w-4 h-4 text-muted" />
              </div>
            </Card>
          </Link>
        </div>
      </section>

      {/* Logout */}
      <button
        onClick={() => {
          logout();
          navigate("/onboarding", { replace: true });
        }}
        className="w-full btn-secondary flex items-center justify-center gap-2 !text-danger hover:!border-danger/40"
      >
        <LogOut className="w-4 h-4" />
        Sair
      </button>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
  return (
    <Card className="!p-4">
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wider text-muted font-semibold">{label}</span>
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <p className="stat mt-2">{value}</p>
    </Card>
  );
}
