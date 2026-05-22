import { NextRequest, NextResponse } from 'next/server';
import { getOAuthClient } from '@/lib/google-calendar';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/calendar?error=no_code', req.url));
  }

  try {
    const oauth2Client = getOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);

    // Upsert — always keep only one row
    const { data: existing } = await supabaseAdmin
      .from('calendar_tokens')
      .select('id')
      .limit(1)
      .single();

    if (existing) {
      await supabaseAdmin.from('calendar_tokens').update({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token ?? undefined,
        expiry_date: tokens.expiry_date,
        updated_at: new Date().toISOString(),
      }).eq('id', existing.id);
    } else {
      await supabaseAdmin.from('calendar_tokens').insert({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry_date: tokens.expiry_date,
      });
    }

    return NextResponse.redirect(new URL('/calendar?connected=true', req.url));
  } catch {
    return NextResponse.redirect(new URL('/calendar?error=auth_failed', req.url));
  }
}
