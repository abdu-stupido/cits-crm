'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { format, isSameDay } from 'date-fns';

interface TimeSlot {
  start: string;
  end: string;
  label: string;
}

export default function CalendarPage() {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [connected, setConnected] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('connected') === 'true') {
      setConnected(true);
    }
    if (params.get('error')) {
      setError('Authentication failed. Please try again.');
    }

    async function fetchSlots() {
      const res = await fetch('/api/calendar/slots?days=7');
      if (res.ok) {
        const { slots: data } = await res.json();
        setSlots(data ?? []);
        setConnected(true);
      } else {
        setConnected(false);
      }
      setLoading(false);
    }
    fetchSlots();
  }, []);

  // Group slots by day
  const slotsByDay: Record<string, TimeSlot[]> = {};
  slots.forEach((slot) => {
    const day = format(new Date(slot.start), 'yyyy-MM-dd');
    if (!slotsByDay[day]) slotsByDay[day] = [];
    slotsByDay[day].push(slot);
  });

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <header className="flex items-center gap-4 px-6 py-4 border-b border-slate-700 bg-[#1E293B]">
        <Link href="/" className="text-slate-400 hover:text-slate-200 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-blue-400" />
          <h1 className="font-semibold text-slate-100">Google Calendar</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        {/* Connection status */}
        <div className={`flex items-center gap-3 p-4 rounded-xl border mb-8 ${
          connected
            ? 'bg-green-950/30 border-green-800/40'
            : 'bg-slate-800 border-slate-700'
        }`}>
          {connected ? (
            <>
              <CheckCircle2 size={20} className="text-green-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-300">Calendar Connected</p>
                <p className="text-xs text-slate-400 mt-0.5">Meetings can be booked directly from lead profiles</p>
              </div>
            </>
          ) : (
            <>
              <AlertCircle size={20} className="text-slate-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-200">Not Connected</p>
                <p className="text-xs text-slate-400 mt-0.5">Connect your Google Calendar to enable meeting booking</p>
              </div>
              <a
                href="/api/calendar/auth"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors flex-shrink-0"
              >
                Connect Google Calendar
              </a>
            </>
          )}
        </div>

        {error && (
          <div className="bg-red-950/30 border border-red-800/40 rounded-xl p-4 mb-6">
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* Slots preview */}
        {connected && (
          <div>
            <h2 className="text-sm font-medium text-slate-300 mb-4">Available slots — next 7 days (GST)</h2>
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 bg-slate-800 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : Object.keys(slotsByDay).length === 0 ? (
              <p className="text-sm text-slate-500">No available slots in the next 7 days.</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(slotsByDay).map(([day, daySlots]) => (
                  <div key={day} className="bg-slate-800 rounded-xl p-4">
                    <p className="text-sm font-medium text-slate-200 mb-3">
                      {format(new Date(day), 'EEEE, MMMM d')}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {daySlots.map((slot) => (
                        <span
                          key={slot.start}
                          className="px-2.5 py-1 bg-slate-700 text-slate-300 text-xs rounded"
                        >
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
      </main>
    </div>
  );
}
