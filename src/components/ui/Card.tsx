interface CardProps {
  children: React.ReactNode;
  className?: string;
  accent?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = "", accent, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`card p-4 ${accent ? "border-l-4 border-l-primary" : ""} ${onClick ? "card-hover cursor-pointer" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
