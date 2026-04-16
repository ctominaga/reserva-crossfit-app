import { useMemo } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { buildWeekSchedule, type ScheduleOverrides, type CapacityOverrides } from "../../data/mock";

interface WeekNavigatorProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  weekOffset: number;
  onOffsetChange: (offset: number) => void;
  scheduleOverrides?: ScheduleOverrides;
  capacityOverrides?: CapacityOverrides;
}

export function WeekNavigator({
  selectedDate,
  onSelectDate,
  weekOffset,
  onOffsetChange,
  scheduleOverrides = {},
  capacityOverrides = {},
}: WeekNavigatorProps) {
  const todayISO = new Date().toISOString().slice(0, 10);

  const week = useMemo(() => {
    const base = new Date();
    base.setDate(base.getDate() + weekOffset * 7);
    return buildWeekSchedule(base, scheduleOverrides, capacityOverrides);
  }, [weekOffset, scheduleOverrides, capacityOverrides]);

  const weekRange = `${week[0].dayNum}–${week[6].dayNum} ${new Date(
    week[0].date
  ).toLocaleDateString("pt-BR", { month: "short" })}`;

  return (
    <div className="space-y-3">
      {/* Week arrows + label */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onOffsetChange(weekOffset - 1)}
          className="w-9 h-9 rounded-full bg-surface border border-border flex items-center justify-center hover:border-primary/40 transition"
          aria-label="Semana anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2 text-sm text-muted">
          <CalendarDays className="w-4 h-4 text-primary" />
          <span className="font-display font-bold uppercase tracking-wider">
            {weekRange}
          </span>
        </div>
        <button
          onClick={() => onOffsetChange(weekOffset + 1)}
          className="w-9 h-9 rounded-full bg-surface border border-border flex items-center justify-center hover:border-primary/40 transition"
          aria-label="Próxima semana"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day buttons */}
      <div className="grid grid-cols-7 gap-1.5">
        {week.map((d) => {
          const isSelected = d.date === selectedDate;
          const isToday = d.date === todayISO;
          return (
            <button
              key={d.date}
              onClick={() => onSelectDate(d.date)}
              className={`flex flex-col items-center py-2 rounded-xl border transition ${
                isSelected
                  ? "bg-primary text-black border-primary"
                  : "bg-surface border-border text-text hover:border-primary/40"
              }`}
            >
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  isSelected ? "text-black/80" : "text-muted"
                }`}
              >
                {d.weekday}
              </span>
              <span className="font-display font-black text-lg leading-none mt-0.5">
                {d.dayNum}
              </span>
              {isToday && (
                <span
                  className={`mt-1 w-1 h-1 rounded-full ${isSelected ? "bg-black" : "bg-primary"}`}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { type WeekNavigatorProps };
