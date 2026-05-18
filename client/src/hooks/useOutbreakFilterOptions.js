import { useMemo } from 'react';
import { getGeographicRegion, GEOGRAPHIC_REGIONS } from '@/lib/regions';

/**
 * Derive unique disease and geographic region options from the outbreak catalog.
 */
export function useOutbreakFilterOptions(outbreaks = []) {
  return useMemo(() => {
    const diseases = new Set();
    const regions = new Set();

    for (const o of outbreaks) {
      if (o.disease) diseases.add(o.disease);
      const region = getGeographicRegion(o);
      if (region) regions.add(region);
    }

    const regionList = [...regions].sort((a, b) => {
      const ai = GEOGRAPHIC_REGIONS.indexOf(a);
      const bi = GEOGRAPHIC_REGIONS.indexOf(b);
      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;
      return a.localeCompare(b);
    });

    return {
      diseases: [...diseases].sort((a, b) => a.localeCompare(b)),
      regions: regionList,
    };
  }, [outbreaks]);
}
