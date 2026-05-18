import { getGeographicRegion } from './regions';

export function hasActiveFilters(filters) {
  return Boolean(filters.search || filters.disease || filters.severity || filters.location);
}

function matchesSearch(outbreak, search) {
  const q = search.toLowerCase();
  const fields = [outbreak.disease, outbreak.location, outbreak.severity, outbreak.description]
    .filter(Boolean)
    .map((v) => String(v).toLowerCase());
  return fields.some((f) => f.includes(q));
}

/**
 * Client-side filter: search, disease, severity, geographic region.
 */
export function filterOutbreaks(outbreaks, filters) {
  if (!outbreaks?.length) return [];
  if (!hasActiveFilters(filters)) return outbreaks;

  const search = filters.search?.trim();
  const disease = filters.disease?.trim().toLowerCase();
  const severity = filters.severity?.trim().toLowerCase();
  const region = filters.location?.trim();

  return outbreaks.filter((o) => {
    if (disease && o.disease?.toLowerCase() !== disease) return false;
    if (severity && o.severity?.toLowerCase() !== severity) return false;
    if (region && getGeographicRegion(o) !== region) return false;
    if (search && !matchesSearch(o, search)) return false;
    return true;
  });
}

export function computeStatsFromOutbreaks(outbreaks) {
  if (!outbreaks?.length) {
    return {
      totalOutbreaks: 0,
      totalCases: 0,
      highSeverityCount: 0,
      highRiskRegions: 0,
      mostCommonDisease: 'N/A',
      byDisease: [],
      timeline: [],
      severityDist: { low: 0, medium: 0, high: 0 },
    };
  }

  const totalCases = outbreaks.reduce((s, o) => s + (o.cases || 0), 0);
  const highSeverity = outbreaks.filter((o) => o.severity === 'high');
  const highRiskLocations = [...new Set(highSeverity.map((o) => o.location))];

  const diseaseCounts = {};
  outbreaks.forEach((o) => {
    diseaseCounts[o.disease] = (diseaseCounts[o.disease] || 0) + o.cases;
  });

  const mostCommon = Object.entries(diseaseCounts).sort((a, b) => b[1] - a[1])[0];
  const byDisease = Object.entries(diseaseCounts).map(([disease, cases]) => ({ disease, cases }));

  const byTime = {};
  outbreaks.forEach((o) => {
    const key = new Date(o.reportedAt).toISOString().slice(0, 7);
    byTime[key] = (byTime[key] || 0) + o.cases;
  });
  const timeline = Object.entries(byTime)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, cases]) => ({ month, cases }));

  const severityDist = { low: 0, medium: 0, high: 0 };
  outbreaks.forEach((o) => {
    if (severityDist[o.severity] !== undefined) severityDist[o.severity] += 1;
  });

  return {
    totalOutbreaks: outbreaks.length,
    totalCases,
    highSeverityCount: highSeverity.length,
    highRiskRegions: highRiskLocations.length,
    mostCommonDisease: mostCommon ? mostCommon[0] : 'N/A',
    byDisease,
    timeline,
    severityDist,
  };
}
