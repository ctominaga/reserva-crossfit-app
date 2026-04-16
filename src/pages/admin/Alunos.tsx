import { useState } from "react";
import { Edit2, Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { mockAdminAthletes, type AdminAthlete } from "../../data/mock";
import { useToast } from "../../hooks/useToast";

type AthleteFilter = "all" | "active" | "overdue" | "lowFreq";

export default function Alunos() {
  const [filter, setFilter] = useState<AthleteFilter>("all");
  const [editAthlete, setEditAthlete] = useState<AdminAthlete | null>(null);
  const navigate = useNavigate();
  const { push } = useToast();

  const filtered = mockAdminAthletes.filter((a) => {
    if (filter === "active") return a.status === "active";
    if (filter === "overdue") return a.status === "overdue";
    if (filter === "lowFreq") return a.frequency < 50;
    return true;
  });

  return (
    <div className="px-4 py-4 max-w-xl mx-auto pb-24 space-y-4">
      <h1 className="font-display font-black uppercase text-2xl">Alunos</h1>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
        {([
          { l: "Todos", v: "all" as const },
          { l: "Ativos", v: "active" as const },
          { l: "Inadimplentes", v: "overdue" as const },
          { l: "Baixa Freq.", v: "lowFreq" as const },
        ]).map((f) => (
          <button key={f.v} onClick={() => setFilter(f.v)} className={`chip ${filter === f.v ? "chip-active" : ""}`}>
            {f.l}
          </button>
        ))}
      </div>

      {/* Athlete list */}
      <div className="card overflow-hidden">
        {filtered.map((a) => (
          <div key={a.id} className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center font-display font-black text-sm shrink-0"
              style={{ backgroundColor: a.color + "22", color: a.color }}
            >
              {a.initial}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold truncate">{a.name}</p>
                <Badge variant={a.status === "active" ? "primary" : a.status === "overdue" ? "danger" : "neutral"}>
                  {a.status === "active" ? "Ativo" : a.status === "overdue" ? "Inadimpl." : "Inativo"}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted mt-0.5">
                <span>{a.plan}</span>
                <span>·</span>
                <span>{a.frequency}%</span>
                <span>·</span>
                <span>{a.lastWorkout}</span>
              </div>
            </div>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => setEditAthlete(a)} className="w-7 h-7 rounded-full bg-surface-2 flex items-center justify-center hover:bg-primary/15 transition" title="Editar">
                <Edit2 className="w-3 h-3 text-muted" />
              </button>
              <button onClick={() => navigate("/admin/analise")} className="w-7 h-7 rounded-full bg-surface-2 flex items-center justify-center hover:bg-primary/15 transition" title="Análise IA">
                <Brain className="w-3 h-3 text-muted" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-muted">
        {filtered.length} aluno{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* Edit athlete modal */}
      <Modal open={!!editAthlete} onClose={() => setEditAthlete(null)} title="Editar Aluno">
        {editAthlete && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted">Nome</label>
              <input
                value={editAthlete.name}
                readOnly
                className="w-full mt-1 px-3 py-2.5 rounded-lg bg-surface-2 border border-border text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted">Plano</label>
              <select
                defaultValue={editAthlete.plan}
                className="w-full mt-1 px-3 py-2.5 rounded-lg bg-surface-2 border border-border text-sm outline-none focus:border-primary"
              >
                <option>Mensal</option>
                <option>Trimestral</option>
                <option>Anual</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted">Status</label>
              <select
                defaultValue={editAthlete.status}
                className="w-full mt-1 px-3 py-2.5 rounded-lg bg-surface-2 border border-border text-sm outline-none focus:border-primary"
              >
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
                <option value="overdue">Inadimplente</option>
              </select>
            </div>
            <button
              onClick={() => {
                push(`${editAthlete.name} atualizado!`, "success");
                setEditAthlete(null);
              }}
              className="btn-primary w-full"
            >
              Salvar alterações
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
