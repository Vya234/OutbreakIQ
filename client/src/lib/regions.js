/**
 * Map outbreak locations to geographic regions for filtering.
 */
const AFRICA_PATTERN =
  /congo|nigeria|kenya|south africa|ghana|ethiopia|uganda|tanzania|senegal|morocco|egypt/i;
const AMERICAS_PATTERN = /usa|united states|canada|mexico|brazil|colombia|argentina|peru|chile/i;
const EUROPE_PATTERN = /uk|united kingdom|germany|france|spain|italy|netherlands|belgium|sweden|poland|berlin|paris|london/i;
const MIDDLE_EAST_PATTERN = /saudi|uae|qatar|kuwait|oman|bahrain|israel|jordan|lebanon|riyadh|dubai/i;
const SE_ASIA_PATTERN = /thailand|bangladesh|vietnam|philippines|indonesia|malaysia|singapore|cambodia|myanmar|hanoi|dhaka|bangkok/i;
const EAST_ASIA_PATTERN = /japan|china|korea|taiwan|hong kong|tokyo|beijing|seoul/i;
const OCEANIA_PATTERN = /australia|new zealand|sydney|melbourne|cairns|fiji|papua/i;

export const GEOGRAPHIC_REGIONS = [
  'North India',
  'South India',
  'East India',
  'West & Central India',
  'Africa',
  'Americas',
  'Europe',
  'Middle East',
  'South & Southeast Asia',
  'East Asia',
  'Oceania',
];

function classifyIndia(lat, lng) {
  if (lat >= 23.5) return 'North India';
  if (lat <= 15) return 'South India';
  if (lng >= 82) return 'East India';
  return 'West & Central India';
}

export function getGeographicRegion(outbreak) {
  const loc = outbreak?.location || '';
  const lat = Number(outbreak?.latitude);
  const lng = Number(outbreak?.longitude);

  if (/india/i.test(loc) && Number.isFinite(lat) && Number.isFinite(lng)) {
    return classifyIndia(lat, lng);
  }
  if (AFRICA_PATTERN.test(loc)) return 'Africa';
  if (AMERICAS_PATTERN.test(loc)) return 'Americas';
  if (EUROPE_PATTERN.test(loc)) return 'Europe';
  if (MIDDLE_EAST_PATTERN.test(loc)) return 'Middle East';
  if (SE_ASIA_PATTERN.test(loc)) return 'South & Southeast Asia';
  if (EAST_ASIA_PATTERN.test(loc)) return 'East Asia';
  if (OCEANIA_PATTERN.test(loc)) return 'Oceania';
  if (/india/i.test(loc)) return 'West & Central India';

  const country = loc.split(',').pop()?.trim() || loc;
  return country || 'Other';
}
