import { useCallback } from 'react';
import { useOutbreaks } from '@/context/OutbreakContext';

const ALL = 'all';

/**
 * Filter state helpers for search + dropdown constraints.
 */
export function useOutbreakFilters() {
  const { filters, setFilters, resetFilters, filterOptions, hasActiveFilters } = useOutbreaks();

  const setSearch = useCallback(
    (search) => setFilters((f) => ({ ...f, search })),
    [setFilters]
  );

  const setDisease = useCallback(
    (value) => setFilters((f) => ({ ...f, disease: value === ALL ? '' : value })),
    [setFilters]
  );

  const setSeverity = useCallback(
    (value) => setFilters((f) => ({ ...f, severity: value === ALL ? '' : value })),
    [setFilters]
  );

  const setRegion = useCallback(
    (value) => setFilters((f) => ({ ...f, location: value === ALL ? '' : value })),
    [setFilters]
  );

  return {
    filters,
    filterOptions,
    setSearch,
    setDisease,
    setSeverity,
    setRegion,
    resetFilters,
    hasActiveFilters,
    selectValues: {
      disease: filters.disease || ALL,
      severity: filters.severity || ALL,
      region: filters.location || ALL,
    },
  };
}
