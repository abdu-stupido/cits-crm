'use client';

import { cn } from '@/lib/utils';

export type LeadStatus = 'Untouched' | 'Called' | 'Follow-up' | 'Meeting Booked' | 'Not Interested' | 'Dead';

const statusConfig: Record<LeadStatus, { label: string; className: string }> = {
  Untouched:        { label: 'Untouched',       className: 'bg-[#F3F4F0] text-[#6B7280] border border-[#E2E4DE]' },
  Called:           { label: 'Called',           className: 'bg-[#EAF0F8] text-[#3462EE] border border-[#C7D8F8]' },
  'Follow-up':      { label: 'Follow-up',        className: 'bg-[#FEFCE8] text-[#927B00] border border-[#EFE347]/60' },
  'Meeting Booked': { label: 'Meeting Booked',   className: 'bg-[#E6F4F1] text-[#2A7A6B] border border-[#4A91A8]/40' },
  'Not Interested': { label: 'Not Interested',   className: 'bg-[#FEF2F2] text-[#DC2626] border border-red-200' },
  Dead:             { label: 'Dead',             className: 'bg-[#F9F9F9] text-[#9CA3AF] border border-[#E5E7EB]' },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status as LeadStatus] ?? { label: status, className: 'bg-[#F3F4F0] text-[#6B7280] border border-[#E2E4DE]' };
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', config.className)}>
      {config.label}
    </span>
  );
}
