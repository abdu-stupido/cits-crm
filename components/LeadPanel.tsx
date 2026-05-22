'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Link2, Globe, Calendar, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { NotesList } from './NotesList';
import { CalendarModal } from './CalendarModal';
import type { LeadStatus } from './StatusBadge';

const STATUSES: LeadStatus[] = [
  'Untouched', 'Called', 'Follow-up', 'Meeting Booked', 'Not Interested', 'Dead',
];

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

interface Note {
  id: string;
  note: string;
  created_at: string;
}

interface Meeting {
  meeting_time: string;
  google_event_link: string | null;
}

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

  useEffect(() => {
    fetchLead();
  }, [fetchLead]);

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
      <div className="w-[450px] border-l border-slate-700 bg-[#1E293B] p-6 space-y-4 animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-8 bg-slate-700 rounded" />
        ))}
      </div>
    );
  }

  if (!lead) return null;

  return (
    <>
      <div className="w-[450px] border-l border-slate-700 bg-[#1E293B] flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-slate-700 flex-shrink-0">
          <div>
            <h2 className="font-semibold text-slate-100 text-base">{lead.full_name ?? 'Unknown'}</h2>
            <p className="text-sm text-slate-400 mt-0.5">{lead.title ?? 'No title'}</p>
            <p className="text-sm text-slate-500">{lead.company ?? 'No company'}</p>
          </div>
          <div className="flex items-center gap-2 ml-2 flex-shrink-0">
            {lead.linkedin_url && (
              <a href={lead.linkedin_url} target="_blank" rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300">
                <Link2 size={16} />
              </a>
            )}
            {lead.company_website && (
              <a href={lead.company_website} target="_blank" rel="noopener noreferrer"
                className="text-slate-400 hover:text-slate-200">
                <Globe size={16} />
              </a>
            )}
            <button onClick={onClose} className="text-slate-400 hover:text-slate-200 ml-1">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Contact info */}
          {(lead.email || lead.phone) && (
            <div className="text-xs space-y-1">
              {lead.email && <p className="text-slate-400">✉ {lead.email}</p>}
              {lead.phone && <p className="text-slate-400">📞 {lead.phone}</p>}
            </div>
          )}

          {/* Company summary */}
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1.5">Company Intel</p>
            {lead.company_summary ? (
              <p className="text-sm text-slate-300 leading-relaxed">{lead.company_summary}</p>
            ) : lead.enriched_at ? (
              <p className="text-sm text-slate-500 italic">No summary extracted.</p>
            ) : (
              <p className="text-sm text-slate-500 italic">Enriching...</p>
            )}
          </div>

          {/* Status selector */}
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Call Status</p>
            <div className="flex flex-wrap gap-1.5">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    lead.status === s
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Meeting section */}
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Meeting</p>
            {meeting ? (
              <div className="bg-green-950/40 border border-green-800/40 rounded-lg p-3">
                <p className="text-sm text-green-300 font-medium">
                  {format(new Date(meeting.meeting_time), 'EEE, MMM d · h:mm a')} (GST)
                </p>
                {meeting.google_event_link && (
                  <a
                    href={meeting.google_event_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-green-400 hover:text-green-300 mt-1"
                  >
                    Open in Calendar <ExternalLink size={11} />
                  </a>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowCalendar(true)}
                className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-slate-200 transition-colors"
              >
                <Calendar size={14} /> Book Meeting
              </button>
            )}
          </div>

          {/* Notes */}
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Call Log</p>
            <NotesList notes={notes} />
          </div>
        </div>

        {/* Add note */}
        <div className="p-4 border-t border-slate-700 flex-shrink-0">
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Add a call note..."
            rows={3}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 resize-none focus:outline-none focus:border-blue-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAddNote();
            }}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-slate-600">Cmd+Enter to save</span>
            <button
              onClick={handleAddNote}
              disabled={!noteText.trim() || savingNote}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-xs font-medium rounded-lg transition-colors"
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
          onBooked={() => {
            setShowCalendar(false);
            fetchLead();
            onStatusChange(lead.id, 'Meeting Booked');
          }}
        />
      )}
    </>
  );
}
