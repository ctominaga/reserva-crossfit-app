import { useState } from "react";
import {
  Bell,
  User as UserIcon,
  CreditCard,
  Target,
  HelpCircle,
  Info,
  LogOut,
  ChevronRight,
  Check,
  Star,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Modal } from "../components/ui/Modal";
import { mockUser, mockPlans } from "../data/mock";
import { useToast } from "../hooks/useToast";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useAuth } from "../context/AuthContext";

export default function Perfil() {
  const [plansOpen, setPlansOpen] = useState(false);
  const [notifications, setNotifications] = useLocalStorage(
    "reserva-notif",
    true,
  );
  const { push } = useToast();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const expires = new Date(mockUser.plan.expiresAt).toLocaleDateString("pt-BR");

  return (
    <div className="px-4 py-4 max-w-xl mx-auto pb-24 space-y-5">
      {/* Profile header */}
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-primary/15 border-2 border-primary text-primary font-display font-black text-4xl flex items-center justify-center">
          {mockUser.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-display font-black uppercase text-2xl leading-tight">
            {mockUser.name}
          </h1>
          <p className="text-muted text-sm mt-0.5">
            {mockUser.plan.name} ·{" "}
            <span className="text-primary font-semibold">Ativo</span>
          </p>
          <p className="text-muted text-xs mt-0.5">
            Membro desde {mockUser.memberSince}
          </p>
        </div>
      </div>

      {/* Stats */}
      <section>
        <h2 className="section-title mb-3">Sua jornada</h2>
        <div className="grid grid-cols-2 gap-3">
          <StatBox label="Treinos totais" value={mockUser.totalWorkouts} />
          <StatBox label="Sequência máx." value={`${21} dias`} />
          <StatBox label="Melhor ranking" value={`#${mockUser.bestRanking}`} />
          <StatBox label="Meses ativos" value={mockUser.activeMonths} />
        </div>
      </section>

      {/* Plano */}
      <section>
        <h2 className="section-title mb-3">Meu plano</h2>
        <Card accent>
          <div className="flex items-start justify-between">
            <div>
              <Badge variant="primary">ATIVO</Badge>
              <h3 className="font-display font-black uppercase text-xl mt-2">
                {mockUser.plan.name}
              </h3>
              <p className="text-muted text-xs mt-0.5">
                Vencimento: {expires}
              </p>
            </div>
          </div>
          <button
            onClick={() => setPlansOpen(true)}
            className="mt-4 w-full btn-secondary flex items-center justify-center gap-2"
          >
            Ver planos disponíveis
            <ChevronRight className="w-4 h-4" />
          </button>
        </Card>
      </section>

      {/* Configurações */}
      <section>
        <h2 className="section-title mb-3">Configurações</h2>
        <div className="card divide-y divide-border">
          <SettingRow
            icon={Bell}
            label="Notificações"
            trailing={
              <Toggle
                on={notifications}
                onChange={(v) => {
                  setNotifications(v);
                  push(v ? "Notificações ativadas" : "Notificações desativadas", "info");
                }}
              />
            }
          />
          <SettingRow icon={UserIcon} label="Dados pessoais" chevron />
          <SettingRow icon={CreditCard} label="Histórico de pagamentos" chevron />
          <SettingRow icon={Target} label="Metas pessoais" chevron />
          <SettingRow icon={HelpCircle} label="Suporte / Contato" chevron />
          <SettingRow icon={Info} label="Sobre o App" chevron />
        </div>
      </section>

      <button
        onClick={() => {
          logout();
          navigate("/onboarding");
        }}
        className="w-full btn-secondary flex items-center justify-center gap-2 !text-danger hover:!border-danger/40"
      >
        <LogOut className="w-4 h-4" />
        Sair
      </button>

      <p className="text-center text-[11px] text-muted">
        Reserva CrossFit · Sorocaba/SP · v1.0 demo
      </p>

      {/* Plans modal */}
      <Modal
        open={plansOpen}
        onClose={() => setPlansOpen(false)}
        title="Planos disponíveis"
      >
        <div className="space-y-3">
          {mockPlans.map((p) => (
            <div
              key={p.id}
              className={`relative p-4 rounded-card border ${
                p.highlight
                  ? "border-primary bg-primary/5"
                  : p.current
                    ? "border-primary/60"
                    : "border-border bg-surface-2"
              }`}
            >
              {p.highlight && (
                <div className="absolute -top-2 right-4 bg-primary text-black text-[10px] font-bold font-display uppercase px-2 py-0.5 rounded">
                  Mais popular
                </div>
              )}
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="font-display font-black uppercase text-xl">
                    {p.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display font-black text-primary text-2xl leading-none">
                    R$ {p.price}
                  </p>
                  <p className="text-[11px] text-muted">por {p.period}</p>
                </div>
              </div>
              <ul className="mt-3 space-y-1.5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                disabled={p.current}
                onClick={() => {
                  push(`Plano ${p.name} selecionado! 💚`, "success");
                  setPlansOpen(false);
                }}
                className={`mt-4 w-full py-2.5 rounded-lg font-display font-bold uppercase tracking-wider text-sm transition ${
                  p.current
                    ? "bg-surface-2 text-muted border border-border"
                    : "bg-primary text-black hover:bg-primary-dark"
                }`}
              >
                {p.current ? "Seu plano atual" : "Assinar"}
              </button>
            </div>
          ))}

          <div className="flex items-center gap-2 text-[11px] text-muted mt-2">
            <Star className="w-3 h-3 text-warning" />
            Planos anuais incluem análise física trimestral
          </div>
        </div>
      </Modal>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="!p-4">
      <p className="text-[11px] uppercase tracking-wider text-muted font-semibold">
        {label}
      </p>
      <p className="stat mt-2">{value}</p>
    </Card>
  );
}

function SettingRow({
  icon: Icon,
  label,
  trailing,
  chevron,
}: {
  icon: typeof Bell;
  label: string;
  trailing?: React.ReactNode;
  chevron?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 hover:bg-surface-2 transition cursor-pointer">
      <Icon className="w-4 h-4 text-primary" />
      <span className="flex-1 text-sm font-medium">{label}</span>
      {trailing}
      {chevron && <ChevronRight className="w-4 h-4 text-muted" />}
    </div>
  );
}

function Toggle({
  on,
  onChange,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!on)}
      role="switch"
      aria-checked={on}
      className={`relative w-11 h-6 rounded-full transition ${on ? "bg-primary" : "bg-surface-2 border border-border"}`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-black transition-all ${on ? "left-[22px]" : "left-0.5 bg-muted"}`}
      />
    </button>
  );
}
