import { Trophy, Medal } from "lucide-react";
import type { RankingEntry } from "../../data/mock";

interface RankingListProps {
  entries: RankingEntry[];
}

export function RankingList({ entries }: RankingListProps) {
  const podium = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="space-y-4">
      {/* Podium */}
      <div className="grid grid-cols-3 items-end gap-3">
        {/* 2nd */}
        <PodiumCell entry={podium[1]} heightClass="h-24" position={2} />
        {/* 1st */}
        <PodiumCell entry={podium[0]} heightClass="h-32" position={1} big />
        {/* 3rd */}
        <PodiumCell entry={podium[2]} heightClass="h-20" position={3} />
      </div>

      {/* List */}
      <div className="space-y-2">
        {rest.map((e) => (
          <RankRow key={e.position} entry={e} />
        ))}
      </div>
    </div>
  );
}

function PodiumCell({
  entry,
  heightClass,
  position,
  big,
}: {
  entry: RankingEntry;
  heightClass: string;
  position: number;
  big?: boolean;
}) {
  const medalColor =
    position === 1 ? "text-primary" : position === 2 ? "text-muted" : "text-warning";
  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-14 h-14 rounded-full flex items-center justify-center font-display font-black text-xl border-2 ${entry.isUser ? "border-primary" : "border-border"} mb-2`}
        style={{ backgroundColor: `${entry.color}33` }}
      >
        <span style={{ color: entry.color }}>{entry.initial}</span>
      </div>
      <div
        className={`w-full ${heightClass} card flex flex-col items-center justify-center p-2 ${entry.isUser ? "border-primary" : ""}`}
      >
        {position === 1 ? (
          <Trophy className={`w-6 h-6 ${medalColor} mb-1`} strokeWidth={2.5} />
        ) : (
          <Medal className={`w-5 h-5 ${medalColor} mb-1`} strokeWidth={2.5} />
        )}
        <p className={`font-display font-black ${big ? "text-xl" : "text-lg"} leading-none`}>
          #{position}
        </p>
        <p className="text-[11px] text-muted text-center mt-1 truncate w-full">
          {entry.name.split(" ")[0]}
        </p>
        <p className="text-xs text-primary font-bold">{entry.score}</p>
      </div>
    </div>
  );
}

function RankRow({ entry }: { entry: RankingEntry }) {
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-card border ${
        entry.isUser ? "bg-primary/10 border-primary" : "bg-surface border-border"
      }`}
    >
      <span className="w-8 text-center font-display font-black text-muted">
        #{entry.position}
      </span>
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center font-display font-black"
        style={{ backgroundColor: `${entry.color}33`, color: entry.color }}
      >
        {entry.initial}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-semibold truncate ${entry.isUser ? "text-primary" : ""}`}>
          {entry.name} {entry.isUser && <span className="text-xs">(você)</span>}
        </p>
        <p className="text-xs text-muted">{entry.score} treinos no mês</p>
      </div>
    </div>
  );
}
