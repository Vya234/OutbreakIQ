import { Inbox } from 'lucide-react';

export function EmptyState({ title = 'No data', message = 'Try adjusting your filters.' }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/30 py-16 text-center animate-fade-in">
      <Inbox className="mb-3 h-10 w-10 text-muted-foreground" />
      <h3 className="font-medium">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
