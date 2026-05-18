/**
 * Gemma 4 integration via Ollama (local) or Google AI Studio.
 * Falls back to rule-based responses when the AI provider is unavailable.
 */

import { isHighRiskQuery } from './outbreakContextService.js';

const SYSTEM_INSTRUCTION = `You are OutbreakIQ, a public health AI assistant powered by Gemma.
Answer using ONLY the outbreak data provided in context when discussing specific outbreaks.
Summarize relevant records in plain language — do not dump raw data tables or repeat every field.
Show only outbreaks that match the user's question. For high-risk region questions, discuss only high-severity records.
Be accurate, concise, and practical. Include prevention steps when relevant.
If data is missing or uncertain, say so clearly — do not invent case numbers or locations.
Use bullet points for lists. Keep responses under 300 words unless asked for detail.`;

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

const GROUNDED_BANNER =
  '**Grounded Response Mode** — Generated using structured outbreak data.';

function formatReportedAt(value) {
  return new Date(value).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatOutbreakSummary(outbreak) {
  return `**${outbreak.disease}** — ${outbreak.location}
- **Cases:** ${outbreak.cases}
- **Severity:** ${outbreak.severity}
- **Reported:** ${formatReportedAt(outbreak.reportedAt)}
- **Details:** ${outbreak.description || 'No description available.'}`;
}

function summarizeOutbreaks(outbreaks, { compact = false } = {}) {
  if (!outbreaks?.length) {
    return 'No matching outbreak records found. Run `npm run seed` after starting MongoDB.';
  }
  if (outbreaks.length === 1) return formatOutbreakSummary(outbreaks[0]);

  if (compact || outbreaks.length > 3) {
    const totalCases = outbreaks.reduce((s, o) => s + Number(o.cases || 0), 0);
    const lines = outbreaks.slice(0, 7).map((o) => {
      const cases = Number(o.cases).toLocaleString('en-IN');
      return `- **${o.disease}** (${o.severity}) — ${o.location}: ${cases} cases`;
    });
    const more = outbreaks.length > 7 ? `\n- …and ${outbreaks.length - 7} more matching records` : '';
    return `**Summary (${outbreaks.length} relevant outbreaks, ${totalCases.toLocaleString('en-IN')} total cases):**\n\n${lines.join('\n')}${more}`;
  }

  return outbreaks.map(formatOutbreakSummary).join('\n\n');
}

function isSummaryQuery(message) {
  return /\b(summarize|summary|overview|brief|status of|tell me about|describe)\b/i.test(message);
}

function getHighSeverityOutbreaks(outbreaks) {
  return [...outbreaks]
    .filter((o) => String(o.severity).toLowerCase() === 'high')
    .sort((a, b) => Number(b.cases) - Number(a.cases))
    .slice(0, 7);
}

function formatHighRiskLine(outbreak) {
  const cases = Number(outbreak.cases).toLocaleString('en-IN');
  return `- ${outbreak.location} — ${outbreak.disease} (${cases} cases)`;
}

function formatHighRiskResponse(outbreaks) {
  const highRecords = getHighSeverityOutbreaks(outbreaks);

  if (!highRecords.length) {
    return `No high-severity outbreaks are currently present in the loaded dataset.\n\n${GROUNDED_BANNER}`;
  }

  const bullets = highRecords.map(formatHighRiskLine).join('\n');

  return `Current high-risk regions include:

${bullets}

These outbreaks are classified as high severity and warrant increased monitoring and preventive action.

${GROUNDED_BANNER}`;
}

/**
 * Grounded fallback when AI is unreachable — concise, data-grounded answers.
 */
function fallbackResponse(userMessage, outbreaks = []) {
  const lower = userMessage.toLowerCase();
  const dataSummary = summarizeOutbreaks(outbreaks, { compact: outbreaks.length > 1 });

  if (isHighRiskQuery(userMessage)) {
    return formatHighRiskResponse(outbreaks);
  }

  if (isSummaryQuery(userMessage)) {
    return `${dataSummary}\n\n${GROUNDED_BANNER}`;
  }

  if (lower.includes('symptom') && lower.includes('dengue')) {
    return `**Dengue symptoms** (general medical knowledge):
- High fever, severe headache, pain behind eyes
- Joint and muscle pain, nausea, rash
- Warning signs: severe abdominal pain, persistent vomiting, bleeding

**From current data:**
${dataSummary}

${GROUNDED_BANNER}`;
  }

  if (lower.includes('prevent') && lower.includes('malaria')) {
    return `**Malaria prevention:**
- Use insecticide-treated bed nets
- Apply EPA-approved repellents; wear long sleeves at dusk
- Eliminate standing water near homes
- Seek prophylaxis when traveling to endemic areas

**Local context:**
${dataSummary}

${GROUNDED_BANNER}`;
  }

  if (outbreaks.length) {
    return `**Answer (from outbreak data):**

${dataSummary}

**General guidance:** Follow WHO and local health department advisories. Vaccinate where available, practice hand hygiene, and report symptoms early.

${GROUNDED_BANNER}`;
  }

  return `No outbreak records in the database. Run \`npm run seed\` after starting MongoDB.

**General guidance:** Follow WHO and local health department advisories.

${GROUNDED_BANNER}`;
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
      if (text) return { text, provider: 'google', fallback: false };
    } else {
      const text = await callOllama(prompt, config);
      if (text) return { text, provider: 'ollama', fallback: false };
    }
  } catch (err) {
    console.warn('Gemma call failed, using fallback:', err.message);
  }

  return {
    text: fallbackResponse(userMessage, outbreaks),
    provider: 'fallback',
    fallback: true,
  };
}
