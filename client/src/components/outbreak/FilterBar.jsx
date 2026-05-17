import { Search, RotateCcw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOutbreaks } from '@/context/OutbreakContext';

export function FilterBar({ showDate = true }) {
  const { filters, setFilters, resetFilters } = useOutbreaks();

  const update = (key, value) => setFilters((f) => ({ ...f, [key]: value }));

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm animate-fade-in">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Search className="h-4 w-4" />
        Filter & search outbreaks
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <div className="lg:col-span-2">
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            placeholder="Disease or location..."
            value={filters.search}
            onChange={(e) => update('search', e.target.value)}
          />
        </div>
        <div>
          <Label>Disease</Label>
          <Input
            placeholder="e.g. Dengue"
            value={filters.disease}
            onChange={(e) => update('disease', e.target.value)}
          />
        </div>
        <div>
          <Label>Severity</Label>
          <Select value={filters.severity || 'all'} onValueChange={(v) => update('severity', v === 'all' ? '' : v)}>
            <SelectTrigger>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Region</Label>
          <Input
            placeholder="State / city"
            value={filters.location}
            onChange={(e) => update('location', e.target.value)}
          />
        </div>
        {showDate && (
          <>
            <div>
              <Label htmlFor="from">From</Label>
              <Input id="from" type="date" value={filters.from} onChange={(e) => update('from', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="to">To</Label>
              <Input id="to" type="date" value={filters.to} onChange={(e) => update('to', e.target.value)} />
            </div>
          </>
        )}
      </div>
      <div className="mt-3 flex justify-end">
        <Button variant="outline" size="sm" onClick={resetFilters}>
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </div>
    </div>
  );
}
