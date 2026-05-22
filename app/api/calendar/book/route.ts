import { NextRequest, NextResponse } from 'next/server';
import { createCalendarEvent } from '@/lib/google-calendar';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const { lead_id, slot_start, slot_end, lead_name, lead_email, notes } = await req.json();

  if (!lead_id || !slot_start || !slot_end || !lead_name) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const event = await createCalendarEvent(slot_start, slot_end, lead_name, lead_email, notes);

    await supabaseAdmin.from('meetings').insert({
      lead_id,
      google_event_id: event.id,
      google_event_link: event.htmlLink,
      meeting_time: slot_start,
      duration_minutes: 30,
      notes: notes ?? null,
    });

    await supabaseAdmin.from('leads').update({ status: 'Meeting Booked' }).eq('id', lead_id);

    return NextResponse.json({ eventLink: event.htmlLink, eventId: event.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Booking failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
