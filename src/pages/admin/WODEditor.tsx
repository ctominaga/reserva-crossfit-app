import { useState } from "react";
import { Plus, X, Save, Minus, AlertTriangle } from "lucide-react";
import { Card } from "../../components/ui/Card";
import {
  DEFAULT_CLASS_TIMES,
  type ClassType,
  type ScheduleSlot,
  type CapacityOverrides,
  type ScheduleOverrides,
} from "../../data/mock";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { useToast } from "../../hooks/useToast";

interface WODMovement {
  name: string;
  reps: string;
  weight: string;
}

const WOD_TYPES = ["AMRAP", "For Time", "EMOM", "Chipper", "Strength"] as const;
const CLASS_TYPE_OPTIONS: ClassType[] = ["WOD", "Weightlifting", "Endurance", "Open Box"];
const COACHES = ["Coach Rafael", "Coach Bia", "Coach Dudu", "Coach Marina"];
const WEEKDAY_NAMES = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

type EditorTab = "wod" | "capacity" | "schedule";

export default function WODEditor() {
  const [tab, setTab] = useState<EditorTab>("wod");
  const [, setCustomWOD] = useLocalStorage<object | null>("reserva-wod-custom", null);
  const [capOverrides, setCapOverrides] = useLocalStorage<CapacityOverrides>("reserva-capacity-overrides", {});
  const [schedOverrides, setSchedOverrides] = useLocalStorage<ScheduleOverrides>("reserva-schedule-overrides", {});
  const { push } = useToast();

  return (
    <div className="px-4 py-4 max-w-xl mx-auto pb-24 space-y-5">
      <h1 className="font-display font-black uppercase text-2xl">WOD & Configurações</h1>

      {/* Tab selector */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
        {([
          { v: "wod" as const, l: "WOD Editor" },
          { v: "capacity" as const, l: "Vagas" },
          { v: "schedule" as const, l: "Grade Horária" },
        ]).map((t) => (
          <button key={t.v} onClick={() => setTab(t.v)} className={`chip ${tab === t.v ? "chip-active" : ""}`}>
            {t.l}
          </button>
        ))}
      </div>

      {tab === "wod" && <WODTab setCustomWOD={setCustomWOD} push={push} />}
      {tab === "capacity" && <CapacityTab overrides={capOverrides} setOverrides={setCapOverrides} push={push} />}
      {tab === "schedule" && <ScheduleTab overrides={schedOverrides} setOverrides={setSchedOverrides} push={push} />}
    </div>
  );
}

// ======================== WOD TAB ========================

function WODTab({ setCustomWOD, push }: { setCustomWOD: (v: object | null) => void; push: (t: string, k?: "success" | "error" | "info") => void }) {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [type, setType] = useState<string>("AMRAP");
  const [duration, setDuration] = useState("20");
  const [title, setTitle] = useState("");
  const [warmup, setWarmup] = useState("400m Run em ritmo leve\n3 rounds: 10 Air Squats + 10 Push-ups");
  const [movements, setMovements] = useState<WODMovement[]>([
    { name: "Thrusters", reps: "15", weight: "43/29kg" },
    { name: "Pull-ups", reps: "10", weight: "" },
  ]);
  const [scalingRx, setScalingRx] = useState("Executar conforme prescrito.");
  const [scalingScaled, setScalingScaled] = useState("");
  const [scalingBeginner, setScalingBeginner] = useState("");
  const [cooldown, setCooldown] = useState("Foam roller 5 min\nHip flexor stretch 2 min por lado");

  const addMovement = () => setMovements([...movements, { name: "", reps: "", weight: "" }]);
  const removeMovement = (i: number) => setMovements(movements.filter((_, idx) => idx !== i));
  const updateMovement = (i: number, field: keyof WODMovement, value: string) => {
    const next = [...movements];
    next[i] = { ...next[i], [field]: value };
    setMovements(next);
  };

  const handlePublish = () => {
    if (!title.trim()) { push("Informe um título para o WOD", "error"); return; }
    const d = new Date(date + "T12:00:00");
    const weekday = d.toLocaleDateString("pt-BR", { weekday: "long" });
    const dayMonth = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
    setCustomWOD({
      date: d.toISOString(), dateLabel: `${weekday} — ${dayMonth}`, type, duration: Number(duration), title,
      warmup: warmup.split("\n").filter(Boolean),
      main: {
        description: `${duration} min ${type}`,
        movements: movements.filter((m) => m.name).map((m) => ({ name: m.name, reps: m.reps ? `${m.reps} reps` : undefined, weight: m.weight || undefined })),
        scaling: { rx: scalingRx || "Conforme prescrito.", scaled: scalingScaled || "Reduzir carga 30-40%.", beginner: scalingBeginner || "Foque em técnica com carga leve." },
      },
      cooldown: cooldown.split("\n").filter(Boolean),
    });
    push("WOD publicado com sucesso! Os alunos serão notificados.", "success");
  };

  return (
    <>
      <Card className="!p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted">Data</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full mt-1 px-3 py-2.5 rounded-lg bg-surface-2 border border-border focus:border-primary outline-none text-sm" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted">Tipo</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="w-full mt-1 px-3 py-2.5 rounded-lg bg-surface-2 border border-border focus:border-primary outline-none text-sm">
              {WOD_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted">Duração (min)</label>
            <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full mt-1 px-3 py-2.5 rounded-lg bg-surface-2 border border-border focus:border-primary outline-none text-sm" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted">Título</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Heavy Fran Style" className="w-full mt-1 px-3 py-2.5 rounded-lg bg-surface-2 border border-border focus:border-primary outline-none text-sm" />
          </div>
        </div>
      </Card>

      <section>
        <h2 className="section-title mb-3">Aquecimento</h2>
        <textarea value={warmup} onChange={(e) => setWarmup(e.target.value)} rows={3} placeholder="Um por linha..." className="w-full px-4 py-3 rounded-xl bg-surface border border-border focus:border-primary outline-none text-sm resize-none" />
      </section>

      <section>
        <h2 className="section-title mb-3">Parte Principal</h2>
        <div className="card overflow-hidden">
          {movements.map((m, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-2.5 border-b border-border last:border-0">
              <input value={m.name} onChange={(e) => updateMovement(i, "name", e.target.value)} placeholder="Movimento" className="flex-1 px-2 py-1.5 rounded-lg bg-surface-2 border border-border focus:border-primary outline-none text-xs" />
              <input value={m.reps} onChange={(e) => updateMovement(i, "reps", e.target.value)} placeholder="Reps" className="w-14 px-2 py-1.5 rounded-lg bg-surface-2 border border-border focus:border-primary outline-none text-xs text-center" />
              <input value={m.weight} onChange={(e) => updateMovement(i, "weight", e.target.value)} placeholder="Carga" className="w-20 px-2 py-1.5 rounded-lg bg-surface-2 border border-border focus:border-primary outline-none text-xs text-center" />
              <button onClick={() => removeMovement(i)} className="text-muted hover:text-danger shrink-0"><X className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
        <button onClick={addMovement} className="mt-2 w-full btn-ghost flex items-center justify-center gap-1.5 text-xs py-2"><Plus className="w-3.5 h-3.5" /> Adicionar movimento</button>
      </section>

      <section>
        <h2 className="section-title mb-3">Scaling</h2>
        <div className="space-y-3">
          <div><label className="text-xs font-bold uppercase tracking-wider text-muted">RX</label><input value={scalingRx} onChange={(e) => setScalingRx(e.target.value)} className="w-full mt-1 px-3 py-2.5 rounded-lg bg-surface-2 border border-border focus:border-primary outline-none text-sm" /></div>
          <div><label className="text-xs font-bold uppercase tracking-wider text-muted">Scaled</label><input value={scalingScaled} onChange={(e) => setScalingScaled(e.target.value)} placeholder="Ex: Reduzir carga 30%..." className="w-full mt-1 px-3 py-2.5 rounded-lg bg-surface-2 border border-border focus:border-primary outline-none text-sm" /></div>
          <div><label className="text-xs font-bold uppercase tracking-wider text-muted">Beginner</label><input value={scalingBeginner} onChange={(e) => setScalingBeginner(e.target.value)} placeholder="Ex: Foque em técnica..." className="w-full mt-1 px-3 py-2.5 rounded-lg bg-surface-2 border border-border focus:border-primary outline-none text-sm" /></div>
        </div>
      </section>

      <section>
        <h2 className="section-title mb-3">Cooldown</h2>
        <textarea value={cooldown} onChange={(e) => setCooldown(e.target.value)} rows={3} placeholder="Um por linha..." className="w-full px-4 py-3 rounded-xl bg-surface border border-border focus:border-primary outline-none text-sm resize-none" />
      </section>

      <div className="flex gap-3">
        <button onClick={() => { setTitle(""); push("Edição cancelada", "info"); }} className="btn-secondary flex-1">Cancelar</button>
        <button onClick={handlePublish} className="btn-primary flex-1 flex items-center justify-center gap-2"><Save className="w-4 h-4" /> Publicar WOD</button>
      </div>
    </>
  );
}

// ======================== CAPACITY TAB ========================

function CapacityTab({ overrides, setOverrides, push }: { overrides: CapacityOverrides; setOverrides: (v: CapacityOverrides) => void; push: (t: string, k?: "success" | "error" | "info") => void }) {
  const [subTab, setSubTab] = useState<"default" | "date">("default");
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [bulkValue, setBulkValue] = useState("20");

  const getVal = (key: string) => overrides[key] ?? 20;
  const setVal = (key: string, val: number) => setOverrides({ ...overrides, [key]: val });

  return (
    <>
      <div className="flex gap-2">
        <button onClick={() => setSubTab("default")} className={`chip ${subTab === "default" ? "chip-active" : ""}`}>Por Horário (Padrão)</button>
        <button onClick={() => setSubTab("date")} className={`chip ${subTab === "date" ? "chip-active" : ""}`}>Por Dia Específico</button>
      </div>

      {subTab === "default" && (
        <>
          <div className="card overflow-hidden">
            {DEFAULT_CLASS_TIMES.map((s) => {
              const key = `default|${s.time}`;
              const val = getVal(key);
              return (
                <div key={s.time} className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0">
                  <span className="font-display font-bold text-sm w-12">{s.time}</span>
                  <span className="text-xs text-muted flex-1">{s.name}</span>
                  <button onClick={() => setVal(key, Math.max(1, val - 1))} className="w-7 h-7 rounded-full bg-surface-2 flex items-center justify-center hover:bg-primary/15 transition"><Minus className="w-3 h-3" /></button>
                  <span className="font-display font-black text-primary w-8 text-center">{val}</span>
                  <button onClick={() => setVal(key, Math.min(50, val + 1))} className="w-7 h-7 rounded-full bg-surface-2 flex items-center justify-center hover:bg-primary/15 transition"><Plus className="w-3 h-3" /></button>
                </div>
              );
            })}
          </div>
          <button onClick={() => push("Padrões de vagas atualizados", "success")} className="btn-primary w-full">Salvar padrões</button>
        </>
      )}

      {subTab === "date" && (
        <>
          <Card className="!p-4 space-y-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted">Data</label>
              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full mt-1 px-3 py-2.5 rounded-lg bg-surface-2 border border-border focus:border-primary outline-none text-sm" />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted flex-1">Definir todas as vagas deste dia como:</span>
              <input type="number" value={bulkValue} onChange={(e) => setBulkValue(e.target.value)} className="w-16 px-2 py-1.5 rounded-lg bg-surface-2 border border-border focus:border-primary outline-none text-xs text-center" min={1} max={50} />
              <button onClick={() => {
                const next = { ...overrides };
                DEFAULT_CLASS_TIMES.forEach((s) => { next[`${selectedDate}|${s.time}`] = Number(bulkValue); });
                setOverrides(next);
                push("Vagas aplicadas em massa!", "success");
              }} className="btn-primary text-xs px-3 py-1.5">Aplicar a todos</button>
            </div>
          </Card>

          <div className="card overflow-hidden">
            {DEFAULT_CLASS_TIMES.map((s) => {
              const key = `${selectedDate}|${s.time}`;
              const val = overrides[key] ?? overrides[`default|${s.time}`] ?? 20;
              return (
                <div key={s.time} className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0">
                  <span className="font-display font-bold text-sm w-12">{s.time}</span>
                  <span className="text-xs text-muted flex-1">{s.name}</span>
                  <button onClick={() => setVal(key, Math.max(1, val - 1))} className="w-7 h-7 rounded-full bg-surface-2 flex items-center justify-center hover:bg-primary/15 transition"><Minus className="w-3 h-3" /></button>
                  <span className="font-display font-black text-primary w-8 text-center">{val}</span>
                  <button onClick={() => setVal(key, Math.min(50, val + 1))} className="w-7 h-7 rounded-full bg-surface-2 flex items-center justify-center hover:bg-primary/15 transition"><Plus className="w-3 h-3" /></button>
                </div>
              );
            })}
          </div>
          <button onClick={() => push("Alterações do dia salvas!", "success")} className="btn-primary w-full">Salvar alterações do dia</button>
        </>
      )}
    </>
  );
}

// ======================== SCHEDULE TAB ========================

function ScheduleTab({ overrides, setOverrides, push }: { overrides: ScheduleOverrides; setOverrides: (v: ScheduleOverrides) => void; push: (t: string, k?: "success" | "error" | "info") => void }) {
  const [subTab, setSubTab] = useState<"date" | "weekday">("date");
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [selectedWeekday, setSelectedWeekday] = useState(1); // Monday

  const dateKey = `date|${selectedDate}`;
  const weekdayKey = `weekday|${selectedWeekday}`;

  const currentSlots: ScheduleSlot[] = subTab === "date"
    ? (overrides[dateKey] ?? [...DEFAULT_CLASS_TIMES])
    : (overrides[weekdayKey] ?? [...DEFAULT_CLASS_TIMES]);

  const setSlots = (slots: ScheduleSlot[]) => {
    const key = subTab === "date" ? dateKey : weekdayKey;
    setOverrides({ ...overrides, [key]: slots });
  };

  const updateSlot = (idx: number, field: keyof ScheduleSlot, value: string) => {
    const next = [...currentSlots];
    next[idx] = { ...next[idx], [field]: value };
    setSlots(next);
  };

  const addSlot = () => setSlots([...currentSlots, { time: "10:00", name: "WOD", coach: "Coach Rafael" }]);
  const removeSlot = (idx: number) => setSlots(currentSlots.filter((_, i) => i !== idx));

  return (
    <>
      <div className="flex gap-2">
        <button onClick={() => setSubTab("date")} className={`chip ${subTab === "date" ? "chip-active" : ""}`}>Dia Específico</button>
        <button onClick={() => setSubTab("weekday")} className={`chip ${subTab === "weekday" ? "chip-active" : ""}`}>Dia da Semana</button>
      </div>

      {subTab === "date" && (
        <Card className="!p-4">
          <label className="text-xs font-bold uppercase tracking-wider text-muted">Data</label>
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full mt-1 px-3 py-2.5 rounded-lg bg-surface-2 border border-border focus:border-primary outline-none text-sm" />
        </Card>
      )}

      {subTab === "weekday" && (
        <>
          <Card className="!p-4 space-y-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted">Dia da semana</label>
              <select value={selectedWeekday} onChange={(e) => setSelectedWeekday(Number(e.target.value))} className="w-full mt-1 px-3 py-2.5 rounded-lg bg-surface-2 border border-border focus:border-primary outline-none text-sm">
                {WEEKDAY_NAMES.map((n, i) => <option key={i} value={i}>{n}</option>)}
              </select>
            </div>
          </Card>
          <div className="flex items-start gap-2 px-1">
            <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
            <p className="text-[11px] text-warning">Esta edição afeta todas as {WEEKDAY_NAMES[selectedWeekday]}s futuras. Dias anteriores não são afetados.</p>
          </div>
        </>
      )}

      {/* Slot editor */}
      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <span className="text-xs font-bold uppercase tracking-wider text-muted">
            Horários {subTab === "date" ? `de ${new Date(selectedDate + "T12:00:00").toLocaleDateString("pt-BR")}` : `para ${WEEKDAY_NAMES[selectedWeekday]}`}
          </span>
        </div>
        {currentSlots.map((s, i) => (
          <div key={i} className="flex items-center gap-2 px-3 py-2.5 border-b border-border last:border-0">
            <input value={s.time} onChange={(e) => updateSlot(i, "time", e.target.value)} placeholder="HH:MM" className="w-16 px-2 py-1.5 rounded-lg bg-surface-2 border border-border focus:border-primary outline-none text-xs text-center" />
            <select value={s.name} onChange={(e) => updateSlot(i, "name", e.target.value)} className="flex-1 px-2 py-1.5 rounded-lg bg-surface-2 border border-border focus:border-primary outline-none text-xs">
              {CLASS_TYPE_OPTIONS.map((t) => <option key={t}>{t}</option>)}
            </select>
            <select value={s.coach} onChange={(e) => updateSlot(i, "coach", e.target.value)} className="flex-1 px-2 py-1.5 rounded-lg bg-surface-2 border border-border focus:border-primary outline-none text-xs">
              {COACHES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <button onClick={() => removeSlot(i)} className="text-muted hover:text-danger shrink-0"><X className="w-4 h-4" /></button>
          </div>
        ))}
      </div>

      <button onClick={addSlot} className="w-full btn-ghost flex items-center justify-center gap-1.5 text-xs py-2"><Plus className="w-3.5 h-3.5" /> Adicionar horário</button>

      <button onClick={() => {
        push(subTab === "date" ? "Grade do dia salva!" : `Grade de ${WEEKDAY_NAMES[selectedWeekday]} salva!`, "success");
      }} className="btn-primary w-full flex items-center justify-center gap-2">
        <Save className="w-4 h-4" />
        {subTab === "date" ? "Salvar este dia" : `Aplicar a todas as ${WEEKDAY_NAMES[selectedWeekday]}s futuras`}
      </button>
    </>
  );
}
