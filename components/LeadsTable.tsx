'use client';

import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Link2, ChevronRight } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface Lead {
  id: string;
  full_name: string | null;
  title: string | null;
  company: string | null;
  industry: string | null;
  status: string;
  updated_at: string;
  linkedin_url: string | null;
  lead_notes: { count: number }[];
}

interface LeadsTableProps {
  leads: Lead[];
  onSelectLead: (id: string) => void;
  selectedId: string | null;
}

const STATUS_ORDER = ['Meeting Booked', 'Follow-up', 'Called', 'Untouched', 'Not Interested', 'Dead'];

function getInitials(name: string | null) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

const AVATAR_COLORS = [
  'bg-[#3462EE] text-white',
  'bg-[#4A91A8] text-white',
  'bg-[#121721] text-white',
  'bg-[#EFE347] text-[#121721]',
  'bg-[#6366F1] text-white',
  'bg-[#EC4899] text-white',
];

function getAvatarColor(name: string | null) {
  const idx = (name?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

export function LeadsTable({ leads, onSelectLead, selectedId }: LeadsTableProps) {
  const sorted = [...leads].sort((a, b) => {
    const ai = STATUS_ORDER.indexOf(a.status);
    const bi = STATUS_ORDER.indexOf(b.status);
    if (ai !== bi) return ai - bi;
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-[#9CA3AF]">
        <div className="w-16 h-16 rounded-2xl bg-white border border-[#E2E4DE] flex items-center justify-center mb-4 shadow-sm">
          <span className="text-2xl">👤</span>
        </div>
        <p className="text-base font-medium text-[#6B7280]">No leads yet</p>
        <p className="text-sm mt-1">Run a scrape to pull qualified leads from LinkedIn</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b border-[#E8EAE4]">
            <th className="pb-3 pr-4 text-[#9CA3AF] font-medium text-xs uppercase tracking-wide">Contact</th>
            <th className="pb-3 pr-4 text-[#9CA3AF] font-medium text-xs uppercase tracking-wide">Company</th>
            <th className="pb-3 pr-4 text-[#9CA3AF] font-medium text-xs uppercase tracking-wide">Industry</th>
            <th className="pb-3 pr-4 text-[#9CA3AF] font-medium text-xs uppercase tracking-wide">Status</th>
            <th className="pb-3 pr-4 text-[#9CA3AF] font-medium text-xs uppercase tracking-wide">Updated</th>
            <th className="pb-3 text-[#9CA3AF] font-medium text-xs uppercase tracking-wide"></th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((lead) => (
            <tr
              key={lead.id}
              onClick={() => onSelectLead(lead.id)}
              className={`border-b border-[#F0F1ED] cursor-pointer transition-all group ${
                lead.id === selectedId
                  ? 'bg-[#EBF0FD]'
                  : 'hover:bg-white hover:shadow-sm'
              }`}
            >
              <td className="py-3.5 pr-4">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${getAvatarColor(lead.full_name)}`}>
                    {getInitials(lead.full_name)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-[#121721]">{lead.full_name ?? '—'}</span>
                      {lead.linkedin_url && (
                        <a
                          href={lead.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-[#3462EE] hover:text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Link2 size={12} />
                        </a>
                      )}
                    </div>
                    <p className="text-xs text-[#9CA3AF] mt-0.5">{lead.title ?? ''}</p>
                  </div>
                </div>
              </td>
              <td className="py-3.5 pr-4 text-[#374151] max-w-[160px] truncate font-medium">{lead.company ?? '—'}</td>
              <td className="py-3.5 pr-4 text-[#6B7280] text-sm">{lead.industry ?? '—'}</td>
              <td className="py-3.5 pr-4">
                <StatusBadge status={lead.status} />
              </td>
              <td className="py-3.5 pr-4 text-[#9CA3AF] text-xs whitespace-nowrap">
                {formatDistanceToNow(new Date(lead.updated_at), { addSuffix: true })}
              </td>
              <td className="py-3.5">
                <div className="flex items-center gap-2 justify-end">
                  {(lead.lead_notes?.[0]?.count ?? 0) > 0 && (
                    <div className="flex items-center gap-1 text-[#9CA3AF]">
                      <MessageSquare size={12} />
                      <span className="text-xs">{lead.lead_notes[0].count}</span>
                    </div>
                  )}
                  <ChevronRight size={14} className="text-[#D1D5DB] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
