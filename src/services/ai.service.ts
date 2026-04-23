// NOTE: dangerouslyAllowBrowser é necessário porque a chamada é feita direto
// do frontend. Em produção, recomenda-se rotear via um proxy backend para
// evitar exposição da chave.

import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';

export const AI_STORAGE_KEY = 'reserva-groq-key';

export function isAIKeyFromEnv(): boolean {
  return Boolean(import.meta.env.VITE_AI_API_KEY?.trim());
}

export function getAIKey(): string {
  return (
    import.meta.env.VITE_AI_API_KEY?.trim() ||
    localStorage.getItem(AI_STORAGE_KEY)?.trim() ||
    ''
  );
}

export async function analyzeWithAI(
  prompt: string,
  key: string = getAIKey()
): Promise<string> {
  if (!key?.trim()) throw new Error('API Key não configurada.');

  const isGemini = key.startsWith('AIza');
  const isGroq = key.startsWith('gsk_');

  try {
    if (isGemini) {
      const genAI = new GoogleGenerativeAI(key);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-8b' });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      if (!text) throw new Error('Resposta vazia.');
      return text;
    }

    if (isGroq) {
      const client = new Groq({ apiKey: key, dangerouslyAllowBrowser: true });
      const completion = await client.chat.completions.create({
        model: 'llama3-8b-8192',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1500,
        temperature: 0.7,
      });
      const text = completion.choices[0]?.message?.content;
      if (!text) throw new Error('Resposta vazia.');
      return text;
    }

    throw new Error(
      'Formato de chave não reconhecido. Use chave Gemini (AIza...) ou Groq (gsk_...).'
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('AI error:', msg);
    if (msg.includes('API_KEY_INVALID') || msg.includes('401') || msg.includes('invalid_api_key'))
      throw new Error('Chave inválida. Verifique nas configurações.');
    if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('rate_limit_exceeded'))
      throw new Error('Limite atingido. Aguarde alguns minutos.');
    throw new Error(`Erro: ${msg}`);
  }
}
