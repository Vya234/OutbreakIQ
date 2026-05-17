import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { outbreakApi } from '@/services/api';
import { useOutbreakFilterOptions } from '@/hooks/useOutbreakFilterOptions';

const OutbreakContext = createContext(null);

const defaultFilters = {
  search: '',
  disease: '',
  severity: '',
  location: '',
  from: '',
  to: '',
};

export function OutbreakProvider({ children }) {
  const [outbreaks, setOutbreaks] = useState([]);
  const [catalogOutbreaks, setCatalogOutbreaks] = useState([]);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState(defaultFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const filterOptions = useOutbreakFilterOptions(catalogOutbreaks);

  const queryParams = useMemo(() => {
    const p = {};
    if (filters.search) p.search = filters.search;
    if (filters.disease) p.disease = filters.disease;
    if (filters.severity) p.severity = filters.severity;
    if (filters.location) p.location = filters.location;
    if (filters.from) p.from = filters.from;
    if (filters.to) p.to = filters.to;
    return p;
  }, [filters]);

  const fetchOutbreaks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [listRes, statsRes] = await Promise.all([
        outbreakApi.list(queryParams),
        outbreakApi.stats(),
      ]);
      setOutbreaks(listRes.data || []);
      setStats(statsRes.data || null);
    } catch (err) {
      setError(err.message);
      setOutbreaks([]);
    } finally {
      setLoading(false);
    }
  }, [queryParams]);

  useEffect(() => {
    fetchOutbreaks();
  }, [fetchOutbreaks]);

  useEffect(() => {
    let cancelled = false;
    outbreakApi
      .list()
      .then((res) => {
        if (!cancelled) setCatalogOutbreaks(res.data || []);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const value = {
    outbreaks,
    stats,
    filters,
    filterOptions,
    setFilters,
    resetFilters: () => setFilters(defaultFilters),
    loading,
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
