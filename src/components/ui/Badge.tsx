type BadgeVariant = "primary" | "warning" | "danger" | "neutral" | "outline";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  primary: "bg-primary text-black",
  warning: "bg-warning/20 text-warning border border-warning/40",
  danger: "bg-danger/20 text-danger border border-danger/40",
  neutral: "bg-surface-2 text-muted border border-border",
  outline: "border border-primary text-primary",
};

export function Badge({ children, variant = "primary", className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold font-display uppercase tracking-wider ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
