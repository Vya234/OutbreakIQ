import { useMemo } from 'react';

/**
 * Derive unique disease and region options from the outbreak catalog.
 */
export function useOutbreakFilterOptions(outbreaks = []) {
  return useMemo(() => {
    const diseases = new Set();
    const regions = new Set();

    for (const o of outbreaks) {
      if (o.disease) diseases.add(o.disease);
      if (o.location) regions.add(o.location);
    }

    return {
      diseases: [...diseases].sort((a, b) => a.localeCompare(b)),
      regions: [...regions].sort((a, b) => a.localeCompare(b)),
    };
  }, [outbreaks]);
}
