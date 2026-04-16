import { ChevronDown, Flame } from "lucide-react";
import { useState } from "react";

export interface WODHistoryEntry {
  date: string;
  title: string;
  type: string;
  summary: string;
}

export function WODHistoryCard({ entry }: { entry: WODHistoryEntry }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full p-4 flex items-center justify-between gap-3"
      >
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2 text-xs text-muted">
            <Flame className="w-3.5 h-3.5 text-primary" />
            <span>{entry.date}</span>
            <span className="text-border">•</span>
            <span className="uppercase font-bold">{entry.type}</span>
          </div>
          <h4 className="font-display font-black uppercase text-lg mt-0.5">
            {entry.title}
          </h4>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-muted transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm text-muted border-t border-border pt-3 animate-fade-in">
          {entry.summary}
        </div>
      )}
    </div>
  );
}
