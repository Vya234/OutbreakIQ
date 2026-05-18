import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { useOutbreaks } from '@/context/OutbreakContext';
import { formatDate, severityLabel } from '@/lib/utils';
import { getGeographicRegion } from '@/lib/regions';

export function OutbreakRecordsTable() {
  const { filteredOutbreaks, loading, filtering, hasActiveFilters } = useOutbreaks();
  const isBusy = loading || filtering;

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>Outbreak Records</CardTitle>
      </CardHeader>
      <CardContent>
        {isBusy ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : !filteredOutbreaks.length ? (
          <EmptyState
            title="No records"
            message={
              hasActiveFilters
                ? 'No outbreak records match the selected filters.'
                : 'No outbreak records available.'
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 pr-4">Disease</th>
                  <th className="pb-2 pr-4">Location</th>
                  <th className="pb-2 pr-4">Region</th>
                  <th className="pb-2 pr-4">Cases</th>
                  <th className="pb-2 pr-4">Severity</th>
                  <th className="pb-2">Reported</th>
                </tr>
              </thead>
              <tbody>
                {filteredOutbreaks.map((o) => (
                  <tr key={o._id} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-medium">{o.disease}</td>
                    <td className="py-3 pr-4">{o.location}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{getGeographicRegion(o)}</td>
                    <td className="py-3 pr-4">{o.cases.toLocaleString()}</td>
                    <td className="py-3 pr-4">
                      <Badge variant={o.severity}>{severityLabel(o.severity)}</Badge>
                    </td>
                    <td className="py-3">{formatDate(o.reportedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
