import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Shield, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../hooks/useToast";

export default function Onboarding() {
  const navigate = useNavigate();
  const { login, loginWithEmail, signUpWithEmail, isSupabase } = useAuth();
  const { push } = useToast();

  const [showEmailForm, setShowEmailForm] = useState(isSupabase);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const enterAs = (role: "athlete" | "admin") => {
    login(role);
    navigate("/");
  };

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password, fullName || email.split("@")[0]);
        push("Conta criada! Verifique seu e-mail para confirmar.", "success");
        setIsSignUp(false);
      } else {
        await loginWithEmail(email, password);
        navigate("/");
      }
    } catch (err) {
      push((err as Error).message || "Falha no login", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-bg">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 60% at 50% 0%, rgba(34,197,94,0.18) 0%, transparent 55%), linear-gradient(180deg, #0A0A0A 0%, #000 100%)",
        }}
      />
      <div className="particles absolute inset-0" />

      <div className="relative z-10 min-h-[100dvh] flex flex-col items-center justify-between px-6 py-10 max-w-xl mx-auto">
        <div className="flex-1 flex flex-col items-center justify-center text-center w-full">
          <img
            src="/logo.jpeg"
            alt="Reserva CrossFit"
            className="w-24 h-24 object-contain drop-shadow-[0_0_24px_rgba(34,197,94,0.5)] mb-5"
          />

          <h1 className="font-display font-black uppercase text-5xl leading-[0.95] tracking-tight">
            <span className="block text-text">RESERVA</span>
            <span className="block text-primary">CROSSFIT</span>
          </h1>

          <p className="mt-5 text-muted max-w-xs text-lg">
            Treine. Evolua.{" "}
            <span className="text-primary font-semibold">#PadrãoReserva</span>
          </p>

          {!showEmailForm && (
            <div className="mt-8 grid grid-cols-3 gap-4 w-full max-w-xs">
              <Stat label="Atletas" value="350+" />
              <Stat label="Coaches" value="6" />
              <Stat label="Anos" value="7" />
            </div>
          )}

          {isSupabase && showEmailForm && (
            <form onSubmit={handleEmailSubmit} className="w-full max-w-sm mt-8 space-y-3 text-left">
              {isSignUp && (
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted">Nome completo</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full mt-1 px-3 py-2.5 rounded-lg bg-surface-2 border border-border focus:border-primary outline-none text-sm"
                  />
                </div>
              )}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted">E-mail</label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full mt-1 px-3 py-2.5 rounded-lg bg-surface-2 border border-border focus:border-primary outline-none text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted">Senha</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full mt-1 px-3 py-2.5 rounded-lg bg-surface-2 border border-border focus:border-primary outline-none text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {isSignUp ? "Criar conta" : "Entrar"}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="w-full text-center text-xs text-muted hover:text-text transition py-1"
              >
                {isSignUp ? "Já tenho conta — entrar" : "Novo por aqui? Criar conta"}
              </button>
            </form>
          )}
        </div>

        <div className="w-full max-w-sm space-y-3">
          {isSupabase && !showEmailForm && (
            <button
              onClick={() => setShowEmailForm(true)}
              className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-2"
            >
              Entrar com e-mail
              <ArrowRight className="w-5 h-5" />
            </button>
          )}

          {isSupabase && showEmailForm && (
            <>
              <div className="flex items-center gap-3 text-[11px] uppercase tracking-wider text-muted">
                <div className="flex-1 h-px bg-border" />
                ou demonstração
                <div className="flex-1 h-px bg-border" />
              </div>
            </>
          )}

          <button
            onClick={() => enterAs("athlete")}
            className={`w-full py-4 text-lg flex items-center justify-center gap-2 ${
              isSupabase ? "btn-secondary" : "btn-primary"
            }`}
          >
            {isSupabase ? "Demo — Entrar como Aluno" : "Entrar como Aluno"}
            {!isSupabase && <ArrowRight className="w-5 h-5" />}
          </button>
          <button
            onClick={() => enterAs("admin")}
            className="w-full btn-secondary py-4 text-lg flex items-center justify-center gap-2"
          >
            <Shield className="w-5 h-5" />
            {isSupabase ? "Demo — Entrar como Admin" : "Entrar como Admin"}
          </button>
          <p className="text-center text-xs text-muted">
            {isSupabase ? "Produção + Demo" : "Demo"} — Sorocaba/SP · MVP v2.0
          </p>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="font-display font-black text-primary text-2xl leading-none">
        {value}
      </p>
      <p className="text-[11px] text-muted uppercase tracking-wider mt-1">
        {label}
      </p>
    </div>
  );
}
