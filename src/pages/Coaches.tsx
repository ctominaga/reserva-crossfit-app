import { Instagram } from "lucide-react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { mockCoaches, type Coach } from "../data/mock";

export default function CoachesPublic() {
  const [coaches] = useLocalStorage<Coach[]>("reserva-coaches", mockCoaches);
  const activeCoaches = coaches.filter((c) => c.isActive);

  return (
    <div className="px-4 py-4 max-w-xl mx-auto pb-24 space-y-4">
      <div>
        <h1 className="font-display font-black uppercase text-2xl">
          Nossos Coaches
        </h1>
        <p className="text-xs text-muted">{activeCoaches.length} coaches no Reserva CrossFit</p>
      </div>

      <div className="space-y-3">
        {activeCoaches.map((coach) => (
          <div key={coach.id} className="card p-5">
            <div className="flex flex-col items-center text-center">
              {/* Avatar */}
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center font-display font-black text-2xl text-black"
                style={{ backgroundColor: coach.color }}
              >
                {coach.initial}
              </div>

              <h3 className="font-display font-black uppercase text-lg mt-3">
                {coach.name}
              </h3>

              {/* Specialties */}
              <div className="flex flex-wrap justify-center gap-1.5 mt-2">
                {coach.specialty.map((s) => (
                  <span
                    key={s}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-semibold"
                  >
                    {s}
                  </span>
                ))}
              </div>

              {/* Certifications */}
              <p className="text-xs text-muted mt-2 flex items-center gap-1">
                <span>⭐</span>
                {coach.certifications.join(" · ")}
              </p>

              {/* Bio */}
              {coach.bio && (
                <p className="text-sm text-muted mt-2 leading-relaxed">
                  {coach.bio}
                </p>
              )}

              <p className="text-[11px] text-muted mt-2">
                Ativo desde {coach.activeSince}
              </p>

              {/* Instagram */}
              {coach.instagram && (
                <a
                  href={`https://instagram.com/${coach.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 flex items-center gap-1.5 text-xs text-primary hover:underline"
                >
                  <Instagram className="w-3.5 h-3.5" />
                  @{coach.instagram}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
