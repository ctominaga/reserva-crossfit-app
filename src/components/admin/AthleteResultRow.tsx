import { Check, Circle, ClipboardList } from "lucide-react";
import type { Movement, MovementLevel, MovementResult } from "../../data/mock";

export interface AthleteResult {
  athleteId: string;
  name: string;
  initial: string;
  color: string;
  checkedIn: boolean;
  level: "" | "RX" | "Scaled" | "Beginner";
  result: string;
  movementResults?: MovementResult[];
  notes?: string;
}

interface AthleteResultRowProps {
  data: AthleteResult;
  wodMovements: Movement[];
  onChange: (updated: AthleteResult) => void;
  onSave: () => void;
}

const LEVEL_BUTTONS: Array<{ value: MovementLevel; label: string }> = [
  { value: "rx", label: "RX" },
  { value: "scaled", label: "SC" },
  { value: "beginner", label: "BG" },
];

function generalToMovementLevel(level: AthleteResult["level"]): MovementLevel {
  if (level === "RX") return "rx";
  if (level === "Beginner") return "beginner";
  return "scaled";
}

function placeholderFor(movementName: string): string {
  const n = movementName.toLowerCase();
  if (n.includes("toes to bar") || n.includes("t2b")) return "ex: knees raise, 10 reps...";
  if (n.includes("kettlebell") || n.includes("goblet") || n.includes("kb")) return "ex: carga 12kg...";
  if (n.includes("pull-up") || n.includes("pullup")) return "ex: jumping pull-ups, elástico...";
  if (n.includes("box jump")) return "ex: altura 50cm ou step-ups...";
  if (n.includes("thruster")) return "ex: carga 30kg...";
  if (n.includes("run") || n.includes("corrida")) return "ex: ritmo mais leve...";
  if (n.includes("muscle-up") || n.includes("muscle up")) return "ex: jumping muscle-up...";
  if (n.includes("hspu") || n.includes("handstand")) return "ex: pike push-up...";
  return "variação ou observação...";
}

function levelButtonClass(active: boolean, value: MovementLevel): string {
  const base = "px-2.5 py-1 text-[11px] font-bold uppercase rounded border transition";
  if (!active) return `${base} border-border bg-surface-2 text-muted hover:border-muted/60`;
  if (value === "rx") return `${base} border-primary bg-primary text-black`;
  if (value === "scaled") return `${base} border-warning bg-warning/20 text-warning`;
  return `${base} border-muted bg-surface text-muted`;
}

export function AthleteResultRow({ data, wodMovements, onChange, onSave }: AthleteResultRowProps) {
  const isExpanded = data.level === "Scaled" || data.level === "Beginner";

  const handleGeneralLevelChange = (next: AthleteResult["level"]) => {
    if (next === "RX" || next === "") {
      onChange({ ...data, level: next, movementResults: undefined });
      return;
    }
    const defaultLevel = generalToMovementLevel(next);
    const existing = data.movementResults ?? [];
    const byName = new Map(existing.map((m) => [m.movementName, m]));
    const merged: MovementResult[] = wodMovements.map((m) => {
      const prev = byName.get(m.name);
      return prev ?? { movementName: m.name, level: defaultLevel, note: "" };
    });
    onChange({ ...data, level: next, movementResults: merged });
  };

  const updateMovementResult = (idx: number, patch: Partial<MovementResult>) => {
    const current = data.movementResults ?? [];
    const next = current.map((m, i) => (i === idx ? { ...m, ...patch } : m));
    onChange({ ...data, movementResults: next });
  };

  return (
    <div className="border-b border-border last:border-0">
      <div className="flex items-center gap-2 py-3 px-3">
        <button
          onClick={() => onChange({ ...data, checkedIn: !data.checkedIn })}
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition ${
            data.checkedIn
              ? "bg-primary text-black"
              : "bg-surface-2 border border-border text-muted"
          }`}
        >
          {data.checkedIn ? <Check className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
        </button>

        <div
          className="w-8 h-8 rounded-full flex items-center justify-center font-display font-black text-xs shrink-0"
          style={{ backgroundColor: data.color + "22", color: data.color }}
        >
          {data.initial}
        </div>

        <span className="text-sm font-semibold flex-1 min-w-0 truncate">{data.name}</span>

        <select
          value={data.level}
          onChange={(e) => handleGeneralLevelChange(e.target.value as AthleteResult["level"])}
          className="w-20 px-2 py-1.5 rounded-lg bg-surface-2 border border-border text-xs outline-none focus:border-primary"
        >
          <option value="">--</option>
          <option value="RX">RX</option>
          <option value="Scaled">Scaled</option>
          <option value="Beginner">Beginner</option>
        </select>

        <input
          value={data.result}
          onChange={(e) => onChange({ ...data, result: e.target.value })}
          placeholder="mm:ss"
          className="w-16 px-2 py-1.5 rounded-lg bg-surface-2 border border-border text-xs outline-none focus:border-primary text-center"
        />

        <button
          onClick={onSave}
          className="w-7 h-7 rounded-full bg-primary/15 text-primary flex items-center justify-center hover:bg-primary/25 transition shrink-0"
          title="Salvar"
        >
          <Check className="w-3.5 h-3.5" />
        </button>
      </div>

      {isExpanded && wodMovements.length > 0 && (
        <div className="px-3 pb-3 pt-1 bg-surface-2/40 border-t border-border/60 space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted">
            <ClipboardList className="w-3.5 h-3.5" />
            Detalhes por movimento
          </div>

          <div className="space-y-1.5">
            {wodMovements.map((mv, idx) => {
              const current = data.movementResults?.[idx];
              const movLevel = current?.level ?? generalToMovementLevel(data.level);
              return (
                <div key={`${mv.name}-${idx}`} className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-text flex-1 min-w-[9rem] truncate" title={mv.name}>
                    {mv.name}
                    {mv.weight ? <span className="text-muted"> · {mv.weight}</span> : null}
                  </span>
                  <div className="flex gap-1 shrink-0">
                    {LEVEL_BUTTONS.map((btn) => (
                      <button
                        key={btn.value}
                        type="button"
                        onClick={() => updateMovementResult(idx, { level: btn.value })}
                        className={levelButtonClass(movLevel === btn.value, btn.value)}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                  {movLevel !== "rx" && (
                    <input
                      type="text"
                      value={current?.note ?? ""}
                      onChange={(e) => updateMovementResult(idx, { note: e.target.value })}
                      placeholder={placeholderFor(mv.name)}
                      className="w-full sm:flex-1 sm:min-w-[7rem] bg-surface-2 border border-border rounded px-2 py-1 text-xs text-text placeholder:text-muted/50 focus:border-primary/40 focus:outline-none transition"
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted">
              Observação geral
            </label>
            <input
              type="text"
              value={data.notes ?? ""}
              onChange={(e) => onChange({ ...data, notes: e.target.value })}
              placeholder="observações sobre o treino do atleta..."
              className="mt-1 w-full bg-surface-2 border border-border rounded px-2 py-1.5 text-xs text-text placeholder:text-muted/50 focus:border-primary/40 focus:outline-none transition"
            />
          </div>
        </div>
      )}
    </div>
  );
}
