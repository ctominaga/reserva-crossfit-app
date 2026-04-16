import { Link } from "react-router-dom";
import {
  Flame,
  Trophy,
  TrendingUp,
  Dumbbell,
  Calendar as CalIcon,
  Star,
  ChevronRight,
  CheckCircle,
  Users,
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { mockUser, mockFeed } from "../data/mock";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth();
  const now = new Date();
  const weekday = now.toLocaleDateString("pt-BR", { weekday: "long" });
  const date = now.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
  });

  const progress = (mockUser.plan.daysUsed / mockUser.plan.daysTotal) * 100;
  const expires = new Date(mockUser.plan.expiresAt).toLocaleDateString("pt-BR");

  return (
    <div className="px-4 py-4 space-y-5 max-w-xl mx-auto pb-24">
      {/* Greeting */}
      <div>
        <h1 className="font-display font-black uppercase text-3xl">
          Olá, {user?.firstName ?? mockUser.firstName} <span className="inline-block">👊</span>
        </h1>
        <p className="text-muted capitalize text-sm mt-0.5">
          {weekday} · {date}
        </p>
      </div>

      {/* Plano ativo */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <Badge variant="primary">ATIVO</Badge>
            <h3 className="font-display font-black uppercase text-xl mt-2">
              {mockUser.plan.name}
            </h3>
            <p className="text-muted text-xs mt-0.5">
              Vencimento: {expires}
            </p>
          </div>
          <div className="text-right">
            <p className="font-display font-black text-primary text-2xl leading-none">
              {mockUser.plan.daysUsed}
              <span className="text-muted text-lg">/{mockUser.plan.daysTotal}</span>
            </p>
            <p className="text-[11px] text-muted uppercase tracking-wider">
              dias
            </p>
          </div>
        </div>
        <div className="mt-3 h-1.5 bg-surface-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </Card>

      {/* Próxima aula */}
      <section>
        <h2 className="section-title mb-3">Próxima aula</h2>
        <Link to="/wod" className="block">
          <Card accent className="card-hover">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-display font-black text-3xl text-primary leading-none">
                  07:00
                </p>
                <p className="font-display font-black uppercase text-lg mt-1">
                  WOD do Dia
                </p>
                <p className="text-muted text-sm">Coach Rafael</p>
                <div className="flex items-center gap-1 mt-2 text-primary text-xs font-semibold">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Vaga confirmada
                </div>
              </div>
              <div className="flex items-center gap-1 text-primary">
                <span className="font-display font-bold uppercase text-sm">Ver WOD</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </Card>
        </Link>
      </section>

      {/* Resumo da semana */}
      <section>
        <h2 className="section-title mb-3">Resumo da semana</h2>
        <div className="grid grid-cols-2 gap-3">
          <MiniStat
            icon={Dumbbell}
            label="Treinos"
            value="4"
            hint="esta semana"
          />
          <MiniStat
            icon={Flame}
            label="Sequência"
            value={`${mockUser.streak} dias`}
            hint="Em chamas!"
          />
          <MiniStat
            icon={Star}
            label="Melhor PR"
            value="Fran"
            hint="4:32 neste mês"
          />
          <MiniStat
            icon={Trophy}
            label="Ranking"
            value={`#${7}`}
            hint="no box"
          />
        </div>
      </section>

      {/* Coaches */}
      <section>
        <Link to="/coaches" className="block">
          <Card accent className="card-hover">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-display font-black uppercase text-base">
                  Nossos Coaches
                </h3>
                <p className="text-xs text-muted">Conheça a equipe do Reserva CrossFit</p>
              </div>
              <ChevronRight className="w-4 h-4 text-primary" />
            </div>
          </Card>
        </Link>
      </section>

      {/* Feed */}
      <section>
        <h2 className="section-title mb-3">Atividade recente</h2>
        <div className="space-y-2">
          {mockFeed.map((item) => (
            <Card key={item.id} className="!p-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center text-primary shrink-0">
                  {item.icon === "pr" && <TrendingUp className="w-5 h-5" />}
                  {item.icon === "wod" && <Dumbbell className="w-5 h-5" />}
                  {item.icon === "event" && <CalIcon className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{item.title}</p>
                  <p className="text-xs text-muted truncate">{item.subtitle}</p>
                </div>
                <span className="text-[11px] text-muted shrink-0">
                  {item.time}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Flame;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wider text-muted font-semibold">
          {label}
        </span>
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <p className="stat mt-2">{value}</p>
      <p className="text-[11px] text-muted mt-1">{hint}</p>
    </div>
  );
}
