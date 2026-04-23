import { useCallback, useEffect, useState } from 'react';
import { Sparkles, Target, Zap, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import {
  getWODRecommendation,
  clearRecommendationCache,
  type WODData,
  type WODRecommendation,
} from '../../services/wod-recommendation.service';

interface WODRecommendationCardProps {
  wod: WODData;
  cacheKey: string;
  apiKey: string;
  defaultExpanded?: boolean;
}

const SCALING_COLORS: Record<'RX' | 'Scaled' | 'Beginner', { bg: string; border: string; text: string }> = {
  RX:       { bg: 'bg-primary/10', border: 'border-primary/40', text: 'text-primary' },
  Scaled:   { bg: 'bg-warning/10', border: 'border-warning/40', text: 'text-warning' },
  Beginner: { bg: 'bg-muted/10',   border: 'border-muted/40',   text: 'text-muted'   },
};

export function WODRecommendationCard({
  wod,
  cacheKey,
  apiKey,
  defaultExpanded = true,
}: WODRecommendationCardProps) {
  const [rec, setRec] = useState<WODRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(defaultExpanded);

  const load = useCallback(
    async (force = false) => {
      if (!apiKey) return;
      setLoading(true);
      setError(null);
      if (force) clearRecommendationCache(cacheKey);
      try {
        const result = await getWODRecommendation(wod, apiKey, cacheKey);
        setRec(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao gerar recomendação');
      } finally {
        setLoading(false);
      }
    },
    [apiKey, cacheKey, wod]
  );

  useEffect(() => {
    if (expanded && !rec && !loading && !error) {
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded]);

  useEffect(() => {
    if (defaultExpanded) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, apiKey]);

  if (!apiKey) return null;

  const scalingStyle = rec ? SCALING_COLORS[rec.scaling] : null;

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between p-4 hover:bg-surface-2 transition"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="font-display font-black uppercase text-base tracking-wide">
            Minha Recomendação
          </span>
          {rec && !loading && scalingStyle && (
            <span
              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${scalingStyle.bg} ${scalingStyle.border} ${scalingStyle.text}`}
            >
              {rec.scaling}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {loading && (
            <span className="text-[11px] text-muted font-medium animate-pulse">
              Analisando...
            </span>
          )}
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-muted" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
          {loading && (
            <div className="space-y-2">
              {[80, 60, 90, 70].map((w, i) => (
                <div
                  key={i}
                  className="h-3 bg-surface-2 rounded animate-pulse"
                  style={{ width: `${w}%` }}
                />
              ))}
            </div>
          )}

          {error && !loading && (
            <div className="flex items-center justify-between bg-danger/10 border border-danger/30 rounded-lg p-3">
              <span className="text-xs text-danger font-medium">{error}</span>
              <button
                onClick={() => load(true)}
                className="text-xs text-danger underline ml-2 shrink-0"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {rec && !loading && (
            <>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center flex-shrink-0">
                  <Target className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted mb-1">
                    Sua Meta
                  </p>
                  <p className="text-sm text-text font-medium leading-relaxed">
                    {rec.goal}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-warning/10 border border-warning/30 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-4 h-4 text-warning" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted mb-1">
                    Estratégia
                  </p>
                  <p className="text-sm text-text leading-relaxed">{rec.strategy}</p>
                </div>
              </div>

              {scalingStyle && (
                <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
                  <div
                    className={`flex items-center gap-1.5 text-[11px] font-bold uppercase px-3 py-1.5 rounded-full border ${scalingStyle.bg} ${scalingStyle.border} ${scalingStyle.text}`}
                  >
                    <span>Escala recomendada:</span>
                    <span>{rec.scaling}</span>
                  </div>
                  <button
                    onClick={() => load(true)}
                    className="flex items-center gap-1 text-[11px] text-muted hover:text-text transition"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Atualizar</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
