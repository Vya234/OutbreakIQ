import { outbreakRepo } from './outbreakRepository.js';

const RECENT_FALLBACK_LIMIT = 10;
const HIGH_RISK_LIMIT = 7;

const HIGH_RISK_QUERY_PATTERNS = [
  'high risk',
  'high-risk',
  'risk regions',
  'dangerous areas',
  'most affected regions',
  'critical outbreak zones',
];

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'been', 'being', 'but', 'by',
  'can', 'could', 'did', 'do', 'does', 'for', 'from', 'had', 'has', 'have',
  'how', 'i', 'in', 'into', 'is', 'it', 'its', 'me', 'my', 'of', 'on', 'or',
  'our', 'out', 'please', 'should', 'so', 'summarize', 'summary', 'tell',
  'that', 'the', 'their', 'them', 'there', 'these', 'they', 'this', 'those',
  'to', 'us', 'was', 'we', 'were', 'what', 'when', 'where', 'which', 'who',
  'why', 'will', 'with', 'would', 'you', 'your', 'about', 'brief', 'current',
  'give', 'latest', 'outbreak', 'outbreaks', 'overview', 'situation', 'status',
  'update',
]);

/**
 * Extract meaningful search terms from a natural-language query.
 */
export function extractSearchTerms(query) {
  return query
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .map((w) => w.replace(/^-+|-+$/g, ''))
    .filter((w) => w.length >= 2 && !STOP_WORDS.has(w));
}

/**
 * Score one outbreak against query terms (case-insensitive).
 * Higher score = disease+location match prioritized.
 */
export function scoreOutbreak(outbreak, query, terms) {
  const q = query.toLowerCase();
  const disease = outbreak.disease.toLowerCase();
  const location = outbreak.location.toLowerCase();
  const description = (outbreak.description || '').toLowerCase();

  let diseaseMatch = q.includes(disease);
  let locationMatch = false;
  let descriptionMatch = false;

  for (const term of terms) {
    if (disease.includes(term) || term.includes(disease)) diseaseMatch = true;
    if (location.includes(term)) locationMatch = true;
    if (description.includes(term)) descriptionMatch = true;
  }

  // Match location segments (e.g. "Kerala" from "Kerala, India")
  if (!locationMatch) {
    for (const part of location.split(/[,/]/)) {
      const segment = part.trim();
      if (segment && (q.includes(segment) || terms.some((t) => segment.includes(t) || t.includes(segment)))) {
        locationMatch = true;
        break;
      }
    }
  }

  if (!diseaseMatch && !locationMatch && !descriptionMatch) {
    return 0;
  }

  if (diseaseMatch && locationMatch) return 4;
  if (diseaseMatch) return 3;
  if (locationMatch) return 2;
  return 1;
}

/**
 * Rank outbreaks by relevance, then recency.
 * When disease and location both match for some records, return only those.
 */
export function rankOutbreaksByRelevance(outbreaks, query) {
  const terms = extractSearchTerms(query);

  const ranked = outbreaks
    .map((outbreak) => ({
      outbreak,
      score: scoreOutbreak(outbreak, query, terms),
    }))
    .filter((row) => row.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return new Date(b.outbreak.reportedAt) - new Date(a.outbreak.reportedAt);
    });

  const topScore = ranked[0]?.score ?? 0;
  const bestTier = ranked.filter((row) => row.score === topScore);

  return bestTier.map((row) => row.outbreak);
}

/**
 * Detect high-risk region / severity queries.
 */
export function isHighRiskQuery(query = '') {
  const q = query.toLowerCase();
  return HIGH_RISK_QUERY_PATTERNS.some((pattern) => q.includes(pattern));
}

/**
 * All high-severity outbreaks, sorted by cases (desc), capped for context.
 */
export async function getHighRiskOutbreaks(limit = HIGH_RISK_LIMIT) {
  const all = await outbreakRepo.find({}, { reportedAt: -1 });

  return all
    .filter((o) => String(o.severity).toLowerCase() === 'high')
    .sort((a, b) => Number(b.cases) - Number(a.cases))
    .slice(0, limit);
}

/**
 * Serialize outbreaks into compact text for LLM context windows.
 */
export function formatOutbreaksForAI(outbreaks) {
  if (!outbreaks?.length) return '';

  return outbreaks
    .map((o) => {
      const date = new Date(o.reportedAt).toISOString().split('T')[0];
      const sev = o.severity.toUpperCase();
      return `[${sev}] ${o.disease} @ ${o.location} | Cases: ${o.cases} | Reported: ${date} | ${o.description || 'No description'}`;
    })
    .join('\n');
}

/**
 * Pick relevant outbreaks for a user query.
 * Matches disease, location, and description (case-insensitive).
 * Prioritizes disease + location matches; falls back to 10 most recent.
 */
export async function getRelevantOutbreaks(query, outbreakId, limit = RECENT_FALLBACK_LIMIT) {
  if (outbreakId) {
    const one = await outbreakRepo.findById(outbreakId);
    return one ? [one] : [];
  }

  const trimmed = query?.trim() || '';

  if (trimmed && isHighRiskQuery(trimmed)) {
    return getHighRiskOutbreaks(HIGH_RISK_LIMIT);
  }

  const all = await outbreakRepo.find({}, { reportedAt: -1 });

  if (!trimmed) {
    return all.slice(0, limit);
  }

  const matches = rankOutbreaksByRelevance(all, trimmed);
  if (matches.length) return matches;

  return all.slice(0, limit);
}

/**
 * Build query filters from API query params.
 */
export function buildOutbreakFilter(query) {
  const filter = {};

  if (query.disease) filter.disease = new RegExp(query.disease, 'i');
  if (query.severity) filter.severity = String(query.severity).toLowerCase();
  if (query.location || query.country || query.state) {
    const loc = query.location || query.country || query.state;
    filter.location = new RegExp(loc, 'i');
  }
  if (query.search) {
    filter.$or = [
      { disease: new RegExp(query.search, 'i') },
      { location: new RegExp(query.search, 'i') },
      { description: new RegExp(query.search, 'i') },
    ];
  }
  if (query.from || query.to) {
    filter.reportedAt = {};
    if (query.from) filter.reportedAt.$gte = new Date(query.from);
    if (query.to) filter.reportedAt.$lte = new Date(query.to);
  }

  return filter;
}
