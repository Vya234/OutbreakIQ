/**
 * Gemma 4 integration via Ollama (local) or Google AI Studio.
 * Falls back to rule-based responses when the AI provider is unavailable.
 */

const SYSTEM_INSTRUCTION = `You are OutbreakIQ, a public health AI assistant powered by Gemma.
Answer using ONLY the outbreak data provided in context when discussing specific outbreaks.
Be accurate, concise, and practical. Include prevention steps when relevant.
If data is missing or uncertain, say so clearly — do not invent case numbers or locations.
Use bullet points for lists. Keep responses under 400 words unless asked for detail.`;

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

const OFFLINE_BANNER = '**Offline mode** — Using outbreak records from the database. Start Ollama or configure Google AI for full Gemma responses.';

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

function summarizeOutbreaks(outbreaks) {
  if (!outbreaks?.length) {
    return 'No matching outbreak records found. Run `npm run seed` after starting MongoDB.';
  }
  if (outbreaks.length === 1) return formatOutbreakSummary(outbreaks[0]);
  return outbreaks.map(formatOutbreakSummary).join('\n\n');
}

function isSummaryQuery(message) {
  return /\b(summarize|summary|overview|brief|status of|tell me about|describe)\b/i.test(message);
}

/**
 * Offline fallback when AI is unreachable — concise, data-grounded answers.
 */
function fallbackResponse(userMessage, outbreaks = []) {
  const lower = userMessage.toLowerCase();
  const dataSummary = summarizeOutbreaks(outbreaks);

  if (isSummaryQuery(userMessage)) {
    return `${dataSummary}\n\n${OFFLINE_BANNER}`;
  }

  if (lower.includes('symptom') && lower.includes('dengue')) {
    return `**Dengue symptoms** (general medical knowledge):
- High fever, severe headache, pain behind eyes
- Joint and muscle pain, nausea, rash
- Warning signs: severe abdominal pain, persistent vomiting, bleeding

**From current data:**
${dataSummary}

${OFFLINE_BANNER}`;
  }

  if (lower.includes('high risk') || lower.includes('high-risk')) {
    const highRecords = outbreaks.filter((o) => o.severity === 'high');
    const highSummary = highRecords.length
      ? summarizeOutbreaks(highRecords)
      : 'No high-severity outbreaks in the matched records.';

    return `**High-risk assessment (from loaded data):**
${highSummary}

${highRecords.length ? `${highRecords.length} high-severity outbreak record(s) in context.` : 'Review the map for red (high severity) markers.'}

${OFFLINE_BANNER}`;
  }

  if (lower.includes('prevent') && lower.includes('malaria')) {
    return `**Malaria prevention:**
- Use insecticide-treated bed nets
- Apply EPA-approved repellents; wear long sleeves at dusk
- Eliminate standing water near homes
- Seek prophylaxis when traveling to endemic areas

**Local context:**
${dataSummary}

${OFFLINE_BANNER}`;
  }

  if (outbreaks.length) {
    return `**Answer (from outbreak data):**

${dataSummary}

**General guidance:** Follow WHO and local health department advisories. Vaccinate where available, practice hand hygiene, and report symptoms early.

${OFFLINE_BANNER}`;
  }

  return `No outbreak records in the database. Run \`npm run seed\` after starting MongoDB.

**General guidance:** Follow WHO and local health department advisories.

${OFFLINE_BANNER}`;
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
