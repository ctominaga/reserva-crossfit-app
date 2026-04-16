import { useNavigate } from "react-router-dom";
import { ArrowRight, Shield } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Onboarding() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const enterAs = (role: "athlete" | "admin") => {
    login(role);
    navigate("/");
  };

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-bg">
      {/* Background gradient + overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 60% at 50% 0%, rgba(34,197,94,0.18) 0%, transparent 55%), linear-gradient(180deg, #0A0A0A 0%, #000 100%)",
        }}
      />
      <div className="particles absolute inset-0" />

      {/* Content */}
      <div className="relative z-10 min-h-[100dvh] flex flex-col items-center justify-between px-6 py-12 max-w-xl mx-auto">
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <img
            src="/logo.jpeg"
            alt="Reserva CrossFit"
            className="w-28 h-28 object-contain drop-shadow-[0_0_24px_rgba(34,197,94,0.5)] mb-6"
          />

          <h1 className="font-display font-black uppercase text-5xl leading-[0.95] tracking-tight">
            <span className="block text-text">RESERVA</span>
            <span className="block text-primary">CROSSFIT</span>
          </h1>

          <p className="mt-6 text-muted max-w-xs text-lg">
            Treine. Evolua.{" "}
            <span className="text-primary font-semibold">#PadrãoReserva</span>
          </p>

          <div className="mt-10 grid grid-cols-3 gap-4 w-full max-w-xs">
            <Stat label="Atletas" value="350+" />
            <Stat label="Coaches" value="6" />
            <Stat label="Anos" value="7" />
          </div>
        </div>

        <div className="w-full max-w-sm space-y-3">
          <button
            onClick={() => enterAs("athlete")}
            className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-2"
          >
            Entrar como Aluno
            <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => enterAs("admin")}
            className="w-full btn-secondary py-4 text-lg flex items-center justify-center gap-2"
          >
            <Shield className="w-5 h-5" />
            Entrar como Admin
          </button>
          <p className="text-center text-xs text-muted">
            Demo — Sorocaba/SP · MVP v2.0
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
