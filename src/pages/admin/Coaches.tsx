import { useState } from "react";
import {
  Plus,
  MoreHorizontal,
  X,
  Instagram,
} from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { useToast } from "../../hooks/useToast";
import {
  mockCoaches,
  type Coach,
  type CoachSpecialty,
} from "../../data/mock";

const ALL_SPECIALTIES: CoachSpecialty[] = [
  "WOD",
  "Weightlifting",
  "Endurance",
  "Gymnastics",
  "Nutrition",
];

const AVATAR_COLORS = [
  "#22C55E",
  "#F59E0B",
  "#3B82F6",
  "#EC4899",
  "#A855F7",
  "#EF4444",
  "#14B8A6",
  "#F97316",
];

export default function CoachesAdmin() {
  const [coaches, setCoaches] = useLocalStorage<Coach[]>(
    "reserva-coaches",
    mockCoaches,
  );
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const { push } = useToast();

  // Form state
  const [name, setName] = useState("");
  const [specialties, setSpecialties] = useState<CoachSpecialty[]>([]);
  const [bio, setBio] = useState("");
  const [certs, setCerts] = useState<string[]>([]);
  const [certInput, setCertInput] = useState("");
  const [activeSince, setActiveSince] = useState("");
  const [instagram, setInstagram] = useState("");
  const [isActive, setIsActive] = useState(true);

  const activeCount = coaches.filter((c) => c.isActive).length;

  const resetForm = () => {
    setName("");
    setSpecialties([]);
    setBio("");
    setCerts([]);
    setCertInput("");
    setActiveSince("");
    setInstagram("");
    setIsActive(true);
    setEditingId(null);
  };

  const openNew = () => {
    resetForm();
    setFormOpen(true);
  };

  const openEdit = (coach: Coach) => {
    setEditingId(coach.id);
    setName(coach.name);
    setSpecialties([...coach.specialty]);
    setBio(coach.bio);
    setCerts([...coach.certifications]);
    setActiveSince(coach.activeSince);
    setInstagram(coach.instagram ?? "");
    setIsActive(coach.isActive);
    setMenuOpenId(null);
    setFormOpen(true);
  };

  const toggleSpecialty = (s: CoachSpecialty) => {
    setSpecialties((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  };

  const addCert = () => {
    const val = certInput.trim();
    if (val && !certs.includes(val)) {
      setCerts([...certs, val]);
      setCertInput("");
    }
  };

  const removeCert = (idx: number) => {
    setCerts(certs.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    if (!name.trim()) {
      push("Nome é obrigatório", "error");
      return;
    }
    if (specialties.length === 0) {
      push("Selecione ao menos uma especialidade", "error");
      return;
    }

    if (editingId) {
      setCoaches(
        coaches.map((c) =>
          c.id === editingId
            ? {
                ...c,
                name: name.trim(),
                initial: name.trim().replace("Coach ", "").charAt(0).toUpperCase(),
                specialty: specialties,
                bio: bio.trim(),
                certifications: certs,
                activeSince: activeSince.trim(),
                instagram: instagram.trim() || undefined,
                isActive,
              }
            : c,
        ),
      );
    } else {
      const id = name.trim().toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();
      const initial = name.trim().replace("Coach ", "").charAt(0).toUpperCase();
      const color = AVATAR_COLORS[coaches.length % AVATAR_COLORS.length];
      const newCoach: Coach = {
        id,
        name: name.trim(),
        initial,
        color,
        specialty: specialties,
        bio: bio.trim(),
        certifications: certs,
        activeSince: activeSince.trim(),
        isActive,
        instagram: instagram.trim() || undefined,
        scheduleIds: [],
      };
      setCoaches([...coaches, newCoach]);
    }

    push("Coach salvo com sucesso 💚", "success");
    setFormOpen(false);
    resetForm();
  };

  const toggleActive = (id: string) => {
    setCoaches(
      coaches.map((c) =>
        c.id === id ? { ...c, isActive: !c.isActive } : c,
      ),
    );
    const coach = coaches.find((c) => c.id === id);
    push(
      coach?.isActive ? "Coach desativado" : "Coach ativado",
      "info",
    );
    setMenuOpenId(null);
  };

  return (
    <div className="px-4 py-4 max-w-xl mx-auto pb-24 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-black uppercase text-2xl">Coaches</h1>
          <p className="text-xs text-muted">{activeCount} coaches ativos</p>
        </div>
        <button onClick={openNew} className="btn-primary flex items-center gap-1.5 text-sm px-3 py-2">
          <Plus className="w-4 h-4" />
          Novo Coach
        </button>
      </div>

      {/* Coach list */}
      <div className="space-y-3">
        {coaches.map((coach) => (
          <div key={coach.id} className="card p-4">
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center font-display font-black text-lg text-black shrink-0"
                style={{ backgroundColor: coach.color }}
              >
                {coach.initial}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-black uppercase text-base truncate">
                    {coach.name}
                  </h3>
                  <span
                    className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      coach.isActive
                        ? "bg-primary/15 text-primary"
                        : "bg-surface-2 text-muted"
                    }`}
                  >
                    {coach.isActive ? "● Ativo" : "○ Inativo"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {coach.specialty.map((s) => (
                    <span
                      key={s}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-surface-2 border border-border text-muted font-semibold"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-muted mt-1.5">
                  {coach.certifications.join(" · ")}
                </p>
                <p className="text-[11px] text-muted">
                  Ativo desde {coach.activeSince}
                </p>
              </div>

              {/* Menu */}
              <div className="relative">
                <button
                  onClick={() =>
                    setMenuOpenId(menuOpenId === coach.id ? null : coach.id)
                  }
                  className="p-1.5 rounded-lg hover:bg-surface-2 transition"
                >
                  <MoreHorizontal className="w-4 h-4 text-muted" />
                </button>
                {menuOpenId === coach.id && (
                  <div className="absolute right-0 top-8 w-40 bg-surface border border-border rounded-lg shadow-xl z-10 py-1">
                    <button
                      onClick={() => openEdit(coach)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-surface-2 transition"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => toggleActive(coach.id)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-surface-2 transition"
                    >
                      {coach.isActive ? "Desativar" : "Ativar"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Form modal */}
      <Modal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          resetForm();
        }}
        title={editingId ? "Editar Coach" : "Novo Coach"}
      >
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="text-xs uppercase tracking-wider text-muted font-bold">
              Nome completo *
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Coach Rafael"
              className="w-full mt-1 px-3 py-2.5 rounded-lg bg-surface-2 border border-border focus:border-primary outline-none text-sm"
            />
          </div>

          {/* Specialties */}
          <div>
            <label className="text-xs uppercase tracking-wider text-muted font-bold">
              Especialidades *
            </label>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {ALL_SPECIALTIES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSpecialty(s)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition font-semibold ${
                    specialties.includes(s)
                      ? "bg-primary/15 border-primary text-primary"
                      : "bg-surface-2 border-border text-muted hover:border-primary/40"
                  }`}
                >
                  {specialties.includes(s) ? "☑ " : "☐ "}
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="text-xs uppercase tracking-wider text-muted font-bold">
              Bio (até 200 chars)
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 200))}
              rows={3}
              className="w-full mt-1 px-3 py-2.5 rounded-lg bg-surface-2 border border-border focus:border-primary outline-none text-sm resize-none"
            />
            <p className="text-[10px] text-muted text-right">{bio.length}/200</p>
          </div>

          {/* Certifications */}
          <div>
            <label className="text-xs uppercase tracking-wider text-muted font-bold">
              Certificações
            </label>
            <div className="flex gap-2 mt-1.5">
              <input
                value={certInput}
                onChange={(e) => setCertInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCert())}
                placeholder="CrossFit Level 2"
                className="flex-1 px-3 py-2 rounded-lg bg-surface-2 border border-border focus:border-primary outline-none text-sm"
              />
              <button
                type="button"
                onClick={addCert}
                className="btn-secondary px-3 py-2 text-sm"
              >
                + Adicionar
              </button>
            </div>
            {certs.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {certs.map((cert, idx) => (
                  <span
                    key={idx}
                    className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-surface-2 border border-border"
                  >
                    {cert}
                    <button
                      onClick={() => removeCert(idx)}
                      className="text-muted hover:text-danger"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Active since */}
          <div>
            <label className="text-xs uppercase tracking-wider text-muted font-bold">
              Ativo desde
            </label>
            <input
              value={activeSince}
              onChange={(e) => setActiveSince(e.target.value)}
              placeholder="Janeiro 2020"
              className="w-full mt-1 px-3 py-2.5 rounded-lg bg-surface-2 border border-border focus:border-primary outline-none text-sm"
            />
          </div>

          {/* Instagram */}
          <div>
            <label className="text-xs uppercase tracking-wider text-muted font-bold">
              Instagram (opcional)
            </label>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-muted text-sm">@</span>
              <input
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="coachrafael"
                className="flex-1 px-3 py-2.5 rounded-lg bg-surface-2 border border-border focus:border-primary outline-none text-sm"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="text-xs uppercase tracking-wider text-muted font-bold">
              Status
            </label>
            <div className="flex gap-4 mt-1.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={isActive}
                  onChange={() => setIsActive(true)}
                  className="accent-primary"
                />
                <span className="text-sm font-semibold text-primary">● Ativo</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={!isActive}
                  onChange={() => setIsActive(false)}
                  className="accent-primary"
                />
                <span className="text-sm font-semibold text-muted">○ Inativo</span>
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => {
                setFormOpen(false);
                resetForm();
              }}
              className="btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button onClick={handleSave} className="btn-primary flex-1">
              Salvar Coach
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
