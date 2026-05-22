'use client';

import { useState, useEffect } from 'react';
import { format, addDays, startOfDay, isSameDay } from 'date-fns';
import { X, Calendar, Clock, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface TimeSlot { start: string; end: string; label: string; }

interface CalendarModalProps {
  leadId: string;
  leadName: string;
  leadEmail?: string;
  onClose: () => void;
  onBooked: () => void;
}

export function CalendarModal({ leadId, leadName, leadEmail, onClose, onBooked }: CalendarModalProps) {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [booking, setBooking] = useState(false);
  const [eventLink, setEventLink] = useState<string | null>(null);
  const [calendarError, setCalendarError] = useState<string | null>(null);

  const dates = Array.from({ length: 14 }, (_, i) => addDays(startOfDay(new Date()), i));

  useEffect(() => {
    async function fetchSlots() {
      setLoadingSlots(true);
      const res = await fetch('/api/calendar/slots?days=14');
      if (res.ok) {
        const { slots: data, error } = await res.json();
        if (error) setCalendarError(error);
        else setSlots(data ?? []);
      } else {
        setCalendarError('Calendar not connected. Go to the Calendar page to connect.');
      }
      setLoadingSlots(false);
    }
    fetchSlots();
  }, []);

  const slotsForDate = slots.filter((s) => isSameDay(new Date(s.start), selectedDate));

  async function handleBook() {
    if (!selectedSlot) return;
    setBooking(true);
    try {
      const res = await fetch('/api/calendar/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_id: leadId, slot_start: selectedSlot.start, slot_end: selectedSlot.end, lead_name: leadName, lead_email: leadEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setEventLink(data.eventLink);
      onBooked();
      toast.success('Meeting booked!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Booking failed');
    } finally {
      setBooking(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden border border-[#E2E4DE]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0F1ED]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E6F4F1] flex items-center justify-center">
              <Calendar size={15} className="text-[#4A91A8]" />
            </div>
            <h2 className="font-semibold text-[#121721]">Book Meeting — {leadName}</h2>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-[#F3F4F0] hover:bg-[#FEF2F2] flex items-center justify-center text-[#6B7280] hover:text-[#DC2626] transition-colors">
            <X size={14} />
          </button>
        </div>

        {eventLink ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#E6F4F1] flex items-center justify-center mx-auto">
              <span className="text-2xl">✓</span>
            </div>
            <p className="font-semibold text-[#121721]">Meeting booked!</p>
            <a href={eventLink} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-[#3462EE] hover:text-blue-700">
              Open in Google Calendar <ExternalLink size={13} />
            </a>
            <button onClick={onClose} className="block mx-auto text-sm text-[#9CA3AF] hover:text-[#6B7280]">Close</button>
          </div>
        ) : calendarError ? (
          <div className="p-8 text-center space-y-3">
            <p className="text-sm text-[#6B7280]">{calendarError}</p>
            <a href="/calendar" className="text-sm text-[#3462EE] hover:text-blue-700">Connect Calendar →</a>
          </div>
        ) : (
          <div className="p-5 space-y-5">
            {/* Date row */}
            <div>
              <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3">Select Date</p>
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {dates.map((date) => {
                  const hasSlots = slots.some((s) => isSameDay(new Date(s.start), date));
                  const isSelected = isSameDay(date, selectedDate);
                  return (
                    <button key={date.toISOString()} onClick={() => { setSelectedDate(date); setSelectedSlot(null); }}
                      disabled={!hasSlots}
                      className={`flex flex-col items-center px-3 py-2.5 rounded-xl text-xs min-w-[52px] transition-all ${
                        isSelected ? 'bg-[#121721] text-white shadow-sm'
                        : hasSlots ? 'bg-[#F8F9F6] text-[#374151] hover:bg-[#F0F1ED] border border-[#E8EAE4]'
                        : 'bg-[#F8F9F6] text-[#C4C9BE] cursor-not-allowed border border-[#F0F1ED]'
                      }`}
                    >
                      <span className="font-medium">{format(date, 'EEE')}</span>
                      <span className="font-bold text-sm mt-0.5">{format(date, 'd')}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time slots */}
            <div>
              <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3">Available Times (GST)</p>
              {loadingSlots ? (
                <div className="grid grid-cols-3 gap-2">
                  {[...Array(6)].map((_, i) => <div key={i} className="h-9 bg-[#F3F4F0] rounded-xl animate-pulse" />)}
                </div>
              ) : slotsForDate.length === 0 ? (
                <p className="text-sm text-[#9CA3AF] text-center py-4">No available slots on this day</p>
              ) : (
                <div className="grid grid-cols-3 gap-2 max-h-44 overflow-y-auto">
                  {slotsForDate.map((slot) => (
                    <button key={slot.start} onClick={() => setSelectedSlot(slot)}
                      className={`flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl text-xs font-medium transition-all border ${
                        selectedSlot?.start === slot.start
                          ? 'bg-[#3462EE] text-white border-[#3462EE] shadow-sm'
                          : 'bg-[#F8F9F6] text-[#374151] border-[#E8EAE4] hover:border-[#3462EE] hover:bg-[#EBF0FD] hover:text-[#3462EE]'
                      }`}
                    >
                      <Clock size={11} /> {format(new Date(slot.start), 'h:mm a')}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedSlot && (
              <div className="bg-[#EBF0FD] rounded-xl p-3.5 border border-[#C7D8F8]">
                <p className="text-xs text-[#6B7280]">Booking for</p>
                <p className="text-sm font-semibold text-[#3462EE] mt-0.5">{selectedSlot.label} · 30 min</p>
              </div>
            )}

            <button onClick={handleBook} disabled={!selectedSlot || booking}
              className="w-full py-3 bg-[#121721] hover:bg-[#1F2937] disabled:bg-[#F3F4F0] disabled:text-[#C4C9BE] text-white rounded-xl text-sm font-semibold transition-all shadow-sm">
              {booking ? 'Booking...' : 'Confirm & Book Meeting'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
