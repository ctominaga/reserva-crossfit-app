import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Brain, Copy, RefreshCw, Loader2 } from "lucide-react";
import { AISetup } from "../../components/admin/AISetup";
import { PromptEditor } from "../../components/admin/PromptEditor";
import { analyzeWithGroq, getGroqApiKey, isGroqApiKeyFromEnv } from "../../services/groq";
import { mockAdminAthletes } from "../../data/mock";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { useToast } from "../../hooks/useToast";

const GENERAL_PROMPT_TEMPLATE = `Você é um especialista em performance atlética e metodologia CrossFit.
Analise os seguintes dados de treino dos alunos do box Reserva CrossFit
(Sorocaba/SP) no período de {dataInicio} a {dataFim} e forneça:

1. ANÁLISE GERAL DE PERFORMANCE
   - Tendências de evolução da turma
   - Movimentos com maior e menor progresso
   - Taxa de presença e consistência

2. PONTOS CRÍTICOS DE MELHORIA
   - Top 3 áreas que a turma precisa desenvolver
   - Identificação de padrões de fadiga ou overtraining

3. RECOMENDAÇÕES DE PROGRAMAÇÃO
   - Sugestões de foco para as próximas 4 semanas
   - Ajuste de volume e intensidade baseado nos dados
   - Movimentos de ginástica, levantamento e condicionamento que devem ser priorizados

4. INSIGHTS BASEADOS NA METODOLOGIA CROSSFIT
   - Alinhamento com os 10 componentes de fitness do CrossFit
   - Sugestões de benchmark WODs para avaliar progresso

Dados dos alunos:
{dadosAlunos}

Responda em português brasileiro, de forma estruturada e acionável.`;

const INDIVIDUAL_PROMPT_TEMPLATE = `Você é um coach especialista em CrossFit. Analise os dados de treino
individuais do atleta {nomeAluno} do Reserva CrossFit e forneça:

1. PERFIL ATLÉTICO ATUAL
   - Pontos fortes identificados
   - Limitadores de performance

2. EVOLUÇÃO NO PERÍODO
   - PRs conquistados e benchmarks melhorados
   - Análise de consistência de treino

3. PLANO DE DESENVOLVIMENTO PERSONALIZADO
   - Foco técnico recomendado (movimentos específicos)
   - Sugestão de scaling adequado para as próximas semanas
   - Trabalho acessório recomendado

4. METAS REALISTAS
   - 3 metas para as próximas 4 semanas
   - 1 meta de longo prazo (3 meses)

Dados do atleta:
{dadosAtleta}

Responda em português, de forma personalizada e motivacional.`;

function buildGeneralData(from: string, to: string) {
  return JSON.stringify({
    periodo: { inicio: from, fim: to },
    totalAlunos: 10,
    mediaFrequencia: "4.2 treinos/semana",
    distribuicaoNiveis: { RX: "35%", Scaled: "50%", Beginner: "15%" },
    benchmarks: [
      { nome: "Fran", mediaAtual: "5:45", mediaAnterior: "6:20", evolucao: "-9%" },
      { nome: "Grace", mediaAtual: "6:50", mediaAnterior: "7:30", evolucao: "-8.9%" },
      { nome: "Helen", mediaAtual: "10:30", mediaAnterior: "11:05", evolucao: "-5.3%" },
    ],
    prs: [
      { movimento: "Back Squat", mediaBox: "118kg", evol30d: "+4kg" },
      { movimento: "Deadlift", mediaBox: "142kg", evol30d: "+3kg" },
      { movimento: "Clean & Jerk", mediaBox: "78kg", evol30d: "+2kg" },
    ],
    presenca: { media: "82%", melhor: "Beatriz Alves 95%", pior: "Paula Nogueira 30%" },
  }, null, 2);
}

function buildAthleteData(name: string) {
  const a = mockAdminAthletes.find((x) => x.name === name);
  return JSON.stringify({
    nome: name,
    membro_desde: a?.memberSince ?? "Mar 2023",
    frequencia_periodo: `${Math.round((a?.frequency ?? 80) * 22 / 100)} treinos (${a?.frequency ?? 80}%)`,
    nivel_predominante: (a?.frequency ?? 80) > 80 ? "RX (60%) / Scaled (40%)" : "Scaled (70%) / RX (30%)",
    prs_periodo: [
      { movimento: "Back Squat", valor: "120kg", evolucao: "+5kg" },
      { movimento: "Deadlift", valor: "140kg", evolucao: "+3kg" },
    ],
    benchmarks: [
      { nome: "Fran", resultado: "4:32", evolucao: "-38s" },
      { nome: "Grace", resultado: "6:45", evolucao: "-45s" },
    ],
    ranking_atual: 7,
  }, null, 2);
}

export default function AnaliseIA() {
  const [localKey, setLocalKey] = useLocalStorage("reserva-groq-key", "");
  const envKeyPresent = isGroqApiKeyFromEnv();
  const apiKey = getGroqApiKey();
  const [showSetup, setShowSetup] = useState(false);
  const [mode, setMode] = useState<"general" | "individual">("general");
  const [dateFrom, setDateFrom] = useState("2026-03-01");
  const [dateTo, setDateTo] = useState("2026-04-16");
  const [selectedAthlete, setSelectedAthlete] = useState(mockAdminAthletes[0].name);
  const [generalPrompt, setGeneralPrompt] = useState(GENERAL_PROMPT_TEMPLATE);
  const [individualPrompt, setIndividualPrompt] = useState(INDIVIDUAL_PROMPT_TEMPLATE);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const { push } = useToast();

  if (!apiKey || showSetup) {
    return (
      <div className="px-4 py-4 max-w-xl mx-auto pb-24 space-y-4">
        <h1 className="font-display font-black uppercase text-2xl">Análise IA</h1>
        <AISetup
          apiKey={localKey}
          onSave={(k) => {
            setLocalKey(k);
            setShowSetup(false);
          }}
        />
      </div>
    );
  }

  const handleAnalyze = async () => {
    setLoading(true);
    setResult(null);

    let prompt: string;
    if (mode === "general") {
      const data = buildGeneralData(dateFrom, dateTo);
      prompt = generalPrompt
        .replace("{dataInicio}", dateFrom)
        .replace("{dataFim}", dateTo)
        .replace("{dadosAlunos}", data);
    } else {
      const data = buildAthleteData(selectedAthlete);
      prompt = individualPrompt
        .replace("{nomeAluno}", selectedAthlete)
        .replace("{dadosAtleta}", data);
    }

    try {
      const text = await analyzeWithGroq(prompt, apiKey);
      setResult(text);
    } catch (err) {
      push((err as Error).message || "Erro ao gerar análise", "error");
    } finally {
      setLoading(false);
    }
  };

  const copyResult = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      push("Análise copiada!", "success");
    }
  };

  return (
    <div className="px-4 py-4 max-w-xl mx-auto pb-24 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-black uppercase text-2xl">Análise IA</h1>
        <button
          onClick={() => {
            if (envKeyPresent) {
              setShowSetup(true);
            } else {
              setLocalKey("");
            }
          }}
          className="text-xs text-muted hover:text-text transition"
        >
          {envKeyPresent ? "Alterar chave" : "Configurar Groq"}
        </button>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => { setMode("general"); setResult(null); }}
          className={`chip ${mode === "general" ? "chip-active" : ""}`}
        >
          Geral
        </button>
        <button
          onClick={() => { setMode("individual"); setResult(null); }}
          className={`chip ${mode === "individual" ? "chip-active" : ""}`}
        >
          Individual
        </button>
      </div>

      {/* Params */}
      <div className="card p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted">De</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full mt-1 px-3 py-2.5 rounded-lg bg-surface-2 border border-border focus:border-primary outline-none text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted">Até</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full mt-1 px-3 py-2.5 rounded-lg bg-surface-2 border border-border focus:border-primary outline-none text-sm"
            />
          </div>
        </div>

        {mode === "individual" && (
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted">Aluno</label>
            <select
              value={selectedAthlete}
              onChange={(e) => setSelectedAthlete(e.target.value)}
              className="w-full mt-1 px-3 py-2.5 rounded-lg bg-surface-2 border border-border focus:border-primary outline-none text-sm"
            >
              {mockAdminAthletes.map((a) => (
                <option key={a.id} value={a.name}>{a.name}</option>
              ))}
            </select>
          </div>
        )}

        {mode === "general" ? (
          <p className="text-xs text-muted">Alunos incluídos: Todos ({mockAdminAthletes.length})</p>
        ) : (
          <p className="text-xs text-muted">Análise personalizada para {selectedAthlete}</p>
        )}
      </div>

      {/* Prompt editor */}
      <PromptEditor
        prompt={mode === "general" ? generalPrompt : individualPrompt}
        onChange={mode === "general" ? setGeneralPrompt : setIndividualPrompt}
        label="Prompt enviado ao Groq"
      />

      {/* Analyze button */}
      <button
        onClick={handleAnalyze}
        disabled={loading}
        className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Analisando com Groq / LLaMA 3.3{mode === "individual" ? ` — ${selectedAthlete}` : ""}...
          </>
        ) : (
          <>
            <Brain className="w-5 h-5" />
            Gerar Análise {mode === "general" ? "Geral" : "Individual"}
          </>
        )}
      </button>

      {/* Result */}
      {result && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="section-title">Resultado da Análise</h2>
            <div className="flex gap-2">
              <button onClick={copyResult} className="btn-ghost flex items-center gap-1.5 text-xs px-3 py-1.5">
                <Copy className="w-3.5 h-3.5" />
                Copiar
              </button>
              <button onClick={handleAnalyze} disabled={loading} className="btn-ghost flex items-center gap-1.5 text-xs px-3 py-1.5">
                <RefreshCw className="w-3.5 h-3.5" />
                Regenerar
              </button>
            </div>
          </div>

          <div className="card p-5 prose prose-sm prose-invert max-w-none [&_h1]:font-display [&_h1]:uppercase [&_h1]:text-lg [&_h2]:font-display [&_h2]:uppercase [&_h2]:text-base [&_h3]:font-display [&_h3]:uppercase [&_h3]:text-sm [&_strong]:text-primary [&_li]:text-sm [&_p]:text-sm [&_p]:text-muted [&_li]:text-muted">
            <ReactMarkdown>{result}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
