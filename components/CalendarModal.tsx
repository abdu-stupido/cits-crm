'use client';

import { useState, useEffect } from 'react';
import { format, addDays, startOfDay, isSameDay } from 'date-fns';
import { X, Calendar, Clock, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface TimeSlot { start: string; end: string; label: string; }

export function CalendarModal({ leadId, leadName, leadEmail, onClose, onBooked }: {
  leadId: string; leadName: string; leadEmail?: string; onClose: () => void; onBooked: () => void;
}) {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [booking, setBooking] = useState(false);
  const [eventLink, setEventLink] = useState<string | null>(null);
  const [calendarError, setCalendarError] = useState<string | null>(null);

  const dates = Array.from({ length: 14 }, (_, i) => addDays(startOfDay(new Date()), i));

  useEffect(() => {
    fetch('/api/calendar/slots?days=14').then(async res => {
      if (res.ok) { const { slots: d } = await res.json(); setSlots(d ?? []); }
      else setCalendarError('Calendar not connected. Go to the Calendar page to connect.');
      setLoadingSlots(false);
    });
  }, []);

  const slotsForDate = slots.filter(s => isSameDay(new Date(s.start), selectedDate));

  async function handleBook() {
    if (!selectedSlot) return;
    setBooking(true);
    try {
      const res = await fetch('/api/calendar/book', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_id: leadId, slot_start: selectedSlot.start, slot_end: selectedSlot.end, lead_name: leadName, lead_email: leadEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setEventLink(data.eventLink); onBooked(); toast.success('Meeting booked!');
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Booking failed'); }
    finally { setBooking(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="glass-strong rounded-3xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-2xl bg-emerald-100/80 flex items-center justify-center">
              <Calendar size={14} className="text-emerald-600" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800 text-sm">Book Meeting</h2>
              <p className="text-xs text-slate-400 font-light">{leadName}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 glass rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors">
            <X size={13} />
          </button>
        </div>

        {eventLink ? (
          <div className="p-10 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100/80 flex items-center justify-center mx-auto text-2xl">✓</div>
            <p className="font-semibold text-slate-800">Meeting booked!</p>
            <a href={eventLink} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-[#3462EE] hover:text-blue-700">
              Open in Google Calendar <ExternalLink size={12} />
            </a>
            <button onClick={onClose} className="block mx-auto text-xs text-slate-400 hover:text-slate-600 mt-1">Close</button>
          </div>
        ) : calendarError ? (
          <div className="p-8 text-center space-y-3">
            <p className="text-sm text-slate-500">{calendarError}</p>
            <a href="/calendar" className="text-sm text-[#3462EE] hover:text-blue-700">Connect Calendar →</a>
          </div>
        ) : (
          <div className="p-5 space-y-5">
            {/* Dates */}
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Select Date</p>
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {dates.map(date => {
                  const hasSlots = slots.some(s => isSameDay(new Date(s.start), date));
                  const isSel = isSameDay(date, selectedDate);
                  return (
                    <button key={date.toISOString()} onClick={() => { setSelectedDate(date); setSelectedSlot(null); }}
                      disabled={!hasSlots}
                      className={`flex flex-col items-center px-3 py-2.5 rounded-2xl text-xs min-w-[50px] transition-all border ${
                        isSel ? 'bg-[#0F1623] text-white border-[#0F1623] shadow-sm'
                        : hasSlots ? 'glass text-slate-600 hover:bg-white/60'
                        : 'bg-white/10 text-slate-300 cursor-not-allowed border-white/20'
                      }`}>
                      <span className="font-medium">{format(date, 'EEE')}</span>
                      <span className="font-bold text-sm mt-0.5">{format(date, 'd')}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Slots */}
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Available Times (GST)</p>
              {loadingSlots ? (
                <div className="grid grid-cols-3 gap-2">
                  {[...Array(6)].map((_, i) => <div key={i} className="h-10 glass rounded-2xl animate-pulse" />)}
                </div>
              ) : slotsForDate.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">No slots on this day</p>
              ) : (
                <div className="grid grid-cols-3 gap-2 max-h-44 overflow-y-auto">
                  {slotsForDate.map(slot => (
                    <button key={slot.start} onClick={() => setSelectedSlot(slot)}
                      className={`flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-2xl text-xs font-medium transition-all border ${
                        selectedSlot?.start === slot.start
                          ? 'bg-[#3462EE] text-white border-[#3462EE] shadow-sm'
                          : 'glass text-slate-600 hover:bg-white/60 hover:text-[#3462EE]'
                      }`}>
                      <Clock size={10} /> {format(new Date(slot.start), 'h:mm a')}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedSlot && (
              <div className="glass rounded-2xl px-4 py-3 border-l-4 border-[#3462EE]">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Booking</p>
                <p className="text-sm font-semibold text-[#3462EE] mt-0.5">{selectedSlot.label} · 30 min</p>
              </div>
            )}

            <button onClick={handleBook} disabled={!selectedSlot || booking}
              className="w-full py-3.5 bg-[#0F1623] hover:bg-slate-800 disabled:opacity-30 text-white rounded-2xl text-sm font-semibold transition-all">
              {booking ? 'Booking...' : 'Confirm & Book Meeting'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
