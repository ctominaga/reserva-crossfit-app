import { useState, useMemo } from "react";
import { Camera, X, Upload } from "lucide-react";
import { WeekNavigator } from "../../components/ui/WeekNavigator";
import { AthleteResultRow, type AthleteResult } from "../../components/admin/AthleteResultRow";
import {
  buildWeekSchedule,
  mockAdminAthletes,
  mockWOD,
  getMockOCRResults,
  type ScheduleOverrides,
  type CapacityOverrides,
  type Movement,
} from "../../data/mock";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { useToast } from "../../hooks/useToast";

export default function CheckinAdmin() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string>(
    () => new Date().toISOString().slice(0, 10)
  );
  const [checkins, setCheckins] = useLocalStorage<Record<string, AthleteResult[]>>("reserva-checkins", {});
  const [ocrModal, setOcrModal] = useState(false);
  const [ocrPreview, setOcrPreview] = useState<string | null>(null);
  const { push } = useToast();

  const [scheduleOverrides] = useLocalStorage<ScheduleOverrides>("reserva-schedule-overrides", {});
  const [capacityOverrides] = useLocalStorage<CapacityOverrides>("reserva-capacity-overrides", {});
  const [customWOD] = useLocalStorage<typeof mockWOD | null>("reserva-wod-custom", null);

  const wodMovements: Movement[] = customWOD?.main?.movements ?? mockWOD.main.movements;

  const week = useMemo(() => {
    const base = new Date();
    base.setDate(base.getDate() + weekOffset * 7);
    return buildWeekSchedule(base, scheduleOverrides, capacityOverrides);
  }, [weekOffset, scheduleOverrides, capacityOverrides]);

  const selectedDay = week.find((d) => d.date === selectedDate) ?? week[0];
  const sessions = selectedDay.sessions;

  const [sessionIdx, setSessionIdx] = useState(0);
  const currentSession = sessions[Math.min(sessionIdx, sessions.length - 1)];
  const sessionKey = `${selectedDay.date}-${currentSession?.time}`;

  const athletes = useMemo<AthleteResult[]>(() => {
    if (checkins[sessionKey]) return checkins[sessionKey];
    return mockAdminAthletes.slice(0, 6).map((a) => ({
      athleteId: a.id,
      name: a.name,
      initial: a.initial,
      color: a.color,
      checkedIn: false,
      level: "" as const,
      result: "",
    }));
  }, [sessionKey, checkins]);

  const updateAthlete = (idx: number, updated: AthleteResult) => {
    const next = [...athletes];
    next[idx] = updated;
    setCheckins({ ...checkins, [sessionKey]: next });
  };

  const saveAthlete = (idx: number) => {
    setCheckins({ ...checkins, [sessionKey]: [...athletes] });
    push(`${athletes[idx].name} salvo!`, "success");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setOcrPreview(url);
    setOcrModal(true);
    e.target.value = "";
  };

  const applyOCR = () => {
    const ocrSessionId = sessionIdx === 0 ? "cs1" : sessionIdx === 1 ? "cs2" : "cs3";
    const results = getMockOCRResults(ocrSessionId);
    const next = athletes.map((a) => {
      const match = results.find((r) => a.name.includes(r.name.split(" ")[0]));
      if (match) {
        return { ...a, checkedIn: true, level: match.level as AthleteResult["level"], result: match.result };
      }
      return a;
    });
    setCheckins({ ...checkins, [sessionKey]: next });
    setOcrModal(false);
    setOcrPreview(null);
    push("Resultados aplicados com sucesso!", "success");
  };

  const ocrSessionId = sessionIdx === 0 ? "cs1" : sessionIdx === 1 ? "cs2" : "cs3";
  const ocrText = getMockOCRResults(ocrSessionId)
    .map((r) => `${r.name} — ${r.level} — ${r.result}`)
    .join("\n");

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setSessionIdx(0);
  };

  return (
    <div className="px-4 py-4 max-w-xl mx-auto pb-24 space-y-4">
      <h1 className="font-display font-black uppercase text-2xl">Check-in</h1>

      {/* Week navigator */}
      <WeekNavigator
        selectedDate={selectedDay.date}
        onSelectDate={handleDateChange}
        weekOffset={weekOffset}
        onOffsetChange={setWeekOffset}
        scheduleOverrides={scheduleOverrides}
        capacityOverrides={capacityOverrides}
      />

      {/* Session selector */}
      <div className="card p-4">
        <label className="text-xs font-bold uppercase tracking-wider text-muted">Aula do dia</label>
        <select
          value={sessionIdx}
          onChange={(e) => setSessionIdx(Number(e.target.value))}
          className="w-full mt-2 px-4 py-3 rounded-lg bg-surface-2 border border-border focus:border-primary outline-none text-sm"
        >
          {sessions.map((s, i) => (
            <option key={s.id} value={i}>
              {s.time} — {s.name} · {s.coach} ({s.booked}/{s.capacity} vagas)
            </option>
          ))}
        </select>
      </div>

      {/* OCR import */}
      <div className="flex gap-3">
        <label className="btn-secondary flex-1 flex items-center justify-center gap-2 cursor-pointer">
          <Camera className="w-4 h-4" />
          Importar foto do quadro
          <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
        </label>
      </div>

      {/* Athlete list */}
      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-muted">
            Alunos — {currentSession?.time} {currentSession?.name}
          </span>
          <span className="text-xs text-muted">
            {athletes.filter((a) => a.checkedIn).length}/{athletes.length} presentes
          </span>
        </div>
        {athletes.map((a, i) => (
          <AthleteResultRow
            key={a.athleteId}
            data={a}
            wodMovements={wodMovements}
            onChange={(updated) => updateAthlete(i, updated)}
            onSave={() => saveAthlete(i)}
          />
        ))}
      </div>

      {/* OCR Modal */}
      {ocrModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/70 animate-fade-in" onClick={() => { setOcrModal(false); setOcrPreview(null); }} />
          <div className="relative w-full sm:max-w-lg bg-surface border border-border rounded-t-2xl sm:rounded-2xl shadow-2xl animate-slide-up max-h-[88vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="font-display font-black uppercase tracking-wider text-lg">Importar Resultados</h3>
              <button onClick={() => { setOcrModal(false); setOcrPreview(null); }} className="w-8 h-8 rounded-full hover:bg-surface-2 flex items-center justify-center transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-4">
              {ocrPreview && (
                <img src={ocrPreview} alt="Preview do quadro" className="w-full h-48 object-cover rounded-lg border border-border" />
              )}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted mb-2">Resultado reconhecido automaticamente:</p>
                <textarea
                  value={ocrText}
                  readOnly
                  rows={5}
                  className="w-full px-3 py-3 rounded-lg bg-surface-2 border border-border text-xs font-mono resize-none"
                />
              </div>
              <p className="text-[10px] text-muted italic">
                Demonstração — OCR real disponível na versão de produção.
              </p>
              <div className="flex gap-3">
                <button onClick={applyOCR} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <Upload className="w-4 h-4" />
                  Aplicar resultados
                </button>
                <button onClick={() => { setOcrModal(false); }} className="btn-secondary flex-1">
                  Editar manualmente
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
