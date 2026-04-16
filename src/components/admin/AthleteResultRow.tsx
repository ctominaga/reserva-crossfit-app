import { Check, Circle } from "lucide-react";

export interface AthleteResult {
  athleteId: string;
  name: string;
  initial: string;
  color: string;
  checkedIn: boolean;
  level: "" | "RX" | "Scaled" | "Beginner";
  result: string;
}

interface AthleteResultRowProps {
  data: AthleteResult;
  onChange: (updated: AthleteResult) => void;
  onSave: () => void;
}

export function AthleteResultRow({ data, onChange, onSave }: AthleteResultRowProps) {
  return (
    <div className="flex items-center gap-2 py-3 px-3 border-b border-border last:border-0">
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
        onChange={(e) => onChange({ ...data, level: e.target.value as AthleteResult["level"] })}
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
  );
}
