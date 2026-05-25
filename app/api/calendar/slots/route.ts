import { NextRequest, NextResponse } from 'next/server';
import { getAvailableSlots, getStoredTokens } from '@/lib/google-calendar';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get('days') ?? '7', 10);
  const offsetDays = parseInt(searchParams.get('offset') ?? '0', 10);

  try {
    const tokens = await getStoredTokens();
    if (!tokens) return NextResponse.json({ error: 'not_connected' }, { status: 401 });

    const slots = await getAvailableSlots(days, offsetDays);
    return NextResponse.json({ slots });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch slots';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
