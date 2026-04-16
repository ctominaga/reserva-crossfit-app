import { TrendingUp } from "lucide-react";
import type { PR } from "../../data/mock";
import { Badge } from "../ui/Badge";

interface PRCardProps {
  pr: PR;
  onUpdate: (pr: PR) => void;
}

export function PRCard({ pr, onUpdate }: PRCardProps) {
  return (
    <div className="card p-4 flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-2xl shrink-0">
        {pr.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-display font-black uppercase text-base truncate">
            {pr.movement}
          </h4>
          <Badge variant="primary">PR</Badge>
        </div>
        <div className="flex items-baseline gap-2 mt-0.5">
          <span className="font-display font-black text-2xl text-primary leading-none">
            {pr.value}
          </span>
          <span className="text-muted text-sm">{pr.unit}</span>
        </div>
        <p className="text-xs text-muted mt-0.5">Registrado em {pr.date}</p>
      </div>
      <button
        onClick={() => onUpdate(pr)}
        className="shrink-0 p-2 rounded-lg border border-border hover:border-primary hover:text-primary transition"
        aria-label={`Atualizar PR de ${pr.movement}`}
      >
        <TrendingUp className="w-4 h-4" />
      </button>
    </div>
  );
}
