import { useCallback, useEffect, useRef, useState } from "react";
import { Check, X, Info } from "lucide-react";
import {
  ToastContext,
  type ToastKind,
  type ToastMessage,
} from "../../hooks/useToast";

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const push = useCallback(
    (text: string, kind: ToastKind = "success") => {
      const id = ++idRef.current;
      setToasts((t) => [...t, { id, kind, text }]);
      setTimeout(() => dismiss(id), 3000);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ toasts, push, dismiss }}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: ToastMessage[];
  onDismiss: (id: number) => void;
}) {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-[92%] max-w-sm">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastMessage;
  onDismiss: (id: number) => void;
}) {
  useEffect(() => {
    /* auto-dismiss handled by provider */
  }, []);

  const styles: Record<ToastKind, string> = {
    success: "border-primary/60 bg-surface text-text",
    error: "border-danger/60 bg-surface text-text",
    info: "border-border bg-surface text-text",
  };
  const Icon = toast.kind === "success" ? Check : toast.kind === "error" ? X : Info;
  const iconColor =
    toast.kind === "success"
      ? "text-primary"
      : toast.kind === "error"
        ? "text-danger"
        : "text-muted";

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl animate-fade-in ${styles[toast.kind]}`}
      role="status"
    >
      <Icon className={`w-5 h-5 shrink-0 ${iconColor}`} strokeWidth={3} />
      <span className="text-sm font-medium flex-1">{toast.text}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-muted hover:text-text transition"
        aria-label="Fechar"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
