import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
}

export function EmptyState({ icon: Icon, title, subtitle }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center px-6">
      <div className="w-16 h-16 rounded-full bg-surface-2 flex items-center justify-center mb-3">
        <Icon className="w-8 h-8 text-primary" />
      </div>
      <p className="font-display font-black uppercase text-lg">{title}</p>
      {subtitle && <p className="text-muted text-sm mt-1">{subtitle}</p>}
    </div>
  );
}
