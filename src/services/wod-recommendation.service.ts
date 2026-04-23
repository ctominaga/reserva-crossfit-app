import { analyzeWithAI } from './ai.service';
import { mockUser, mockPRs, mockBenchmarks, mockWODHistory } from '../data/mock';

export type RecommendedScale = 'RX' | 'Scaled' | 'Beginner';

export interface WODRecommendation {
  goal: string;
  strategy: string;
  scaling: RecommendedScale;
  generatedAt: string;
}

export interface WODData {
  title: string;
  type: string;
  duration?: number;
  movements: Array<{
    name: string;
    reps?: string;
    weight?: string;
    height?: string;
    distance?: string;
  }>;
  scaling: {
    rx: string;
    scaled: string;
    beginner: string;
  };
}

interface StoredResult {
  date: string;
  title: string;
  type: string;
  summary: string;
  movements?: string[];
}

interface AthleteProfile {
  name: string;
  memberSince: string;
  streak: number;
  totalWorkouts: number;
  recentResults: Array<{
    date: string;
    title: string;
    type: string;
    summary: string;
  }>;
  prs: Array<{ movement: string; value: string; unit: string }>;
  benchmarks: Array<{ name: string; currentResult: string; previousResult?: string }>;
}

function buildAthleteProfile(): AthleteProfile {
  const storedResults = localStorage.getItem('reserva-wod-results');
  const parsedResults: StoredResult[] = storedResults ? JSON.parse(storedResults) : [];

  return {
    name: mockUser.firstName,
    memberSince: mockUser.memberSince,
    streak: mockUser.streak,
    totalWorkouts: mockUser.totalWorkouts,
    recentResults:
      parsedResults.length > 0
        ? parsedResults.slice(0, 5).map((r) => ({
            date: r.date,
            title: r.title,
            type: r.type,
            summary: r.summary,
          }))
        : mockWODHistory.slice(0, 5).map((w) => ({
            date: w.date,
            title: w.title,
            type: w.type,
            summary: w.summary,
          })),
    prs: mockPRs.slice(0, 8).map((pr) => ({
      movement: pr.movement,
      value: pr.value,
      unit: pr.unit,
    })),
    benchmarks: mockBenchmarks.map((b) => ({
      name: b.name,
      currentResult: b.currentResult,
      previousResult: b.previousResult,
    })),
  };
}

function buildPrompt(wod: WODData, athlete: AthleteProfile): string {
  const movementsList =
    wod.movements.length > 0
      ? wod.movements
          .map((m) => {
            const parts = [m.reps, m.weight, m.height, m.distance].filter(Boolean).join(' · ');
            return `  - ${m.name}${parts ? ` (${parts})` : ''}`;
          })
          .join('\n')
      : '  - (sem detalhes de movimentos disponíveis)';

  const prsList = athlete.prs.map((pr) => `  - ${pr.movement}: ${pr.value} ${pr.unit}`).join('\n');

  const recentList = athlete.recentResults
    .map((r) => `  - ${r.date}: ${r.title} (${r.type}) — ${r.summary}`)
    .join('\n');

  const benchmarksList = athlete.benchmarks
    .map((b) => `  - ${b.name}: ${b.currentResult}${b.previousResult ? ` (anterior: ${b.previousResult})` : ''}`)
    .join('\n');

  const scalingBlock = [
    wod.scaling.rx ? `- Escala RX: ${wod.scaling.rx}` : '',
    wod.scaling.scaled ? `- Escala Scaled: ${wod.scaling.scaled}` : '',
    wod.scaling.beginner ? `- Escala Beginner: ${wod.scaling.beginner}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  return `Você é um coach especialista em CrossFit. Analise o WOD abaixo e o perfil do atleta para gerar recomendações personalizadas.

WOD:
- Nome: ${wod.title}
- Tipo: ${wod.type}${wod.duration ? ` · ${wod.duration} minutos` : ''}
- Movimentos:
${movementsList}
${scalingBlock}

PERFIL DO ATLETA — ${athlete.name}:
- Membro desde: ${athlete.memberSince}
- Total de treinos: ${athlete.totalWorkouts}
- Sequência atual: ${athlete.streak} dias
- Personal Records:
${prsList}
- Benchmarks:
${benchmarksList}
- Treinos recentes:
${recentList}

Com base nesses dados, responda SOMENTE em JSON válido, sem markdown, sem explicações, exatamente neste formato:
{
  "goal": "Meta concisa e motivacional para este WOD específico (1-2 frases, máx 100 caracteres)",
  "strategy": "Estratégia detalhada de execução para este atleta específico (2-4 frases, máx 300 caracteres)",
  "scaling": "RX" | "Scaled" | "Beginner"
}

Personalize para o nível real do atleta. Seja direto, técnico e motivacional. Responda em português brasileiro.`;
}

const recommendationCache = new Map<string, WODRecommendation>();

function normalizeScale(value: unknown): RecommendedScale {
  if (typeof value !== 'string') return 'Scaled';
  const v = value.trim().toLowerCase();
  if (v === 'rx') return 'RX';
  if (v === 'beginner') return 'Beginner';
  return 'Scaled';
}

export async function getWODRecommendation(
  wod: WODData,
  apiKey: string,
  cacheKey: string
): Promise<WODRecommendation> {
  if (recommendationCache.has(cacheKey)) {
    return recommendationCache.get(cacheKey)!;
  }

  const localCacheKey = `reserva-wod-rec-${cacheKey}`;
  const cached = localStorage.getItem(localCacheKey);
  if (cached) {
    try {
      const parsed = JSON.parse(cached) as WODRecommendation;
      recommendationCache.set(cacheKey, parsed);
      return parsed;
    } catch {
      localStorage.removeItem(localCacheKey);
    }
  }

  const athlete = buildAthleteProfile();
  const prompt = buildPrompt(wod, athlete);
  const rawResponse = await analyzeWithAI(prompt, apiKey);

  let parsed: { goal: string; strategy: string; scaling: string };
  try {
    const clean = rawResponse.replace(/```json\n?|\n?```/g, '').trim();
    const jsonStart = clean.indexOf('{');
    const jsonEnd = clean.lastIndexOf('}');
    const jsonText = jsonStart >= 0 && jsonEnd > jsonStart ? clean.slice(jsonStart, jsonEnd + 1) : clean;
    parsed = JSON.parse(jsonText);
  } catch {
    parsed = {
      goal: 'Dê o seu melhor hoje — cada rep conta!',
      strategy: rawResponse.slice(0, 300),
      scaling: 'Scaled',
    };
  }

  const recommendation: WODRecommendation = {
    goal: parsed.goal,
    strategy: parsed.strategy,
    scaling: normalizeScale(parsed.scaling),
    generatedAt: new Date().toISOString(),
  };

  recommendationCache.set(cacheKey, recommendation);
  localStorage.setItem(localCacheKey, JSON.stringify(recommendation));

  return recommendation;
}

export function clearRecommendationCache(cacheKey: string) {
  recommendationCache.delete(cacheKey);
  localStorage.removeItem(`reserva-wod-rec-${cacheKey}`);
}

export function cleanOldRecommendationCache() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);

  Object.keys(localStorage)
    .filter((k) => k.startsWith('reserva-wod-rec-'))
    .forEach((k) => {
      const dateStr = k.replace('reserva-wod-rec-', '');
      const d = new Date(dateStr);
      if (!Number.isNaN(d.getTime()) && d < cutoff) {
        localStorage.removeItem(k);
      }
    });
}

export interface SavedWODResult {
  date: string;
  title: string;
  type: string;
  summary: string;
  movements: string[];
}

export function saveWODResult(result: SavedWODResult) {
  const stored = localStorage.getItem('reserva-wod-results');
  const list: SavedWODResult[] = stored ? JSON.parse(stored) : [];
  const updated = [result, ...list.filter((r) => r.date !== result.date)].slice(0, 20);
  localStorage.setItem('reserva-wod-results', JSON.stringify(updated));
}
