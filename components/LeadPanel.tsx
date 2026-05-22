'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Link2, Globe, Calendar, ExternalLink, Phone, Mail } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { NotesList } from './NotesList';
import { CalendarModal } from './CalendarModal';
import type { LeadStatus } from './StatusBadge';

const STATUSES: LeadStatus[] = [
  'Untouched', 'Called', 'Follow-up', 'Meeting Booked', 'Not Interested', 'Dead',
];

const statusColors: Record<LeadStatus, string> = {
  Untouched: 'bg-[#F3F4F0] text-[#6B7280] border-[#E2E4DE] hover:bg-[#EAECEA]',
  Called: 'bg-[#EAF0F8] text-[#3462EE] border-[#C7D8F8] hover:bg-[#D8E8FA]',
  'Follow-up': 'bg-[#FEFCE8] text-[#927B00] border-[#EFE347]/60 hover:bg-[#FDF8C0]',
  'Meeting Booked': 'bg-[#E6F4F1] text-[#2A7A6B] border-[#4A91A8]/40 hover:bg-[#D0EDE8]',
  'Not Interested': 'bg-[#FEF2F2] text-[#DC2626] border-red-200 hover:bg-[#FDE4E4]',
  Dead: 'bg-[#F9F9F9] text-[#9CA3AF] border-[#E5E7EB] hover:bg-[#F0F0F0]',
};

function getInitials(name: string | null) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

interface Lead {
  id: string;
  full_name: string | null;
  title: string | null;
  company: string | null;
  company_website: string | null;
  company_summary: string | null;
  linkedin_url: string | null;
  email: string | null;
  phone: string | null;
  status: string;
  enriched_at: string | null;
}

interface Note { id: string; note: string; created_at: string; }
interface Meeting { meeting_time: string; google_event_link: string | null; }

interface LeadPanelProps {
  leadId: string;
  onClose: () => void;
  onStatusChange: (id: string, status: string) => void;
}

export function LeadPanel({ leadId, onClose, onStatusChange }: LeadPanelProps) {
  const [lead, setLead] = useState<Lead | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  const fetchLead = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/leads/${leadId}`);
    if (res.ok) {
      const data = await res.json();
      setLead(data.lead);
      setNotes(data.notes);
      setMeeting(data.meeting);
    }
    setLoading(false);
  }, [leadId]);

  useEffect(() => { fetchLead(); }, [fetchLead]);

  async function handleStatusChange(status: LeadStatus) {
    if (!lead) return;
    const res = await fetch('/api/leads', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: lead.id, status }),
    });
    if (res.ok) {
      setLead((prev) => prev ? { ...prev, status } : prev);
      onStatusChange(lead.id, status);
      toast.success('Status updated');
    }
  }

  async function handleAddNote() {
    if (!noteText.trim() || !lead) return;
    setSavingNote(true);
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lead_id: lead.id, note: noteText }),
    });
    if (res.ok) {
      const { note } = await res.json();
      setNotes((prev) => [...prev, note]);
      setNoteText('');
      toast.success('Note saved');
    }
    setSavingNote(false);
  }

  if (loading) {
    return (
      <div className="w-[420px] border-l border-[#E2E4DE] bg-white flex flex-col h-full">
        <div className="p-6 space-y-4 animate-pulse">
          <div className="flex gap-3">
            <div className="w-12 h-12 rounded-full bg-[#F3F4F0]" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-[#F3F4F0] rounded w-2/3" />
              <div className="h-3 bg-[#F3F4F0] rounded w-1/2" />
            </div>
          </div>
          {[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-[#F3F4F0] rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!lead) return null;

  return (
    <>
      <div className="w-[420px] border-l border-[#E2E4DE] bg-white flex flex-col h-full overflow-hidden shadow-[-4px_0_24px_rgba(0,0,0,0.04)]">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-[#F0F1ED]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#3462EE] text-white flex items-center justify-center font-semibold text-sm flex-shrink-0">
              {getInitials(lead.full_name)}
            </div>
            <div>
              <h2 className="font-semibold text-[#121721]">{lead.full_name ?? 'Unknown'}</h2>
              <p className="text-sm text-[#6B7280]">{lead.title ?? 'No title'} {lead.company ? `· ${lead.company}` : ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 ml-2">
            {lead.linkedin_url && (
              <a href={lead.linkedin_url} target="_blank" rel="noopener noreferrer"
                className="w-7 h-7 rounded-lg bg-[#F3F4F0] hover:bg-[#EAF0F8] flex items-center justify-center text-[#6B7280] hover:text-[#3462EE] transition-colors">
                <Link2 size={13} />
              </a>
            )}
            {lead.company_website && (
              <a href={lead.company_website} target="_blank" rel="noopener noreferrer"
                className="w-7 h-7 rounded-lg bg-[#F3F4F0] hover:bg-[#F3F4F0] flex items-center justify-center text-[#6B7280] hover:text-[#374151] transition-colors">
                <Globe size={13} />
              </a>
            )}
            <button onClick={onClose}
              className="w-7 h-7 rounded-lg bg-[#F3F4F0] hover:bg-[#FEF2F2] flex items-center justify-center text-[#6B7280] hover:text-[#DC2626] transition-colors ml-1">
              <X size={14} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Contact quick info */}
          {(lead.email || lead.phone) && (
            <div className="px-6 py-4 border-b border-[#F0F1ED] flex gap-4">
              {lead.email && (
                <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                  <Mail size={13} className="text-[#9CA3AF]" />
                  <span className="text-xs">{lead.email}</span>
                </div>
              )}
              {lead.phone && (
                <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                  <Phone size={13} className="text-[#9CA3AF]" />
                  <span className="text-xs">{lead.phone}</span>
                </div>
              )}
            </div>
          )}

          <div className="px-6 py-5 space-y-6">
            {/* Status */}
            <div>
              <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2.5">Call Status</p>
              <div className="flex flex-wrap gap-1.5">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      lead.status === s
                        ? `${statusColors[s]} shadow-sm font-semibold`
                        : 'bg-[#F8F9F6] text-[#9CA3AF] border-[#E8EAE4] hover:border-[#D1D5CB] hover:text-[#6B7280]'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Company intel */}
            <div>
              <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2.5">Company Intel</p>
              {lead.company_summary ? (
                <div className="bg-[#F8F9F6] rounded-xl p-4 border border-[#E8EAE4]">
                  <p className="text-sm text-[#374151] leading-relaxed">{lead.company_summary}</p>
                </div>
              ) : lead.enriched_at ? (
                <p className="text-sm text-[#9CA3AF] italic">No summary extracted.</p>
              ) : (
                <div className="flex items-center gap-2 text-sm text-[#9CA3AF]">
                  <div className="w-3 h-3 rounded-full border-2 border-[#4A91A8] border-t-transparent animate-spin" />
                  Enriching company data...
                </div>
              )}
            </div>

            {/* Meeting */}
            <div>
              <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2.5">Meeting</p>
              {meeting ? (
                <div className="bg-[#E6F4F1] rounded-xl p-4 border border-[#4A91A8]/30">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar size={14} className="text-[#4A91A8]" />
                    <p className="text-sm font-semibold text-[#2A7A6B]">
                      {format(new Date(meeting.meeting_time), 'EEE, MMM d · h:mm a')}
                    </p>
                  </div>
                  {meeting.google_event_link && (
                    <a href={meeting.google_event_link} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-[#4A91A8] hover:text-[#2A7A6B] mt-1">
                      Open in Google Calendar <ExternalLink size={11} />
                    </a>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowCalendar(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E2E4DE] hover:border-[#3462EE] hover:bg-[#EBF0FD] rounded-xl text-sm text-[#374151] hover:text-[#3462EE] transition-all shadow-sm"
                >
                  <Calendar size={14} /> Book Meeting
                </button>
              )}
            </div>

            {/* Call log */}
            <div>
              <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2.5">Call Log</p>
              <NotesList notes={notes} />
            </div>
          </div>
        </div>

        {/* Add note */}
        <div className="px-5 py-4 border-t border-[#F0F1ED] bg-[#FAFAF8]">
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Add a call note..."
            rows={3}
            className="w-full bg-white border border-[#E2E4DE] rounded-xl px-3.5 py-2.5 text-sm text-[#121721] placeholder-[#C4C9BE] resize-none focus:outline-none focus:ring-2 focus:ring-[#3462EE]/20 focus:border-[#3462EE] transition-all"
            onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAddNote(); }}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-[#C4C9BE]">⌘ + Enter to save</span>
            <button
              onClick={handleAddNote}
              disabled={!noteText.trim() || savingNote}
              className="px-4 py-1.5 bg-[#121721] hover:bg-[#1F2937] disabled:bg-[#F3F4F0] disabled:text-[#C4C9BE] text-white text-xs font-medium rounded-lg transition-colors"
            >
              {savingNote ? 'Saving...' : 'Add Note'}
            </button>
          </div>
        </div>
      </div>

      {showCalendar && (
        <CalendarModal
          leadId={lead.id}
          leadName={lead.full_name ?? 'Lead'}
          leadEmail={lead.email ?? undefined}
          onClose={() => setShowCalendar(false)}
          onBooked={() => { setShowCalendar(false); fetchLead(); onStatusChange(lead.id, 'Meeting Booked'); }}
        />
      )}
    </>
  );
}
