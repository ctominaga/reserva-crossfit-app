import { useState, useMemo } from "react";
import { Play, Flame, Clock, Info, History } from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { Modal } from "../components/ui/Modal";
import { WODHistoryCard } from "../components/features/WODCard";
import {
  mockWOD,
  mockWODHistory,
  mockMovementLibrary,
  type Movement,
} from "../data/mock";
import { useToast } from "../hooks/useToast";
import { useLocalStorage } from "../hooks/useLocalStorage";

type Scale = "rx" | "scaled" | "beginner";

export default function WOD() {
  const [scale, setScale] = useState<Scale>("rx");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [movementModal, setMovementModal] = useState<Movement | null>(null);
  const { push } = useToast();
  const [customWOD] = useLocalStorage<typeof mockWOD | null>("reserva-wod-custom", null);

  const wod = useMemo(() => customWOD ?? mockWOD, [customWOD]);

  const movementsWithLib = wod.main.movements.map((mv) => {
    const lib = mockMovementLibrary.find((l) => l.name === mv.name);
    return { ...mv, description: lib?.description ?? "Descrição em breve." };
  });

  const handleRegister = () => {
    if (!time.trim()) {
      push("Informe o tempo ou reps primeiro", "error");
      return;
    }
    push("Resultado registrado! 💪 Possível PR!", "success");
    setTime("");
    setNotes("");
  };

  return (
    <div className="px-4 py-4 max-w-xl mx-auto pb-24 space-y-5">
      {/* Hero WOD */}
      <Card accent>
        <div className="flex items-center gap-2 text-xs text-muted">
          <Flame className="w-3.5 h-3.5 text-primary" />
          <span>{wod.dateLabel}</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="primary">{wod.type}</Badge>
          <Badge variant="outline">{wod.duration} min</Badge>
        </div>
        <h1 className="font-display font-black uppercase text-3xl mt-2">
          {wod.title}
        </h1>
      </Card>

      {/* Aquecimento */}
      <section>
        <h2 className="section-title mb-3">Aquecimento</h2>
        <Card>
          <ul className="space-y-2">
            {wod.warmup.map((w, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="text-primary font-display font-black shrink-0">
                  {i + 1}
                </span>
                <span className="text-text">{w}</span>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {/* Parte principal */}
      <section>
        <h2 className="section-title mb-3">Parte principal</h2>
        <Card>
          <p className="font-display font-black uppercase text-lg text-primary">
            {wod.main.description}
          </p>
          <ul className="mt-3 space-y-2">
            {wod.main.movements.map((m, i) => (
              <li
                key={i}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <span className="font-display font-bold uppercase">
                  {m.reps} {m.name}
                </span>
                <span className="text-xs text-muted">
                  {m.weight ?? m.height ?? m.distance ?? ""}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Scaling */}
        <div className="mt-3">
          <div className="flex gap-2 mb-2">
            {(["rx", "scaled", "beginner"] as Scale[]).map((s) => (
              <button
                key={s}
                onClick={() => setScale(s)}
                className={`chip ${scale === s ? "chip-active" : ""} uppercase`}
              >
                {s === "rx" ? "RX" : s === "scaled" ? "Scaled" : "Beginner"}
              </button>
            ))}
          </div>
          <Card className="!p-4">
            <p className="text-sm text-muted leading-relaxed">
              {wod.main.scaling[scale]}
            </p>
          </Card>
        </div>
      </section>

      {/* Cooldown */}
      <section>
        <h2 className="section-title mb-3">Cooldown</h2>
        <Card>
          <ul className="space-y-2 text-sm">
            {wod.cooldown.map((c, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-primary shrink-0">•</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {/* Registrar resultado */}
      <section>
        <h2 className="section-title mb-3">Registrar resultado</h2>
        <Card>
          <div className="space-y-3">
            <div>
              <label className="text-xs uppercase tracking-wider text-muted font-bold">
                Tempo ou reps
              </label>
              <div className="mt-1 relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="ex: 12:45 ou 18 rounds"
                  className="w-full pl-10 pr-3 py-3 rounded-lg bg-surface-2 border border-border focus:border-primary outline-none text-sm"
                />
              </div>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-muted font-bold">
                Observações
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Como foi o treino?"
                rows={2}
                className="w-full mt-1 px-3 py-3 rounded-lg bg-surface-2 border border-border focus:border-primary outline-none text-sm resize-none"
              />
            </div>
            <button onClick={handleRegister} className="btn-primary w-full">
              Registrar PR
            </button>
          </div>
        </Card>
      </section>

      {/* Movimentos */}
      <section>
        <h2 className="section-title mb-3">Biblioteca de Movimentos</h2>
        <div className="grid grid-cols-2 gap-3">
          {movementsWithLib.map((mv) => (
            <button
              key={mv.name}
              onClick={() => setMovementModal(mv)}
              className="card p-3 text-left card-hover"
            >
              <div className="aspect-video bg-surface-2 border border-border rounded-lg flex items-center justify-center mb-2 relative overflow-hidden">
                <Play className="w-8 h-8 text-primary opacity-70" fill="currentColor" />
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
              </div>
              <p className="font-display font-black uppercase text-sm leading-tight">
                {mv.name}
              </p>
              <p className="text-xs text-muted mt-0.5 flex items-center gap-1">
                <Info className="w-3 h-3" /> Ver técnica
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* Histórico */}
      <section>
        <h2 className="section-title mb-3 flex items-center gap-2">
          <History className="w-4 h-4 text-primary" />
          WODs anteriores
        </h2>
        <div className="space-y-2">
          {mockWODHistory.map((e, i) => (
            <WODHistoryCard key={i} entry={e} />
          ))}
        </div>
      </section>

      {/* Movement modal */}
      <Modal
        open={!!movementModal}
        onClose={() => setMovementModal(null)}
        title={movementModal?.name}
      >
        {movementModal && (
          <div className="space-y-4">
            <div className="aspect-video bg-surface-2 border border-border rounded-lg flex items-center justify-center relative overflow-hidden">
              <Play
                className="w-12 h-12 text-primary"
                fill="currentColor"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
            </div>
            <p className="text-sm text-muted leading-relaxed">
              {movementModal.description}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted">
              <Info className="w-3 h-3" />
              GIF demonstrativo disponível na versão completa
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
