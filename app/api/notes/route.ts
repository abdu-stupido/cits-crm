import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const { lead_id, note } = await req.json();
  if (!lead_id || !note?.trim()) {
    return NextResponse.json({ error: 'Missing lead_id or note' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('lead_notes')
    .insert({ lead_id, note: note.trim() })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ note: data });
}
