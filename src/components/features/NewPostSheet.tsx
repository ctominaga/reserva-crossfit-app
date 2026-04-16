import { useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

type PostType = "text" | "achievement" | "image";

interface NewPostSheetProps {
  open: boolean;
  onClose: () => void;
  onPublish: (content: string, type: PostType, tags: string[]) => void;
}

export function NewPostSheet({ open, onClose, onPublish }: NewPostSheetProps) {
  const [content, setContent] = useState("");
  const [type, setType] = useState<PostType>("text");
  const { user } = useAuth();

  if (!open) return null;

  const isAdmin = user?.role === "admin";

  const handlePublish = () => {
    if (!content.trim()) return;
    onPublish(content.trim(), type, []);
    setContent("");
    setType("text");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/70 animate-fade-in" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg bg-surface border border-border rounded-t-2xl shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-display font-black uppercase tracking-wider text-lg">Novo Post</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-surface-2 flex items-center justify-center transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex gap-2">
            {(["text", "achievement", "image"] as PostType[]).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`chip ${type === t ? "chip-active" : ""}`}
              >
                {t === "text" ? "Texto" : t === "achievement" ? "Conquista" : "Foto"}
              </button>
            ))}
            {isAdmin && (
              <button
                onClick={() => setType("text")}
                className="chip chip-active !bg-primary/20 !text-primary !border-primary/40"
              >
                Anúncio
              </button>
            )}
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="O que você quer compartilhar?"
            rows={4}
            className="w-full px-4 py-3 rounded-xl bg-surface-2 border border-border focus:border-primary outline-none text-sm resize-none"
            autoFocus
          />

          <button
            onClick={handlePublish}
            disabled={!content.trim()}
            className="btn-primary w-full py-3 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Publicar
          </button>
        </div>
      </div>
    </div>
  );
}
