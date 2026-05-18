import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { outbreakApi } from '@/services/api';
import { useOutbreakFilterOptions } from '@/hooks/useOutbreakFilterOptions';
import { filterOutbreaks, computeStatsFromOutbreaks, hasActiveFilters } from '@/lib/outbreakFilters';

const OutbreakContext = createContext(null);

const defaultFilters = {
  search: '',
  disease: '',
  severity: '',
  location: '',
  from: '',
  to: '',
};

const SEARCH_DEBOUNCE_MS = 300;

export function OutbreakProvider({ children }) {
  const [outbreaks, setOutbreaks] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [filtering, setFiltering] = useState(false);
  const [error, setError] = useState(null);

  const filterOptions = useOutbreakFilterOptions(outbreaks);

  useEffect(() => {
    if (filters.search === debouncedSearch) {
      setFiltering(false);
      return;
    }
    setFiltering(true);
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search);
      setFiltering(false);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [filters.search, debouncedSearch]);

  const effectiveFilters = useMemo(
    () => ({ ...filters, search: debouncedSearch }),
    [filters, debouncedSearch]
  );

  const filteredOutbreaks = useMemo(
    () => filterOutbreaks(outbreaks, effectiveFilters),
    [outbreaks, effectiveFilters]
  );

  const filteredStats = useMemo(
    () => computeStatsFromOutbreaks(filteredOutbreaks),
    [filteredOutbreaks]
  );

  const fetchOutbreaks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const listRes = await outbreakApi.list();
      setOutbreaks(listRes.data || []);
    } catch (err) {
      setError(err.message);
      setOutbreaks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOutbreaks();
  }, [fetchOutbreaks]);

  const value = {
    outbreaks,
    filteredOutbreaks,
    filteredStats,
    filters,
    effectiveFilters,
    filterOptions,
    setFilters,
    resetFilters: () => {
      setFilters(defaultFilters);
      setDebouncedSearch('');
    },
    hasActiveFilters: hasActiveFilters(filters),
    loading,
    filtering,
    error,
    refresh: fetchOutbreaks,
  };

  return <OutbreakContext.Provider value={value}>{children}</OutbreakContext.Provider>;
}

export function useOutbreaks() {
  const ctx = useContext(OutbreakContext);
  if (!ctx) throw new Error('useOutbreaks must be used within OutbreakProvider');
  return ctx;
}
