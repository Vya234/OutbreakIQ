import { Activity, AlertTriangle, BarChart3, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useOutbreaks } from '@/context/OutbreakContext';

export function StatsCards() {
  const { filteredStats, loading, filtering } = useOutbreaks();
  const isBusy = loading || filtering;

  const items = [
    { title: 'Total Outbreaks', value: filteredStats?.totalOutbreaks ?? '—', icon: Activity },
    { title: 'Total Cases', value: filteredStats?.totalCases?.toLocaleString() ?? '—', icon: BarChart3 },
    { title: 'High Severity', value: filteredStats?.highSeverityCount ?? '—', icon: ShieldAlert },
    { title: 'Most Common Disease', value: filteredStats?.mostCommonDisease ?? '—', icon: AlertTriangle },
  ];

  if (isBusy) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map(({ title, value, icon: Icon }) => (
        <Card key={title} className="animate-fade-in transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            <Icon className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
