import { FilterBar } from '@/components/outbreak/FilterBar';
import { OutbreakMap } from '@/components/outbreak/OutbreakMap';
import { ErrorAlert } from '@/components/common/ErrorAlert';
import { useOutbreaks } from '@/context/OutbreakContext';

export function MapPage() {
  const { error } = useOutbreaks();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Interactive Disease Map</h1>
        <p className="text-muted-foreground">
          Green = low · Yellow = medium · Red = high severity
        </p>
      </div>
      <ErrorAlert message={error} />
      <FilterBar />
      <OutbreakMap height="min(70vh, 600px)" />
    </div>
  );
}
