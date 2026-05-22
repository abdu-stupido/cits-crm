'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { format, isSameDay } from 'date-fns';

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
      if (res.ok) {
        const { slots: data } = await res.json();
        setSlots(data ?? []);
        setConnected(true);
      } else {
        setConnected(false);
      }
      setLoading(false);
    });
  }, []);

  const slotsByDay: Record<string, TimeSlot[]> = {};
  slots.forEach(slot => {
    const day = format(new Date(slot.start), 'yyyy-MM-dd');
    if (!slotsByDay[day]) slotsByDay[day] = [];
    slotsByDay[day].push(slot);
  });

  return (
    <div className="min-h-screen bg-[#ECEEE8]">
      <header className="bg-white border-b border-[#E8EAE4] shadow-sm">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link href="/" className="w-8 h-8 rounded-xl bg-[#F8F9F6] hover:bg-[#F0F1ED] border border-[#E8EAE4] flex items-center justify-center text-[#6B7280] hover:text-[#374151] transition-all">
            <ArrowLeft size={15} />
          </Link>
          <div className="w-8 h-8 rounded-xl bg-[#E6F4F1] flex items-center justify-center">
            <Calendar size={15} className="text-[#4A91A8]" />
          </div>
          <div>
            <h1 className="font-semibold text-[#121721] text-sm">Google Calendar</h1>
            <p className="text-xs text-[#9CA3AF]">Meeting availability</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        {/* Connection card */}
        <div className={`rounded-2xl border p-5 shadow-sm ${connected ? 'bg-[#E6F4F1] border-[#4A91A8]/30' : 'bg-white border-[#E8EAE4]'}`}>
          <div className="flex items-center gap-4">
            {connected ? (
              <>
                <div className="w-10 h-10 rounded-xl bg-[#4A91A8]/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 size={20} className="text-[#4A91A8]" />
                </div>
                <div>
                  <p className="font-semibold text-[#2A7A6B]">Calendar Connected</p>
                  <p className="text-sm text-[#6B7280] mt-0.5">Meetings can be booked directly from lead profiles</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-xl bg-[#F3F4F0] flex items-center justify-center flex-shrink-0">
                  <AlertCircle size={20} className="text-[#9CA3AF]" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-[#121721]">Not Connected</p>
                  <p className="text-sm text-[#6B7280] mt-0.5">Connect Google Calendar to enable meeting booking</p>
                </div>
                <a href="/api/calendar/auth"
                  className="px-5 py-2.5 bg-[#3462EE] hover:bg-[#2850CC] text-white text-sm font-semibold rounded-xl transition-all shadow-sm flex-shrink-0">
                  Connect
                </a>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-[#FEF2F2] border border-red-200 rounded-2xl p-4">
            <p className="text-sm text-[#DC2626]">{error}</p>
          </div>
        )}

        {/* Slots */}
        {connected && (
          <div>
            <h2 className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-4">Available Slots — Next 7 Days (GST)</h2>
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-white rounded-2xl animate-pulse border border-[#E8EAE4]" />)}
              </div>
            ) : Object.keys(slotsByDay).length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#E8EAE4] p-8 text-center shadow-sm">
                <p className="text-[#9CA3AF] text-sm">No available slots in the next 7 days</p>
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(slotsByDay).map(([day, daySlots]) => (
                  <div key={day} className="bg-white rounded-2xl border border-[#E8EAE4] p-5 shadow-sm">
                    <p className="text-sm font-semibold text-[#121721] mb-3">
                      {format(new Date(day), 'EEEE, MMMM d')}
                      <span className="ml-2 text-xs font-normal text-[#9CA3AF]">{daySlots.length} slots</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {daySlots.map(slot => (
                        <span key={slot.start}
                          className="px-3 py-1.5 bg-[#EBF0FD] text-[#3462EE] text-xs font-medium rounded-full border border-[#C7D8F8]">
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
