import { Clock, Check, Users } from "lucide-react";
import type { ClassSession } from "../../data/mock";

interface ClassCardProps {
  session: ClassSession;
  reserved: boolean;
  onReserve: (id: string) => void;
  onCancel: (id: string) => void;
  isToday?: boolean;
  onCheckIn?: (id: string) => void;
}

export function ClassCard({
  session,
  reserved,
  onReserve,
  onCancel,
  isToday,
  onCheckIn,
}: ClassCardProps) {
  const actualBooked = reserved ? session.booked + 1 : session.booked;
  const free = session.capacity - actualBooked;
  const ratio = Math.min(1, actualBooked / session.capacity);

  const barColor =
    free <= 0
      ? "bg-danger"
      : free <= 5
        ? "bg-warning"
        : "bg-primary";

  const badgeText =
    free <= 0 ? "Lotado" : free <= 5 ? `${free} vagas` : `${free} vagas`;
  const badgeColor =
    free <= 0
      ? "text-danger"
      : free <= 5
        ? "text-warning"
        : "text-primary";

  return (
    <div
      className={`card p-4 transition ${reserved ? "border-l-4 border-l-primary" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-muted text-xs">
            <Clock className="w-3.5 h-3.5" />
            <span className="font-semibold">{session.time}</span>
          </div>
          <h3 className="font-display font-black uppercase text-xl mt-0.5">
            {session.name}
          </h3>
          <p className="text-muted text-sm">{session.coach}</p>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end gap-1 text-xs text-muted">
            <Users className="w-3.5 h-3.5" />
            <span>
              {actualBooked}/{session.capacity}
            </span>
          </div>
          <p className={`text-xs font-bold mt-1 ${badgeColor}`}>{badgeText}</p>
        </div>
      </div>

      <div className="mt-3 h-1 bg-surface-2 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all ${barColor}`}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>

      <div className="mt-3 flex gap-2">
        {reserved ? (
          <>
            <button
              onClick={() => onCancel(session.id)}
              className="flex-1 py-2 rounded-lg border border-border text-sm font-semibold hover:border-danger hover:text-danger transition"
            >
              Cancelar
            </button>
            {isToday && onCheckIn && (
              <button
                onClick={() => onCheckIn(session.id)}
                className="flex-1 py-2 rounded-lg bg-primary text-black text-sm font-bold font-display uppercase tracking-wider hover:bg-primary-dark transition"
              >
                Check-in
              </button>
            )}
            {!isToday && (
              <div className="flex-1 py-2 rounded-lg bg-primary/15 border border-primary/40 text-primary text-sm font-bold flex items-center justify-center gap-1">
                <Check className="w-4 h-4" /> Reservado
              </div>
            )}
          </>
        ) : (
          <button
            disabled={free <= 0}
            onClick={() => onReserve(session.id)}
            className="flex-1 py-2 rounded-lg bg-primary text-black text-sm font-bold font-display uppercase tracking-wider hover:bg-primary-dark disabled:bg-surface-2 disabled:text-muted disabled:cursor-not-allowed transition"
          >
            {free <= 0 ? "Lotado" : "Reservar vaga"}
          </button>
        )}
      </div>
    </div>
  );
}
