import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const search = searchParams.get('search');
  const countOnly = searchParams.get('count_only') === 'true';

  let query = supabaseAdmin.from('leads').select(
    countOnly
      ? 'id'
      : `
          *,
          lead_notes(count),
          meetings(id, meeting_time, google_event_link)
        `,
    countOnly ? { count: 'exact', head: true } : {}
  );

  if (status && status !== 'All') {
    query = query.eq('status', status);
  }

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,company.ilike.%${search}%`);
  }

  if (searchParams.get('has_phone') === 'true') {
    query = query.not('phone', 'is', null);
  }

  if (searchParams.get('enriched') === 'true') {
    query = query.not('company_summary', 'is', null);
  }

  if (!countOnly) {
    query = query.order('created_at', { ascending: false });
  }

  const { data, error, count } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (countOnly) return NextResponse.json({ count });
  return NextResponse.json({ leads: data });
}

export async function PATCH(req: NextRequest) {
  const { id, status } = await req.json();
  if (!id || !status) return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from('leads')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ lead: data });
}
