import { FilterBar } from '@/components/outbreak/FilterBar';
import { RecommendationCard } from '@/components/outbreak/RecommendationCard';
import { EmptyState } from '@/components/common/EmptyState';
import { useOutbreaks } from '@/context/OutbreakContext';

export function RecommendationsPage() {
  const { outbreaks, loading } = useOutbreaks();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Prevention Recommendations</h1>
        <p className="text-muted-foreground">
          AI-generated symptoms, prevention measures, and risk assessment per outbreak
        </p>
      </div>
      <FilterBar showDate={false} />
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading outbreaks…</p>
      ) : !outbreaks.length ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {outbreaks.map((o) => (
            <RecommendationCard key={o._id} outbreak={o} />
          ))}
        </div>
      )}
    </div>
  );
}
