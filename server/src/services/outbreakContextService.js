import { outbreakRepo } from './outbreakRepository.js';

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
 * Pick relevant outbreaks for a user query (keyword + severity aware).
 */
export async function getRelevantOutbreaks(query, outbreakId, limit = 12) {
  if (outbreakId) {
    const one = await outbreakRepo.findById(outbreakId);
    return one ? [one] : [];
  }

  const filter = {};
  if (query?.trim()) {
    const q = query.trim();
    filter.$or = [
      { disease: new RegExp(q, 'i') },
      { location: new RegExp(q, 'i') },
      { description: new RegExp(q, 'i') },
    ];
  }

  let results = await outbreakRepo.find(filter, { reportedAt: -1 }, limit);

  if (!results.length) {
    results = await outbreakRepo.find({}, { severity: -1, cases: -1 }, limit);
  }

  return results;
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
