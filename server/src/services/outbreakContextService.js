import { outbreakRepo } from './outbreakRepository.js';

const RECENT_FALLBACK_LIMIT = 10;

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

  const all = await outbreakRepo.find({}, { reportedAt: -1 });

  if (!query?.trim()) {
    return all.slice(0, limit);
  }

  const matches = rankOutbreaksByRelevance(all, query.trim());
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
