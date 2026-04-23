import { useState } from "react";
import { Eye, EyeOff, ExternalLink, Key, ChevronDown, ChevronUp, ShieldCheck } from "lucide-react";
import { useToast } from "../../hooks/useToast";
import { isAIKeyFromEnv } from "../../services/ai.service";

interface AISetupProps {
  apiKey: string;
  onSave: (key: string) => void;
}

export function AISetup({ apiKey, onSave }: AISetupProps) {
  const envKeyPresent = isAIKeyFromEnv();
  const [key, setKey] = useState(apiKey);
  const [show, setShow] = useState(false);
  const [howTo, setHowTo] = useState(false);
  const [override, setOverride] = useState(false);
  const { push } = useToast();

  const locked = envKeyPresent && !override;

  const handleSave = () => {
    if (!key.trim()) {
      push("Informe a chave de API", "error");
      return;
    }
    onSave(key.trim());
    push("Chave de API salva com sucesso!", "success");
  };

  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
          {locked ? <ShieldCheck className="w-5 h-5 text-primary" /> : <Key className="w-5 h-5 text-primary" />}
        </div>
        <div>
          <h3 className="font-display font-black uppercase text-lg">Configurar IA (Gemini ou Groq)</h3>
          <p className="text-xs text-muted">
            {locked ? "✅ Chave configurada pelo sistema" : "Cole sua chave Gemini (AIza...) ou Groq (gsk_...) abaixo"}
          </p>
        </div>
      </div>

      <div className="relative">
        <input
          type={show && !locked ? "text" : "password"}
          value={locked ? "••••••••••••••••" : key}
          onChange={(e) => setKey(e.target.value)}
          disabled={locked}
          placeholder="AIza... ou gsk_..."
          className="w-full px-4 py-3 pr-10 rounded-lg bg-surface-2 border border-border focus:border-primary outline-none text-sm font-mono disabled:opacity-60 disabled:cursor-not-allowed"
        />
        {!locked && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text"
          >
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>

      <p className="text-[11px] text-muted">
        {locked
          ? "A chave foi definida via variável de ambiente (VITE_AI_API_KEY). Clique em \"Usar chave personalizada\" para sobrescrever neste navegador."
          : "A chave é salva apenas neste navegador e nunca enviada para nossos servidores."}
      </p>

      <p className="text-xs text-primary mt-2 flex items-center gap-1">
        <span>✅</span>
        <span>Gratuito — Gemini (aistudio.google.com) ou Groq (console.groq.com)</span>
      </p>

      <div className="flex gap-3">
        {locked ? (
          <button type="button" onClick={() => setOverride(true)} className="btn-primary flex-1">
            Usar chave personalizada
          </button>
        ) : (
          <button type="button" onClick={handleSave} className="btn-primary flex-1">
            Salvar chave
          </button>
        )}
        <a
          href="https://aistudio.google.com/app/apikey"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary flex items-center gap-1.5 px-4"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Obter chave
        </a>
      </div>

      {/* Collapsible instructions */}
      <button
        onClick={() => setHowTo(!howTo)}
        className="w-full flex items-center justify-between py-2 text-xs font-bold uppercase tracking-wider text-muted hover:text-text transition"
      >
        Como obter a chave?
        {howTo ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {howTo && (
        <div className="text-xs text-muted space-y-3">
          <div>
            <p className="font-bold text-text uppercase tracking-wider text-[11px] mb-1">Gemini (recomendado)</p>
            <ol className="space-y-1 pl-4 list-decimal">
              <li>Acesse <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary underline">aistudio.google.com/app/apikey</a></li>
              <li>Faça login com a conta Google</li>
              <li>Clique em "Create API Key"</li>
              <li>Copie a chave (começa com "AIza")</li>
              <li>Cole no campo acima e salve</li>
            </ol>
          </div>
          <div>
            <p className="font-bold text-text uppercase tracking-wider text-[11px] mb-1">Groq (alternativa)</p>
            <ol className="space-y-1 pl-4 list-decimal">
              <li>Acesse <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="text-primary underline">console.groq.com/keys</a></li>
              <li>Faça login (ou crie uma conta gratuita)</li>
              <li>Vá em "API Keys" → "Create API Key"</li>
              <li>Copie a chave (começa com "gsk_")</li>
              <li>Cole no campo acima e salve</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
