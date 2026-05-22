'use client';

import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Link2, ArrowUpRight } from 'lucide-react';
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

const AVATAR_COLORS = [
  'bg-[#3462EE]', 'bg-[#0F1623]', 'bg-[#4A91A8]',
  'bg-violet-500', 'bg-rose-400', 'bg-amber-400',
];

function getInitials(name: string | null) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function getAvatarColor(name: string | null) {
  return AVATAR_COLORS[(name?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];
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
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="w-16 h-16 glass rounded-3xl flex items-center justify-center">
          <span className="text-2xl">👤</span>
        </div>
        <p className="text-sm font-medium text-slate-500">No leads yet</p>
        <p className="text-xs text-slate-400">Run a scrape to pull qualified leads from LinkedIn</p>
      </div>
    );
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-white/40 text-left">
          <th className="pb-3 pr-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Contact</th>
          <th className="pb-3 pr-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Company</th>
          <th className="pb-3 pr-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Industry</th>
          <th className="pb-3 pr-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
          <th className="pb-3 pr-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Updated</th>
          <th className="pb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider"></th>
        </tr>
      </thead>
      <tbody>
        {sorted.map((lead) => (
          <tr
            key={lead.id}
            onClick={() => onSelectLead(lead.id)}
            className={`border-b border-white/30 cursor-pointer transition-all duration-150 group ${
              lead.id === selectedId
                ? 'bg-blue-50/40'
                : 'hover:bg-white/30'
            }`}
          >
            <td className="py-3.5 pr-4">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full ${getAvatarColor(lead.full_name)} text-white flex items-center justify-center text-xs font-semibold flex-shrink-0`}>
                  {getInitials(lead.full_name)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-800">{lead.full_name ?? '—'}</span>
                    {lead.linkedin_url && (
                      <a href={lead.linkedin_url} target="_blank" rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-[#3462EE] opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link2 size={11} />
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 font-light mt-0.5">{lead.title ?? ''}</p>
                </div>
              </div>
            </td>
            <td className="py-3.5 pr-4 font-medium text-slate-700 max-w-[150px] truncate">{lead.company ?? '—'}</td>
            <td className="py-3.5 pr-4 text-slate-500 text-xs">{lead.industry ?? '—'}</td>
            <td className="py-3.5 pr-4"><StatusBadge status={lead.status} /></td>
            <td className="py-3.5 pr-4 text-slate-400 text-xs font-light whitespace-nowrap">
              {formatDistanceToNow(new Date(lead.updated_at), { addSuffix: true })}
            </td>
            <td className="py-3.5">
              <div className="flex items-center gap-2 justify-end">
                {(lead.lead_notes?.[0]?.count ?? 0) > 0 && (
                  <span className="flex items-center gap-1 text-slate-400">
                    <MessageSquare size={11} />
                    <span className="text-xs">{lead.lead_notes[0].count}</span>
                  </span>
                )}
                <ArrowUpRight size={13} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
