import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Modal } from "../components/ui/Modal";
import { PRCard } from "../components/features/PRCard";
import { RankingList } from "../components/features/RankingList";
import {
  mockPRs,
  mockBenchmarks,
  mockRanking,
  mockWeeklyFrequency,
  buildFrequency,
  type PR,
  type PRCategory,
} from "../data/mock";
import { useToast } from "../hooks/useToast";

type Tab = "prs" | "benchmarks" | "frequency" | "ranking";
type RankFilter = "week" | "month" | "all";

const TABS: Array<{ value: Tab; label: string }> = [
  { value: "prs", label: "Meus PRs" },
  { value: "benchmarks", label: "Benchmarks" },
  { value: "frequency", label: "Frequência" },
  { value: "ranking", label: "Ranking" },
];

export default function Evolucao() {
  const [tab, setTab] = useState<Tab>("prs");

  return (
    <div className="px-4 py-4 max-w-xl mx-auto pb-24 space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`chip ${tab === t.value ? "chip-active" : ""}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="animate-fade-in">
        {tab === "prs" && <PRsTab />}
        {tab === "benchmarks" && <BenchmarksTab />}
        {tab === "frequency" && <FrequencyTab />}
        {tab === "ranking" && <RankingTab />}
      </div>
    </div>
  );
}

// -------------------- PRs --------------------

const CATEGORY_META: Record<PRCategory, { label: string; icon: string; description: string }> = {
  barbell:     { label: 'Barbell',     icon: '🏋️', description: 'Levantamentos com barra' },
  gymnastics:  { label: 'Ginástica',   icon: '🤸', description: 'Movimentos ginásticos' },
  endurance:   { label: 'Endurance',   icon: '🏃', description: 'Provas de resistência' },
  wod_girls:   { label: 'The Girls',   icon: '👧', description: 'WODs clássicos femininos' },
  wod_heroes:  { label: 'Heroes',      icon: '🦅', description: 'WODs em homenagem a heróis' },
  wod_open:    { label: 'Open',        icon: '🏆', description: 'WODs do CrossFit Open' },
  wod_notable: { label: 'Notable',     icon: '⭐', description: 'Outros benchmarks notáveis' },
};

const CATEGORY_ORDER: PRCategory[] = [
  'barbell', 'gymnastics', 'endurance', 'wod_girls', 'wod_heroes', 'wod_open', 'wod_notable',
];

function PRsTab() {
  const [prs, setPRs] = useState<PR[]>(mockPRs);
  const [selectedCategory, setSelectedCategory] = useState<PRCategory>('barbell');
  const [editPR, setEditPR] = useState<PR | null>(null);
  const [newValue, setNewValue] = useState("");
  const { push } = useToast();

  const filteredPRs = prs.filter((pr) => pr.category === selectedCategory);
  const meta = CATEGORY_META[selectedCategory];

  // Only show categories that have at least one PR
  const availableCategories = CATEGORY_ORDER.filter((cat) =>
    prs.some((pr) => pr.category === cat),
  );

  const openEdit = (pr: PR) => {
    setEditPR(pr);
    setNewValue(pr.value);
  };

  const handleSave = () => {
    if (!editPR || !newValue.trim()) return;
    const today = new Date().toLocaleDateString("pt-BR");
    setPRs(
      prs.map((p) =>
        p.id === editPR.id ? { ...p, value: newValue, date: today } : p,
      ),
    );
    push(`Novo PR registrado em ${editPR.movement}! 🔥`, "success");
    setEditPR(null);
  };

  return (
    <div className="space-y-3">
      {/* Category selector */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
        {availableCategories.map((cat) => {
          const catMeta = CATEGORY_META[cat];
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`chip whitespace-nowrap flex items-center gap-1 ${
                selectedCategory === cat ? "chip-active" : ""
              }`}
            >
              <span>{catMeta.icon}</span>
              <span>{catMeta.label}</span>
            </button>
          );
        })}
      </div>

      {/* Category header */}
      <div className="card p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{meta.icon}</span>
          <div>
            <h3 className="font-display font-black uppercase text-sm">
              {meta.label}
            </h3>
            <p className="text-[11px] text-muted">{meta.description}</p>
          </div>
        </div>
        <span className="text-xs text-muted font-semibold">
          {filteredPRs.length} PRs
        </span>
      </div>

      {/* PR list */}
      {filteredPRs.map((pr) => (
        <PRCard key={pr.id} pr={pr} onUpdate={openEdit} />
      ))}

      {filteredPRs.length === 0 && (
        <div className="text-center py-8 text-muted text-sm">
          Nenhum PR registrado nesta categoria.
        </div>
      )}

      <Modal
        open={!!editPR}
        onClose={() => setEditPR(null)}
        title={`Atualizar ${editPR?.movement ?? ""}`}
      >
        {editPR && (
          <div className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-muted font-bold">
                Novo valor ({editPR.unit})
              </label>
              <input
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                type="text"
                inputMode="decimal"
                className="w-full mt-1 px-3 py-3 rounded-lg bg-surface-2 border border-border focus:border-primary outline-none font-display font-black text-2xl text-primary"
              />
              <p className="text-xs text-muted mt-1">
                PR atual: {editPR.value} {editPR.unit}
              </p>
            </div>
            <button onClick={handleSave} className="btn-primary w-full">
              Salvar PR
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}

// -------------------- Benchmarks --------------------

function BenchmarksTab() {
  const [selectedId, setSelectedId] = useState(mockBenchmarks[0].id);
  const selected =
    mockBenchmarks.find((b) => b.id === selectedId) ?? mockBenchmarks[0];

  return (
    <div className="space-y-4">
      {/* Benchmark cards */}
      <div className="grid grid-cols-2 gap-3">
        {mockBenchmarks.map((b) => {
          const isActive = selectedId === b.id;
          const improved = b.previousResult !== undefined;
          return (
            <button
              key={b.id}
              onClick={() => setSelectedId(b.id)}
              className={`card p-3 text-left transition ${isActive ? "border-primary" : "card-hover"}`}
            >
              <p className="font-display font-black uppercase text-lg">
                {b.name}
              </p>
              <p className="font-display font-black text-primary text-2xl leading-none mt-1">
                {b.currentResult}
              </p>
              {improved && (
                <p className="text-[11px] text-muted mt-1">
                  ↓ de {b.previousResult}
                </p>
              )}
            </button>
          );
        })}
      </div>

      {/* Chart */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-display font-black uppercase text-lg">
              {selected.name}
            </p>
            <p className="text-xs text-muted">{selected.description}</p>
          </div>
          <Badge variant="outline">
            {selected.unit === "time" ? "Tempo" : selected.unit === "rounds" ? "Rounds" : "Reps"}
          </Badge>
        </div>
        <div className="h-52 -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={selected.history}>
              <CartesianGrid stroke="#2A2A2A" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#888"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) =>
                  selected.unit === "time" ? formatSeconds(v) : String(v)
                }
                width={45}
              />
              <Tooltip
                contentStyle={{
                  background: "#111",
                  border: "1px solid #2A2A2A",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(v: number) =>
                  selected.unit === "time" ? formatSeconds(v) : v
                }
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#22C55E"
                strokeWidth={2.5}
                dot={{ fill: "#22C55E", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

function formatSeconds(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// -------------------- Frequency --------------------

function FrequencyTab() {
  const freq = useMemo(() => buildFrequency(new Date()), []);
  const trained = freq.filter((f) => f.trained).length;
  const avgPerWeek = (trained / (60 / 7)).toFixed(1);

  // Split by month for nicer grouping
  const byMonth = useMemo(() => {
    const map = new Map<string, typeof freq>();
    freq.forEach((f) => {
      const d = new Date(f.date);
      const key = d.toLocaleDateString("pt-BR", { month: "long" });
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(f);
    });
    return Array.from(map.entries());
  }, [freq]);

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <p className="text-xs uppercase tracking-wider text-muted font-bold">
            Treinos (60 dias)
          </p>
          <p className="stat mt-2">{trained}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wider text-muted font-bold">
            Média
          </p>
          <p className="stat mt-2">
            {avgPerWeek}
            <span className="text-muted text-base font-semibold">×/sem</span>
          </p>
        </Card>
      </div>

      {/* Heatmap */}
      <Card>
        <p className="font-display font-black uppercase text-sm mb-3 text-muted">
          Calendário de frequência
        </p>
        <div className="space-y-3">
          {byMonth.map(([month, days]) => (
            <div key={month}>
              <p className="text-xs uppercase text-muted font-semibold mb-1.5">
                {month}
              </p>
              <div className="grid grid-cols-15 gap-1" style={{ gridTemplateColumns: "repeat(15, minmax(0, 1fr))" }}>
                {days.map((d) => (
                  <div
                    key={d.date}
                    title={`${d.date} — ${d.trained ? "treinou" : "descanso"}`}
                    className="aspect-square rounded-sm"
                    style={{
                      background: d.trained
                        ? d.intensity >= 3
                          ? "#22C55E"
                          : d.intensity === 2
                            ? "#16A34A"
                            : "#15803D"
                        : "#1A1A1A",
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 justify-end mt-3 text-[10px] text-muted">
          <span>Menos</span>
          <div className="flex gap-0.5">
            {["#1A1A1A", "#15803D", "#16A34A", "#22C55E"].map((c) => (
              <div
                key={c}
                className="w-3 h-3 rounded-sm"
                style={{ background: c }}
              />
            ))}
          </div>
          <span>Mais</span>
        </div>
      </Card>

      {/* Weekly bar chart */}
      <Card>
        <p className="font-display font-black uppercase text-sm mb-3 text-muted">
          Treinos por semana (últimas 8)
        </p>
        <div className="h-44 -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockWeeklyFrequency}>
              <CartesianGrid stroke="#2A2A2A" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="week"
                stroke="#888"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={25}
              />
              <Tooltip
                contentStyle={{
                  background: "#111",
                  border: "1px solid #2A2A2A",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                cursor={{ fill: "#1A1A1A" }}
              />
              <Bar dataKey="count" fill="#22C55E" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

// -------------------- Ranking --------------------

function RankingTab() {
  const [filter, setFilter] = useState<RankFilter>("month");
  const options: Array<{ value: RankFilter; label: string }> = [
    { value: "week", label: "Esta semana" },
    { value: "month", label: "Este mês" },
    { value: "all", label: "Geral" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            onClick={() => setFilter(o.value)}
            className={`chip ${filter === o.value ? "chip-active" : ""}`}
          >
            {o.label}
          </button>
        ))}
      </div>
      <RankingList entries={mockRanking} />
    </div>
  );
}
