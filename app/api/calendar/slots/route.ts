import { NextRequest, NextResponse } from 'next/server';
import { getAvailableSlots } from '@/lib/google-calendar';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get('days') ?? '7', 10);

  try {
    const slots = await getAvailableSlots(days);
    return NextResponse.json({ slots });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch slots';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
