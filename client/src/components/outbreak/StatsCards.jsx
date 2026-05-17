import { Activity, AlertTriangle, BarChart3, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useOutbreaks } from '@/context/OutbreakContext';

const icons = [Activity, BarChart3, MapPin, AlertTriangle];

export function StatsCards() {
  const { stats, loading } = useOutbreaks();

  const items = [
    { title: 'Total Outbreaks', value: stats?.totalOutbreaks ?? '—', icon: Activity },
    { title: 'Total Cases', value: stats?.totalCases?.toLocaleString() ?? '—', icon: BarChart3 },
    { title: 'High-Risk Regions', value: stats?.highRiskRegions ?? '—', icon: MapPin },
    { title: 'Most Common Disease', value: stats?.mostCommonDisease ?? '—', icon: AlertTriangle },
  ];

  if (loading) {
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
