import { google } from 'googleapis';
import { supabaseAdmin } from '@/lib/supabase';

const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events',
];

export function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

export function getAuthUrl() {
  const oauth2Client = getOAuthClient();
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });
}

export async function getStoredTokens() {
  const { data } = await supabaseAdmin
    .from('calendar_tokens')
    .select('*')
    .limit(1)
    .single();
  return data;
}

export async function getAuthorizedClient() {
  const tokens = await getStoredTokens();
  if (!tokens) return null;

  const oauth2Client = getOAuthClient();
  oauth2Client.setCredentials({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expiry_date: tokens.expiry_date,
  });

  oauth2Client.on('tokens', async (newTokens) => {
    await supabaseAdmin
      .from('calendar_tokens')
      .update({
        access_token: newTokens.access_token,
        expiry_date: newTokens.expiry_date,
        updated_at: new Date().toISOString(),
      })
      .eq('id', tokens.id);
  });

  return oauth2Client;
}

export interface TimeSlot {
  start: string;
  end: string;
  label: string;
}

export async function getAvailableSlots(days = 7): Promise<TimeSlot[]> {
  const auth = await getAuthorizedClient();
  if (!auth) return [];

  const calendar = google.calendar({ version: 'v3', auth });

  const now = new Date();
  const timeMin = now.toISOString();
  const timeMax = new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString();

  const freeBusy = await calendar.freebusy.query({
    requestBody: {
      timeMin,
      timeMax,
      timeZone: 'Asia/Qatar',
      items: [{ id: 'primary' }],
    },
  });

  const busySlots = freeBusy.data.calendars?.primary?.busy ?? [];

  const slots: TimeSlot[] = [];
  const cursor = new Date(now);
  cursor.setMinutes(0, 0, 0);
  cursor.setHours(cursor.getHours() + 1);

  while (cursor < new Date(timeMax)) {
    // Convert to Qatar time (UTC+3) for day/hour checks
    const gst = new Date(cursor.getTime() + 3 * 60 * 60 * 1000);
    const dayOfWeek = gst.getUTCDay(); // 0=Sun, 5=Fri, 6=Sat
    const hour = gst.getUTCHours();

    // Business hours Sun-Thu 9am-6pm GST (Qatar work week)
    if (dayOfWeek !== 5 && dayOfWeek !== 6 && hour >= 9 && hour < 18) {
      const slotEnd = new Date(cursor.getTime() + 30 * 60 * 1000);

      const isBusy = busySlots.some((busy) => {
        const busyStart = new Date(busy.start!);
        const busyEnd = new Date(busy.end!);
        return cursor < busyEnd && slotEnd > busyStart;
      });

      if (!isBusy) {
        const label = cursor.toLocaleString('en-QA', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'Asia/Qatar',
        });
        slots.push({ start: cursor.toISOString(), end: slotEnd.toISOString(), label });
      }
    }

    cursor.setMinutes(cursor.getMinutes() + 30);
  }

  return slots.slice(0, 100);
}

export async function createCalendarEvent(
  slotStart: string,
  slotEnd: string,
  leadName: string,
  leadEmail?: string,
  notes?: string
) {
  const auth = await getAuthorizedClient();
  if (!auth) throw new Error('Calendar not connected');

  const calendar = google.calendar({ version: 'v3', auth });

  const attendees = leadEmail ? [{ email: leadEmail }] : [];

  const event = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: {
      summary: `Call with ${leadName} — CITS Qatar`,
      description: notes ?? '',
      start: { dateTime: slotStart, timeZone: 'Asia/Qatar' },
      end: { dateTime: slotEnd, timeZone: 'Asia/Qatar' },
      attendees,
    },
  });

  return event.data;
}
