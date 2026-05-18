import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FilterBar } from '@/components/outbreak/FilterBar';
import { StatsCards } from '@/components/outbreak/StatsCards';
import { DashboardCharts } from '@/components/outbreak/DashboardCharts';
import { OutbreakRecordsTable } from '@/components/outbreak/OutbreakRecordsTable';
import { ErrorAlert } from '@/components/common/ErrorAlert';
import { useOutbreaks } from '@/context/OutbreakContext';
import { outbreakApi } from '@/services/api';

export function DashboardPage() {
  const { error, effectiveFilters } = useOutbreaks();

  const downloadPdf = async () => {
    const params = {};
    if (effectiveFilters.search) params.search = effectiveFilters.search;
    if (effectiveFilters.disease) params.disease = effectiveFilters.disease;
    if (effectiveFilters.severity) params.severity = effectiveFilters.severity;
    if (effectiveFilters.location) params.location = effectiveFilters.location;
    if (effectiveFilters.from) params.from = effectiveFilters.from;
    if (effectiveFilters.to) params.to = effectiveFilters.to;

    const res = await outbreakApi.downloadPdf(params);
    const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'outbreakiq-report.pdf';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Analytics</h1>
          <p className="text-muted-foreground">Outbreak trends, severity mix, and case volumes</p>
        </div>
        <Button variant="outline" onClick={downloadPdf}>
          <Download className="h-4 w-4" />
          Download PDF Report
        </Button>
      </div>
      <ErrorAlert message={error} />
      <FilterBar />
      <StatsCards />
      <DashboardCharts />
      <OutbreakRecordsTable />
    </div>
  );
}
