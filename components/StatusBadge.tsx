'use client';

import { cn } from '@/lib/utils';

export type LeadStatus = 'Untouched' | 'Called' | 'Follow-up' | 'Meeting Booked' | 'Not Interested' | 'Dead';

const statusConfig: Record<LeadStatus, { label: string; dot: string; className: string }> = {
  Untouched:        { label: 'Untouched',       dot: 'bg-slate-400',    className: 'bg-white/50 text-slate-500 border-white/60' },
  Called:           { label: 'Called',           dot: 'bg-[#3462EE]',   className: 'bg-blue-50/60 text-[#3462EE] border-blue-100/80' },
  'Follow-up':      { label: 'Follow-up',        dot: 'bg-amber-400',   className: 'bg-amber-50/60 text-amber-700 border-amber-100/80' },
  'Meeting Booked': { label: 'Meeting Booked',   dot: 'bg-emerald-500', className: 'bg-emerald-50/60 text-emerald-700 border-emerald-100/80' },
  'Not Interested': { label: 'Not Interested',   dot: 'bg-rose-400',    className: 'bg-rose-50/60 text-rose-600 border-rose-100/80' },
  Dead:             { label: 'Dead',             dot: 'bg-slate-300',   className: 'bg-white/30 text-slate-400 border-white/40' },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status as LeadStatus] ?? { label: status, dot: 'bg-slate-400', className: 'bg-white/50 text-slate-500 border-white/60' };
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border backdrop-blur-sm', config.className)}>
      <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', config.dot)} />
      {config.label}
    </span>
  );
}
