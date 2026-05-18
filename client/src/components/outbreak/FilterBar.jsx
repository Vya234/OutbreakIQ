import { Search, RotateCcw, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOutbreakFilters } from '@/hooks/useOutbreakFilters';
import { useOutbreaks } from '@/context/OutbreakContext';

const SEVERITY_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

export function FilterBar() {
  const { outbreaks, filteredOutbreaks, loading, filtering } = useOutbreaks();
  const {
    filterOptions,
    setSearch,
    setDisease,
    setSeverity,
    setRegion,
    resetFilters,
    hasActiveFilters,
    selectValues,
    filters,
  } = useOutbreakFilters();

  const total = outbreaks.length;
  const shown = filteredOutbreaks.length;
  const isBusy = loading || filtering;

  return (
    <section className="space-y-3 rounded-xl border bg-card p-4 shadow-sm animate-fade-in">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <label className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="outbreak-search"
            type="search"
            placeholder="Search outbreaks..."
            value={filters.search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-background pl-9"
            aria-label="Search outbreaks by disease, location, severity, or description"
          />
        </label>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:flex lg:shrink-0 lg:gap-2">
          <Select value={selectValues.disease} onValueChange={setDisease}>
            <SelectTrigger className="w-full bg-background lg:w-[160px]" aria-label="Filter by disease">
              <SelectValue placeholder="Disease" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All diseases</SelectItem>
              {filterOptions.diseases.map((disease) => (
                <SelectItem key={disease} value={disease}>
                  {disease}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectValues.severity} onValueChange={setSeverity}>
            <SelectTrigger className="w-full bg-background lg:w-[140px]" aria-label="Filter by severity">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              {SEVERITY_OPTIONS.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectValues.region} onValueChange={setRegion}>
            <SelectTrigger
              className="w-full bg-background lg:min-w-[200px] lg:max-w-[280px]"
              aria-label="Filter by geographic region"
            >
              <SelectValue placeholder="Region" />
            </SelectTrigger>
            <SelectContent className="min-w-[var(--radix-select-trigger-width)] max-w-[min(100vw-2rem,320px)]">
              <SelectItem value="all">All regions</SelectItem>
              {filterOptions.regions.map((region) => (
                <SelectItem key={region} value={region} className="[&_span:last-child]:whitespace-normal">
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={resetFilters}
          disabled={!hasActiveFilters}
          className="w-full shrink-0 lg:w-auto"
        >
          <RotateCcw className="h-4 w-4" />
          Reset Filters
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
        <p aria-live="polite" className="flex items-center gap-2">
          {isBusy && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
          Showing {shown} of {total} outbreaks
        </p>
        {hasActiveFilters && !isBusy && shown === 0 && (
          <p className="text-health-high" role="status">
            No outbreak records match the selected filters.
          </p>
        )}
      </div>
    </section>
  );
}
