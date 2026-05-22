'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Link2, Globe, Calendar, ExternalLink, Phone, Mail } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { NotesList } from './NotesList';
import { CalendarModal } from './CalendarModal';
import type { LeadStatus } from './StatusBadge';

const STATUSES: LeadStatus[] = ['Untouched', 'Called', 'Follow-up', 'Meeting Booked', 'Not Interested', 'Dead'];

const statusActive: Record<LeadStatus, string> = {
  Untouched:        'bg-slate-600 text-white border-slate-600',
  Called:           'bg-[#3462EE] text-white border-[#3462EE]',
  'Follow-up':      'bg-amber-400 text-white border-amber-400',
  'Meeting Booked': 'bg-emerald-500 text-white border-emerald-500',
  'Not Interested': 'bg-rose-500 text-white border-rose-500',
  Dead:             'bg-slate-400 text-white border-slate-400',
};

function getInitials(name: string | null) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

interface Lead {
  id: string; full_name: string | null; title: string | null; company: string | null;
  company_website: string | null; company_summary: string | null; linkedin_url: string | null;
  email: string | null; phone: string | null; status: string; enriched_at: string | null;
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
  const [showNotepad, setShowNotepad] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  const fetchLead = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/leads/${leadId}`);
    if (res.ok) { const d = await res.json(); setLead(d.lead); setNotes(d.notes); setMeeting(d.meeting); }
    setLoading(false);
  }, [leadId]);

  useEffect(() => { fetchLead(); }, [fetchLead]);

  async function handleStatusChange(status: LeadStatus) {
    if (!lead) return;
    const res = await fetch('/api/leads', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: lead.id, status }),
    });
    if (res.ok) { setLead(p => p ? { ...p, status } : p); onStatusChange(lead.id, status); toast.success('Status updated'); }
  }

  async function handleAddNote() {
    if (!noteText.trim() || !lead) return;
    setSavingNote(true);
    const res = await fetch('/api/notes', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lead_id: lead.id, note: noteText }),
    });
    if (res.ok) { const { note } = await res.json(); setNotes(p => [...p, note]); setNoteText(''); setShowNotepad(false); toast.success('Note saved'); }
    setSavingNote(false);
  }

  if (loading) {
    return (
      <div className="glass-panel rounded-3xl flex flex-col h-full overflow-hidden animate-pulse p-6 space-y-4">
        <div className="flex gap-3">
          <div className="w-12 h-12 rounded-full bg-white/40" />
          <div className="space-y-2 flex-1"><div className="h-4 bg-white/40 rounded-full w-2/3" /><div className="h-3 bg-white/30 rounded-full w-1/2" /></div>
        </div>
        {[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-white/30 rounded-2xl" />)}
      </div>
    );
  }
  if (!lead) return null;

  return (
    <>
      <div className="glass-panel rounded-3xl flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-5 border-b border-white/40">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-14 h-14 rounded-2xl bg-[#0F1623] text-white flex items-center justify-center font-bold text-base flex-shrink-0">
                {getInitials(lead.full_name)}
              </div>
              <div className="min-w-0">
                <h2 className="font-semibold text-slate-800 text-lg leading-tight truncate">{lead.full_name ?? 'Unknown'}</h2>
                <p className="text-sm text-slate-500 font-light mt-0.5 truncate">{lead.title ?? '—'}</p>
                {lead.company && <p className="text-xs text-[#3462EE] font-medium mt-0.5 truncate">{lead.company}</p>}
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {lead.linkedin_url && (
                <a href={lead.linkedin_url} target="_blank" rel="noopener noreferrer"
                  className="w-7 h-7 glass rounded-xl flex items-center justify-center text-slate-500 hover:text-[#3462EE] transition-colors">
                  <Link2 size={12} />
                </a>
              )}
              {lead.company_website && (
                <a href={lead.company_website} target="_blank" rel="noopener noreferrer"
                  className="w-7 h-7 glass rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors">
                  <Globe size={12} />
                </a>
              )}
              <button onClick={onClose}
                className="w-7 h-7 glass rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors ml-0.5">
                <X size={13} />
              </button>
            </div>
          </div>

          {(lead.email || lead.phone) && (
            <div className="grid grid-cols-2 gap-2 mt-4">
              {lead.phone && (
                <a href={`tel:${lead.phone}`}
                  className="flex items-center gap-2.5 glass rounded-2xl px-4 py-3 hover:bg-white/60 transition-all group">
                  <div className="w-7 h-7 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <Phone size={12} className="text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Phone</p>
                    <p className="text-xs text-slate-700 font-semibold truncate group-hover:text-emerald-700 transition-colors">{lead.phone}</p>
                  </div>
                </a>
              )}
              {lead.email && (
                <a href={`mailto:${lead.email}`}
                  className="flex items-center gap-2.5 glass rounded-2xl px-4 py-3 hover:bg-white/60 transition-all group">
                  <div className="w-7 h-7 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Mail size={12} className="text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Email</p>
                    <p className="text-xs text-slate-700 font-semibold truncate group-hover:text-blue-700 transition-colors">{lead.email}</p>
                  </div>
                </a>
              )}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Status */}
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Update Status</p>
            <div className="grid grid-cols-3 gap-2">
              {STATUSES.map((s) => (
                <button key={s} onClick={() => handleStatusChange(s)}
                  className={`px-3 py-2.5 rounded-2xl text-xs font-semibold border transition-all text-center ${
                    lead.status === s
                      ? statusActive[s]
                      : 'glass text-slate-500 hover:bg-white/60 hover:text-slate-700'
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Company intel */}
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Company Intel</p>
            {lead.company_summary ? (
              <div className="glass rounded-2xl p-4">
                <p className="text-sm text-slate-600 leading-relaxed font-light">{lead.company_summary}</p>
              </div>
            ) : lead.enriched_at || !lead.company_website ? (
              <p className="text-sm text-slate-400 italic">
                {!lead.company_website ? 'No website on file — enrichment unavailable.' : 'No summary extracted.'}
              </p>
            ) : (
              <div className="flex items-center gap-2.5 text-sm text-slate-400 glass rounded-2xl p-3.5">
                <div className="w-3 h-3 rounded-full border-2 border-[#4A91A8] border-t-transparent animate-spin flex-shrink-0" />
                <span className="text-xs">Enriching company data...</span>
              </div>
            )}
          </div>

          {/* Meeting */}
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Meeting</p>
            {meeting ? (
              <div className="glass rounded-2xl p-4 border-l-4 border-emerald-400">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar size={13} className="text-emerald-500" />
                  <p className="text-sm font-semibold text-emerald-700">
                    {format(new Date(meeting.meeting_time), 'EEE, MMM d · h:mm a')}
                  </p>
                </div>
                {meeting.google_event_link && (
                  <a href={meeting.google_event_link} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-800 mt-1">
                    Open in Calendar <ExternalLink size={10} />
                  </a>
                )}
              </div>
            ) : (
              <button onClick={() => setShowCalendar(true)}
                className="flex items-center gap-2 px-4 py-2.5 glass rounded-2xl text-sm text-slate-600 hover:bg-white/60 hover:text-[#3462EE] transition-all w-full justify-center border-dashed border-white/40">
                <Calendar size={13} /> Book a Meeting
              </button>
            )}
          </div>

          {/* Call log */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                Call Log {notes.length > 0 && <span className="ml-1 normal-case font-normal text-slate-300">({notes.length})</span>}
              </p>
              {!showNotepad && (
                <button onClick={() => setShowNotepad(true)}
                  className="px-3 py-1 bg-[#0F1623] hover:bg-slate-700 text-white text-[10px] font-medium rounded-xl transition-all">
                  + Add Note
                </button>
              )}
            </div>

            {showNotepad && (
              <div className="mb-4">
                <textarea
                  autoFocus
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Log a call note..."
                  rows={4}
                  className="w-full bg-white/50 border border-white/60 rounded-2xl px-4 py-3 text-sm text-slate-700 placeholder-slate-300 resize-none focus:outline-none focus:ring-2 focus:ring-[#3462EE]/20 focus:border-[#3462EE]/40 transition-all backdrop-blur-sm font-light"
                  onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAddNote(); }}
                />
                <div className="flex justify-between items-center mt-2">
                  <button onClick={() => { setShowNotepad(false); setNoteText(''); }}
                    className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleAddNote} disabled={!noteText.trim() || savingNote}
                    className="px-4 py-1.5 bg-[#0F1623] hover:bg-slate-700 disabled:opacity-30 text-white text-xs font-medium rounded-xl transition-all">
                    {savingNote ? 'Saving...' : 'Save Note'}
                  </button>
                </div>
              </div>
            )}

            <NotesList notes={notes} />
          </div>
        </div>
      </div>

      {showCalendar && (
        <CalendarModal
          leadId={lead.id} leadName={lead.full_name ?? 'Lead'} leadEmail={lead.email ?? undefined}
          onClose={() => setShowCalendar(false)}
          onBooked={() => { setShowCalendar(false); fetchLead(); onStatusChange(lead.id, 'Meeting Booked'); }}
        />
      )}
    </>
  );
}
