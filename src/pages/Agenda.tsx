import { useMemo, useState } from "react";
import { buildWeekSchedule, type ClassType, type ScheduleOverrides, type CapacityOverrides } from "../data/mock";
import { WeekNavigator } from "../components/ui/WeekNavigator";
import { ClassCard } from "../components/features/ClassCard";
import { Modal } from "../components/ui/Modal";
import { useToast } from "../hooks/useToast";
import { useLocalStorage } from "../hooks/useLocalStorage";

const FILTERS: Array<{ label: string; value: ClassType | "all" }> = [
  { label: "Todos", value: "all" },
  { label: "WOD", value: "WOD" },
  { label: "Weightlifting", value: "Weightlifting" },
  { label: "Endurance", value: "Endurance" },
  { label: "Open Box", value: "Open Box" },
];

export default function Agenda() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [filter, setFilter] = useState<ClassType | "all">("all");
  const [reservations, setReservations] = useLocalStorage<string[]>(
    "reserva-bookings",
    [],
  );
  const [checkInId, setCheckInId] = useState<string | null>(null);
  const { push } = useToast();

  const [scheduleOverrides] = useLocalStorage<ScheduleOverrides>("reserva-schedule-overrides", {});
  const [capacityOverrides] = useLocalStorage<CapacityOverrides>("reserva-capacity-overrides", {});

  const week = useMemo(() => {
    const base = new Date();
    base.setDate(base.getDate() + weekOffset * 7);
    return buildWeekSchedule(base, scheduleOverrides, capacityOverrides);
  }, [weekOffset, scheduleOverrides, capacityOverrides]);

  const selectedDay =
    week.find((d) => d.date === selectedDate) ?? week[0];

  const todayISO = new Date().toISOString().slice(0, 10);

  const filteredSessions =
    filter === "all"
      ? selectedDay.sessions
      : selectedDay.sessions.filter((s) => s.name === filter);

  return (
    <div className="px-4 py-4 max-w-xl mx-auto pb-24 space-y-4">
      {/* Week navigator */}
      <WeekNavigator
        selectedDate={selectedDay.date}
        onSelectDate={setSelectedDate}
        weekOffset={weekOffset}
        onOffsetChange={setWeekOffset}
        scheduleOverrides={scheduleOverrides}
        capacityOverrides={capacityOverrides}
      />

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`chip ${filter === f.value ? "chip-active" : ""}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Sessions */}
      <div className="space-y-3">
        {filteredSessions.map((s) => (
          <ClassCard
            key={s.id}
            session={s}
            reserved={reservations.includes(s.id)}
            isToday={selectedDay.date === todayISO}
            onReserve={(id) => {
              setReservations([...reservations, id]);
              push("Vaga reservada!", "success");
            }}
            onCancel={(id) => {
              setReservations(reservations.filter((r) => r !== id));
              push("Reserva cancelada", "info");
            }}
            onCheckIn={(id) => setCheckInId(id)}
          />
        ))}
      </div>

      {filteredSessions.length === 0 && (
        <div className="text-center py-12 text-muted">
          <p className="font-display font-bold text-lg">Sem aulas neste horário</p>
          <p className="text-sm mt-1">Tente outro filtro ou dia.</p>
        </div>
      )}

      {/* Check-in modal */}
      <Modal
        open={!!checkInId}
        onClose={() => setCheckInId(null)}
        title="Check-in"
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-48 h-48 bg-white rounded-xl p-3 flex items-center justify-center">
            <QRCode />
          </div>
          <div>
            <p className="font-display font-black text-primary text-xl">
              Check-in confirmado!
            </p>
            <p className="text-muted text-sm mt-1">
              Apresente o QR Code na entrada do box
            </p>
          </div>
          <button
            onClick={() => {
              push("Check-in realizado!", "success");
              setCheckInId(null);
            }}
            className="btn-primary w-full"
          >
            Fechar
          </button>
        </div>
      </Modal>
    </div>
  );
}

function QRCode() {
  const size = 21;
  const pattern: number[][] = [];
  for (let y = 0; y < size; y++) {
    pattern.push(Array(size).fill(0));
  }
  const finder = (x0: number, y0: number) => {
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        const on = x === 0 || x === 6 || y === 0 || y === 6 || (x >= 2 && x <= 4 && y >= 2 && y <= 4);
        pattern[y0 + y][x0 + x] = on ? 1 : 0;
      }
    }
  };
  finder(0, 0);
  finder(size - 7, 0);
  finder(0, size - 7);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const inFinder = (x < 8 && y < 8) || (x >= size - 8 && y < 8) || (x < 8 && y >= size - 8);
      if (inFinder) continue;
      const seed = x * 31 + y * 17;
      const r = Math.sin(seed) * 10000;
      pattern[y][x] = (r - Math.floor(r)) > 0.5 ? 1 : 0;
    }
  }
  const cell = 10;
  return (
    <svg viewBox={`0 0 ${size * cell} ${size * cell}`} xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {pattern.flatMap((row, y) =>
        row.map((v, x) =>
          v ? <rect key={`${x}-${y}`} x={x * cell} y={y * cell} width={cell} height={cell} fill="#0A0A0A" /> : null
        )
      )}
    </svg>
  );
}
