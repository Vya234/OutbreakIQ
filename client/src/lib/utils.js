import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(date) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export const SEVERITY_COLORS = {
  low: '#22c55e',
  medium: '#eab308',
  high: '#ef4444',
};

export function severityLabel(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}
