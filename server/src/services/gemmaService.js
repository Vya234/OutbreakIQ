/**
 * Gemma 4 integration via Ollama (local) or Google AI Studio.
 * Falls back to rule-based responses when the AI provider is unavailable.
 */

import { buildFallbackResponse, stripGroundedBanner } from './fallbackResponseService.js';

const SYSTEM_INSTRUCTION = `You are OutbreakIQ, a public health AI assistant powered by Gemma.
Answer using ONLY the outbreak data provided in context when discussing specific outbreaks.
Summarize relevant records in plain language — do not dump raw data tables or repeat every field.
Show only outbreaks that match the user's question. For high-risk region questions, discuss only high-severity records.
Be accurate, concise, and practical. Include prevention steps when relevant.
If data is missing or uncertain, say so clearly — do not invent case numbers or locations.
Use bullet points for lists. Keep responses under 300 words unless asked for detail.
Do not append "Grounded Response Mode" or similar disclaimers — the UI handles that separately.`;

/**
 * Call Ollama generate API.
 */
async function callOllama(prompt, config) {
  const url = `${config.apiUrl.replace(/\/$/, '')}/api/generate`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: config.model,
      prompt,
      stream: false,
      options: { temperature: 0.4, num_predict: 600 },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Ollama error (${res.status}): ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  return data.response?.trim() || '';
}

/**
 * Call Google Generative Language API (Gemma models).
 */
async function callGoogleAI(prompt, config) {
  const model = config.model || 'gemma-2-9b-it';
  const base = (process.env.GOOGLE_AI_URL || 'https://generativelanguage.googleapis.com/v1beta/models').replace(/\/$/, '');
  const url = `${base}/${model}:generateContent?key=${config.apiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 600 },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google AI error (${res.status}): ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
}

/**
 * Build the full prompt sent to Gemma.
 */
export function buildPrompt({ userMessage, contextText, mode = 'chat' }) {
  const task =
    mode === 'recommendations'
      ? `Generate structured prevention recommendations for the outbreak(s) in context.
Return sections: Key Symptoms, Prevention Measures, Recommended Actions, Risk Assessment.
Be specific to the disease and location when data is present.`
      : `Answer the user's public health question using the outbreak context below.`;

  return `${SYSTEM_INSTRUCTION}

${task}

--- OUTBREAK DATA ---
${contextText || 'No outbreak records available.'}
--- END DATA ---

User: ${userMessage}

Assistant:`;
}

/**
 * Main entry: generate AI text from user message + context.
 */
export async function generateWithGemma({ userMessage, contextText, outbreaks = [], mode = 'chat' }) {
  const prompt = buildPrompt({ userMessage, contextText, mode });
  const provider = (process.env.GEMMA_PROVIDER || 'ollama').toLowerCase();
  const config = {
    apiUrl: process.env.GEMMA_API_URL || 'http://127.0.0.1:11434',
    model: process.env.GEMMA_MODEL || 'gemma2:2b',
    apiKey: process.env.GEMMA_API_KEY || '',
  };

  try {
    if (provider === 'google') {
      if (!config.apiKey) throw new Error('GEMMA_API_KEY required for Google AI Studio');
      const text = await callGoogleAI(prompt, config);
      if (text) return { text: stripGroundedBanner(text), provider: 'google', fallback: false };
    } else if (provider !== 'fallback') {
      const text = await callOllama(prompt, config);
      if (text) return { text: stripGroundedBanner(text), provider: 'ollama', fallback: false };
    }
  } catch (err) {
    console.warn('Gemma call failed, using fallback:', err.message);
  }

  return {
    text: buildFallbackResponse(userMessage, outbreaks),
    provider: 'fallback',
    fallback: true,
  };
}
