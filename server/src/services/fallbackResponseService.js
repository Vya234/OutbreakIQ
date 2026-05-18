import { isHighRiskQuery } from './outbreakContextService.js';
import {
  displayDiseaseName,
  getDiseaseKnowledge,
  resolveDisease,
} from './diseaseKnowledge.js';

const SEVERITY_LABELS = { low: 'Low', medium: 'Medium', high: 'High' };

const SEVERITY_GUIDANCE = {
  low: 'Risk is classified as **Low**: continue routine surveillance and standard prevention practices.',
  medium:
    'Risk is classified as **Medium**: increase community awareness, reinforce prevention measures, and monitor case trends.',
  high: 'Risk is classified as **High**: prioritize public health response, follow local advisories, and limit exposure where possible.',
};

function formatReportedAt(value) {
  return new Date(value).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function capitalizeSeverity(severity) {
  return SEVERITY_LABELS[String(severity).toLowerCase()] || 'Unknown';
}

export function formatBriefContext(outbreaks) {
  if (!outbreaks?.length) {
    return 'No matching outbreak records are currently loaded.';
  }

  if (outbreaks.length === 1) {
    const o = outbreaks[0];
    const cases = Number(o.cases).toLocaleString('en-IN');
    return `**Outbreak context:** ${o.disease} in ${o.location} — ${cases} cases, **${capitalizeSeverity(o.severity)}** severity (reported ${formatReportedAt(o.reportedAt)}).`;
  }

  const totalCases = outbreaks.reduce((s, o) => s + Number(o.cases || 0), 0);
  return `**Outbreak context:** ${outbreaks.length} relevant records (${totalCases.toLocaleString('en-IN')} total cases) in the dataset.`;
}

function isSymptomQuery(message) {
  return /\bsymptom/i.test(message);
}

function isPreventionQuery(message) {
  return /\b(prevent|prevention|avoid|protect(?:ion)? against)\b/i.test(message);
}

function isRiskLevelQuery(message) {
  return /\b(risk level|how risky|severity level|what is the risk|danger level)\b/i.test(message);
}

function isSummaryQuery(message) {
  return /\b(summarize|summary|overview|brief|status of|tell me about|describe)\b/i.test(message);
}

function formatBulletList(items) {
  return items.map((item) => `- ${item}`).join('\n');
}

function formatSymptomResponse(diseaseKey, outbreaks) {
  const name = displayDiseaseName(diseaseKey, outbreaks);
  const knowledge = getDiseaseKnowledge(diseaseKey);

  if (knowledge) {
    return `**${name} — common symptoms**

${formatBulletList(knowledge.symptoms)}

**Warning signs**
${formatBulletList(knowledge.warnings)}

${formatBriefContext(outbreaks)}`;
  }

  return `**${name} — symptoms**

Specific symptom profiles vary by pathogen. Consult WHO or national health agency guidance for authoritative clinical criteria.

${formatBriefContext(outbreaks)}`;
}

function formatPreventionResponse(diseaseKey, outbreaks) {
  const name = displayDiseaseName(diseaseKey, outbreaks);
  const knowledge = getDiseaseKnowledge(diseaseKey);

  if (knowledge) {
    return `**${name} — prevention**

${formatBulletList(knowledge.prevention)}

${formatBriefContext(outbreaks)}`;
  }

  return `**${name} — prevention**

Follow local health department guidance: vaccination where available, hygiene, vector control, and early reporting of cases.

${formatBriefContext(outbreaks)}`;
}

function formatRiskLevelResponse(outbreaks) {
  if (!outbreaks.length) {
    return 'No outbreak records are available to assess risk level.';
  }

  if (outbreaks.length === 1) {
    const o = outbreaks[0];
    const level = capitalizeSeverity(o.severity);
    const guidance = SEVERITY_GUIDANCE[String(o.severity).toLowerCase()] || SEVERITY_GUIDANCE.medium;

    return `**Risk assessment — ${o.disease} (${o.location})**

Official severity rating: **${level}**.

${guidance}

${formatBriefContext(outbreaks)}`;
  }

  const lines = outbreaks.slice(0, 6).map((o) => {
    const cases = Number(o.cases).toLocaleString('en-IN');
    return `- **${o.location}** — ${o.disease}: **${capitalizeSeverity(o.severity)}** (${cases} cases)`;
  });
  const more = outbreaks.length > 6 ? `\n- …and ${outbreaks.length - 6} additional records` : '';

  return `**Risk levels in matching records**

${lines.join('\n')}${more}

Severity is recorded as **Low**, **Medium**, or **High** per outbreak. Prioritize **High** entries for immediate public health action.

${formatBriefContext(outbreaks)}`;
}

function formatHighRiskResponse(outbreaks) {
  const highRecords = [...outbreaks]
    .filter((o) => String(o.severity).toLowerCase() === 'high')
    .sort((a, b) => Number(b.cases) - Number(a.cases))
    .slice(0, 7);

  if (!highRecords.length) {
    return 'No **High** severity outbreaks are in the current dataset. Review **Medium** records for emerging concerns.';
  }

  const bullets = highRecords.map((o) => {
    const cases = Number(o.cases).toLocaleString('en-IN');
    return `- **${o.location}** — ${o.disease} (**High**, ${cases} cases)`;
  });

  return `**High-risk regions (High severity only)**

${bullets.join('\n')}

These outbreaks are rated **High** and warrant intensified monitoring and prevention.`;
}

function formatSummaryResponse(outbreaks) {
  if (!outbreaks.length) {
    return 'No matching outbreak records found.';
  }

  if (outbreaks.length === 1) {
    const o = outbreaks[0];
    return `**${o.disease} — ${o.location}**

- **Cases:** ${Number(o.cases).toLocaleString('en-IN')}
- **Severity:** ${capitalizeSeverity(o.severity)}
- **Reported:** ${formatReportedAt(o.reportedAt)}
- **Details:** ${o.description || 'No additional description.'}`;
  }

  const lines = outbreaks.slice(0, 7).map((o) => {
    const cases = Number(o.cases).toLocaleString('en-IN');
    return `- **${o.disease}** (${capitalizeSeverity(o.severity)}) — ${o.location}: ${cases} cases`;
  });
  const more = outbreaks.length > 7 ? `\n- …and ${outbreaks.length - 7} more records` : '';

  return `**Outbreak summary (${outbreaks.length} records)**

${lines.join('\n')}${more}`;
}

function formatGeneralResponse(outbreaks) {
  if (!outbreaks.length) {
    return 'No outbreak records are loaded. Seed the database or check your API connection.';
  }

  return `${formatBriefContext(outbreaks)}

**General guidance:** Follow WHO and local health department advisories, vaccinate where available, and report symptoms early.`;
}

/**
 * Build a concise grounded fallback answer (no UI banner text in body).
 */
export function buildFallbackResponse(userMessage, outbreaks = []) {
  const message = userMessage?.trim() || '';

  if (isHighRiskQuery(message)) {
    return formatHighRiskResponse(outbreaks);
  }

  if (isRiskLevelQuery(message)) {
    return formatRiskLevelResponse(outbreaks);
  }

  const diseaseKey = resolveDisease(message, outbreaks);

  if (isSymptomQuery(message)) {
    return formatSymptomResponse(diseaseKey || 'the disease in question', outbreaks);
  }

  if (isPreventionQuery(message)) {
    return formatPreventionResponse(diseaseKey || 'the disease in question', outbreaks);
  }

  if (isSummaryQuery(message)) {
    return formatSummaryResponse(outbreaks);
  }

  return formatGeneralResponse(outbreaks);
}

/**
 * Strip any legacy grounded banner text from model output.
 */
export function stripGroundedBanner(text) {
  if (!text) return text;
  return text
    .replace(/\*\*Grounded Response Mode\*\*[^\n]*/gi, '')
    .replace(/Grounded Response Mode\s*[—–-]\s*Generated using structured outbreak data\.?/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
