// NOTE: dangerouslyAllowBrowser is required because the API call is made
// directly from the frontend. In a production environment, this should be
// routed through a backend proxy to avoid exposing the API key.

import Groq from 'groq-sdk';

export const GROQ_STORAGE_KEY = 'reserva-groq-key';

export function isGroqApiKeyFromEnv(): boolean {
  return Boolean(import.meta.env.VITE_GROQ_API_KEY);
}

export function getGroqApiKey(): string {
  return (
    import.meta.env.VITE_GROQ_API_KEY
    || localStorage.getItem(GROQ_STORAGE_KEY)
    || ''
  );
}

export async function analyzeWithGroq(
  prompt: string,
  apiKey: string = getGroqApiKey()
): Promise<string> {
  if (!apiKey?.trim()) throw new Error('API Key não configurada.');

  try {
    const client = new Groq({ apiKey, dangerouslyAllowBrowser: true });

    const completion = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1500,
      temperature: 0.7,
    });

    const text = completion.choices[0]?.message?.content;
    if (!text) throw new Error('Resposta vazia da API.');
    return text;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Groq error:', msg);

    if (msg.includes('401') || msg.includes('invalid_api_key') || msg.includes('Authentication'))
      throw new Error('Chave de API inválida. Verifique nas configurações.');
    if (msg.includes('429') || msg.includes('rate_limit_exceeded'))
      throw new Error('Limite de requisições atingido. Aguarde alguns minutos e tente novamente.');
    if (msg.includes('503') || msg.includes('unavailable'))
      throw new Error('Serviço temporariamente indisponível. Tente novamente em instantes.');

    throw new Error(`Erro ao chamar a API: ${msg}`);
  }
}
