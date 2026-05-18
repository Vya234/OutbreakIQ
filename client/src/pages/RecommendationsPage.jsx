import { Loader2 } from 'lucide-react';
import { FilterBar } from '@/components/outbreak/FilterBar';
import { RecommendationCard } from '@/components/outbreak/RecommendationCard';
import { EmptyState } from '@/components/common/EmptyState';
import { useOutbreaks } from '@/context/OutbreakContext';

export function RecommendationsPage() {
  const { filteredOutbreaks, loading, filtering, hasActiveFilters } = useOutbreaks();
  const isBusy = loading || filtering;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Prevention Recommendations</h1>
        <p className="text-muted-foreground">
          AI-generated symptoms, prevention measures, and risk assessment per outbreak
        </p>
      </div>
      <FilterBar />
      {isBusy ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading outbreaks…
        </div>
      ) : !filteredOutbreaks.length ? (
        <EmptyState
          message={
            hasActiveFilters
              ? 'No outbreak records match the selected filters.'
              : 'No outbreak records available.'
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredOutbreaks.map((o) => (
            <RecommendationCard key={o._id} outbreak={o} />
          ))}
        </div>
      )}
    </div>
  );
}
