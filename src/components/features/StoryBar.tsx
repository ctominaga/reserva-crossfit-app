import { useState } from "react";
import { X } from "lucide-react";
import type { StoryItem } from "../../data/mock";

interface StoryBarProps {
  stories: StoryItem[];
}

export function StoryBar({ stories }: StoryBarProps) {
  const [openStory, setOpenStory] = useState<StoryItem | null>(null);

  return (
    <>
      <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 py-1">
        {stories.map((s) => (
          <button
            key={s.id}
            onClick={() => setOpenStory(s)}
            className="flex flex-col items-center gap-1 shrink-0"
          >
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-display font-black border-2 transition ${
                s.activeToday ? "border-primary" : "border-border"
              }`}
              style={{ backgroundColor: s.color + "22", color: s.color }}
            >
              {s.isBox ? (
                <img src="/logo.jpeg" alt="Reserva" className="w-10 h-10 rounded-full object-cover" />
              ) : (
                s.initial
              )}
            </div>
            <span className="text-[10px] text-muted truncate w-14 text-center">
              {s.name}
            </span>
          </button>
        ))}
      </div>

      {openStory && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col animate-fade-in">
          <div className="flex items-center gap-3 p-4">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-display font-black border border-primary/40"
              style={{ backgroundColor: openStory.color + "22", color: openStory.color }}
            >
              {openStory.initial}
            </div>
            <span className="font-display font-bold text-text flex-1">{openStory.name}</span>
            <button onClick={() => setOpenStory(null)} className="text-muted hover:text-text">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center px-8 text-center">
            {openStory.isBox ? (
              <div>
                <img src="/logo.jpeg" alt="Reserva CF" className="w-24 h-24 mx-auto object-contain mb-4" />
                <p className="font-display font-black uppercase text-2xl text-text">Reserva CrossFit</p>
                <p className="text-muted mt-2">Copa Reserva 2026 - Inscreva-se!</p>
                <p className="text-primary font-semibold mt-1">#PadrãoReserva</p>
              </div>
            ) : (
              <div>
                <p className="font-display font-black text-4xl" style={{ color: openStory.color }}>
                  {openStory.initial}
                </p>
                <p className="text-text font-display font-bold text-xl mt-3">{openStory.name}</p>
                <p className="text-muted mt-2">Treinou hoje no Reserva CrossFit!</p>
                {openStory.activeToday && (
                  <span className="inline-block mt-3 px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-semibold">
                    Ativo hoje
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="h-1 bg-surface-2 mx-4 mb-8 rounded-full overflow-hidden">
            <div className="h-full bg-primary animate-[grow_5s_linear_forwards]" />
          </div>
        </div>
      )}
    </>
  );
}
