import { createContext, useContext } from "react";

export type ToastKind = "success" | "error" | "info";
export interface ToastMessage {
  id: number;
  kind: ToastKind;
  text: string;
}

export interface ToastContextValue {
  toasts: ToastMessage[];
  push: (text: string, kind?: ToastKind) => void;
  dismiss: (id: number) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
