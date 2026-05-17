import { AlertCircle } from 'lucide-react';

export function ErrorAlert({ message }) {
  if (!message) return null;
  return (
    <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200">
      <AlertCircle className="h-4 w-4 shrink-0" />
      {message}
    </div>
  );
}
