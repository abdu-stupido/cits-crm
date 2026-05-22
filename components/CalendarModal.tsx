'use client';

import { useState, useEffect } from 'react';
import { format, addDays, startOfDay, isSameDay } from 'date-fns';
import { X, Calendar, Clock, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface TimeSlot {
  start: string;
  end: string;
  label: string;
}

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
        setCalendarError('Calendar not connected. Connect it from the Calendar page.');
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
        body: JSON.stringify({
          lead_id: leadId,
          slot_start: selectedSlot.start,
          slot_end: selectedSlot.end,
          lead_name: leadName,
          lead_email: leadEmail,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setEventLink(data.eventLink);
      onBooked();
      toast.success('Meeting booked! Calendar invite created.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Booking failed');
    } finally {
      setBooking(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-[#1E293B] rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-blue-400" />
            <h2 className="font-semibold text-slate-100">Book Meeting — {leadName}</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X size={18} />
          </button>
        </div>

        {eventLink ? (
          <div className="p-6 text-center space-y-4">
            <div className="text-green-400 text-4xl">✓</div>
            <p className="text-slate-100 font-medium">Meeting booked successfully!</p>
            <a
              href={eventLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm"
            >
              Open in Google Calendar <ExternalLink size={14} />
            </a>
            <button
              onClick={onClose}
              className="block mx-auto mt-2 text-slate-400 hover:text-slate-200 text-sm"
            >
              Close
            </button>
          </div>
        ) : calendarError ? (
          <div className="p-6 text-center">
            <p className="text-amber-400 text-sm">{calendarError}</p>
            <a href="/calendar" className="mt-3 inline-block text-blue-400 hover:text-blue-300 text-sm">
              Connect Calendar →
            </a>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            {/* Date picker */}
            <div>
              <p className="text-xs text-slate-400 mb-2 uppercase tracking-wide">Select Date</p>
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {dates.map((date) => {
                  const hasSlots = slots.some((s) => isSameDay(new Date(s.start), date));
                  const isSelected = isSameDay(date, selectedDate);
                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => { setSelectedDate(date); setSelectedSlot(null); }}
                      disabled={!hasSlots}
                      className={`flex flex-col items-center px-3 py-2 rounded-lg text-xs min-w-[52px] transition-colors ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : hasSlots
                          ? 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                          : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                      }`}
                    >
                      <span>{format(date, 'EEE')}</span>
                      <span className="font-semibold">{format(date, 'd')}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time slots */}
            <div>
              <p className="text-xs text-slate-400 mb-2 uppercase tracking-wide">Available Times (GST)</p>
              {loadingSlots ? (
                <div className="grid grid-cols-3 gap-2">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-9 bg-slate-700 rounded animate-pulse" />
                  ))}
                </div>
              ) : slotsForDate.length === 0 ? (
                <p className="text-sm text-slate-500 py-2">No available slots on this day.</p>
              ) : (
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                  {slotsForDate.map((slot) => (
                    <button
                      key={slot.start}
                      onClick={() => setSelectedSlot(slot)}
                      className={`flex items-center justify-center gap-1 px-2 py-2 rounded-lg text-xs transition-colors ${
                        selectedSlot?.start === slot.start
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                      }`}
                    >
                      <Clock size={11} />
                      {format(new Date(slot.start), 'h:mm a')}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedSlot && (
              <div className="bg-slate-800 rounded-lg p-3">
                <p className="text-xs text-slate-400">Booking:</p>
                <p className="text-sm text-slate-100 font-medium mt-0.5">{selectedSlot.label} (30 min)</p>
              </div>
            )}

            <button
              onClick={handleBook}
              disabled={!selectedSlot || booking}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {booking ? 'Booking...' : 'Confirm & Book Meeting'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
