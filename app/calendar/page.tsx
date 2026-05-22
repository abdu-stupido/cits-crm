'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface TimeSlot { start: string; end: string; label: string; }

export default function CalendarPage() {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [connected, setConnected] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('error')) setError('Authentication failed. Please try again.');
    fetch('/api/calendar/slots?days=7').then(async res => {
      if (res.ok) { const { slots: d } = await res.json(); setSlots(d ?? []); setConnected(true); }
      else setConnected(false);
      setLoading(false);
    });
  }, []);

  const slotsByDay: Record<string, TimeSlot[]> = {};
  slots.forEach(s => {
    const day = format(new Date(s.start), 'yyyy-MM-dd');
    if (!slotsByDay[day]) slotsByDay[day] = [];
    slotsByDay[day].push(s);
  });

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Header */}
        <div className="glass-strong rounded-3xl px-6 py-4 flex items-center gap-3">
          <Link href="/" className="w-8 h-8 glass rounded-2xl flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors">
            <ArrowLeft size={14} />
          </Link>
          <div className="w-8 h-8 rounded-2xl bg-emerald-100 flex items-center justify-center">
            <Calendar size={14} className="text-emerald-600" />
          </div>
          <div>
            <h1 className="font-semibold text-slate-800 text-sm">Google Calendar</h1>
            <p className="text-[10px] text-slate-400 font-light">Meeting availability</p>
          </div>
        </div>

        {/* Connection */}
        <div className={`glass rounded-3xl p-6 ${connected ? 'border-l-4 border-emerald-400' : ''}`}>
          <div className="flex items-center gap-4">
            {connected ? (
              <>
                <div className="w-10 h-10 rounded-2xl bg-emerald-100/80 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 size={18} className="text-emerald-500" />
                </div>
                <div>
                  <p className="font-semibold text-emerald-700 text-sm">Calendar Connected</p>
                  <p className="text-xs text-slate-400 font-light mt-0.5">Meetings can be booked directly from lead profiles</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-2xl glass flex items-center justify-center flex-shrink-0">
                  <AlertCircle size={18} className="text-slate-400" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-700 text-sm">Not Connected</p>
                  <p className="text-xs text-slate-400 font-light mt-0.5">Connect Google Calendar to enable meeting booking</p>
                </div>
                <a href="/api/calendar/auth"
                  className="px-5 py-2.5 bg-[#3462EE] hover:bg-[#2850CC] text-white text-sm font-semibold rounded-2xl transition-all shadow-sm flex-shrink-0">
                  Connect
                </a>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="glass rounded-2xl p-4 border-l-4 border-rose-400">
            <p className="text-sm text-rose-600">{error}</p>
          </div>
        )}

        {/* Slots */}
        {connected && (
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-4 px-1">Available Slots — Next 7 Days (GST)</p>
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => <div key={i} className="h-24 glass rounded-3xl animate-pulse" />)}
              </div>
            ) : Object.keys(slotsByDay).length === 0 ? (
              <div className="glass rounded-3xl p-8 text-center">
                <p className="text-slate-400 text-sm">No available slots in the next 7 days</p>
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(slotsByDay).map(([day, daySlots]) => (
                  <div key={day} className="glass rounded-3xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-semibold text-slate-700">{format(new Date(day), 'EEEE, MMMM d')}</p>
                      <span className="text-xs text-slate-400 font-light">{daySlots.length} slots</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {daySlots.map(slot => (
                        <span key={slot.start}
                          className="px-3 py-1.5 glass rounded-full text-xs font-medium text-[#3462EE] border-blue-100/80">
                          {format(new Date(slot.start), 'h:mm a')}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
