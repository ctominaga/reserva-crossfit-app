import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface PromptEditorProps {
  prompt: string;
  onChange: (value: string) => void;
  label?: string;
}

export function PromptEditor({ prompt, onChange, label = "Prompt enviado à IA" }: PromptEditorProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-surface-2 transition"
      >
        <span className="text-xs font-bold uppercase tracking-wider text-muted">{label}</span>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted" /> : <ChevronDown className="w-4 h-4 text-muted" />}
      </button>
      {expanded && (
        <div className="px-4 pb-4">
          <textarea
            value={prompt}
            onChange={(e) => onChange(e.target.value)}
            rows={12}
            className="w-full px-3 py-3 rounded-lg bg-surface-2 border border-border focus:border-primary outline-none text-xs font-mono resize-y leading-relaxed"
          />
        </div>
      )}
    </div>
  );
}
