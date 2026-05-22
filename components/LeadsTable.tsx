'use client';

import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Link2 } from 'lucide-react';
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

export function LeadsTable({ leads, onSelectLead, selectedId }: LeadsTableProps) {
  const sorted = [...leads].sort((a, b) => {
    const ai = STATUS_ORDER.indexOf(a.status);
    const bi = STATUS_ORDER.indexOf(b.status);
    if (ai !== bi) return ai - bi;
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-500">
        <p className="text-lg font-medium">No leads yet</p>
        <p className="text-sm mt-1">Run a scrape to pull qualified leads from LinkedIn</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700 text-left">
            <th className="pb-3 pr-4 text-slate-400 font-medium">Name</th>
            <th className="pb-3 pr-4 text-slate-400 font-medium">Title</th>
            <th className="pb-3 pr-4 text-slate-400 font-medium">Company</th>
            <th className="pb-3 pr-4 text-slate-400 font-medium">Industry</th>
            <th className="pb-3 pr-4 text-slate-400 font-medium">Status</th>
            <th className="pb-3 pr-4 text-slate-400 font-medium">Updated</th>
            <th className="pb-3 text-slate-400 font-medium">Notes</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((lead, i) => (
            <tr
              key={lead.id}
              onClick={() => onSelectLead(lead.id)}
              className={`border-b border-slate-800 cursor-pointer transition-colors ${
                lead.id === selectedId
                  ? 'bg-blue-950/40'
                  : i % 2 === 0
                  ? 'bg-transparent hover:bg-slate-800/50'
                  : 'bg-slate-800/20 hover:bg-slate-800/50'
              }`}
            >
              <td className="py-3 pr-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-100">{lead.full_name ?? '—'}</span>
                  {lead.linkedin_url && (
                    <a
                      href={lead.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <Link2 size={13} />
                    </a>
                  )}
                </div>
              </td>
              <td className="py-3 pr-4 text-slate-400 max-w-[160px] truncate">{lead.title ?? '—'}</td>
              <td className="py-3 pr-4 text-slate-300 max-w-[140px] truncate">{lead.company ?? '—'}</td>
              <td className="py-3 pr-4 text-slate-400 max-w-[120px] truncate">{lead.industry ?? '—'}</td>
              <td className="py-3 pr-4">
                <StatusBadge status={lead.status} />
              </td>
              <td className="py-3 pr-4 text-slate-500 text-xs whitespace-nowrap">
                {formatDistanceToNow(new Date(lead.updated_at), { addSuffix: true })}
              </td>
              <td className="py-3">
                {(lead.lead_notes?.[0]?.count ?? 0) > 0 && (
                  <div className="flex items-center gap-1 text-slate-400">
                    <MessageSquare size={13} />
                    <span className="text-xs">{lead.lead_notes[0].count}</span>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
