import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [leadRes, notesRes, meetingRes] = await Promise.all([
    supabaseAdmin.from('leads').select('*').eq('id', id).single(),
    supabaseAdmin
      .from('lead_notes')
      .select('*')
      .eq('lead_id', id)
      .order('created_at', { ascending: true }),
    supabaseAdmin.from('meetings').select('*').eq('lead_id', id).limit(1).single(),
  ]);

  if (leadRes.error) return NextResponse.json({ error: leadRes.error.message }, { status: 404 });

  return NextResponse.json({
    lead: leadRes.data,
    notes: notesRes.data ?? [],
    meeting: meetingRes.data ?? null,
  });
}
