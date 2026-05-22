'use client';

import { cn } from '@/lib/utils';

export type LeadStatus = 'Untouched' | 'Called' | 'Follow-up' | 'Meeting Booked' | 'Not Interested' | 'Dead';

const statusConfig: Record<LeadStatus, { label: string; className: string }> = {
  Untouched: { label: 'Untouched', className: 'bg-slate-700 text-slate-300' },
  Called: { label: 'Called', className: 'bg-blue-900 text-blue-300' },
  'Follow-up': { label: 'Follow-up', className: 'bg-amber-900 text-amber-300' },
  'Meeting Booked': { label: 'Meeting Booked', className: 'bg-green-900 text-green-300' },
  'Not Interested': { label: 'Not Interested', className: 'bg-red-900 text-red-300' },
  Dead: { label: 'Dead', className: 'bg-zinc-800 text-zinc-500' },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status as LeadStatus] ?? { label: status, className: 'bg-slate-700 text-slate-300' };
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium', config.className)}>
      {config.label}
    </span>
  );
}
