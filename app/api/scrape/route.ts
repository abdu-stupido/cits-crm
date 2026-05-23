import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { scrapeGoogleMapsLeads } from '@/lib/apify';

const DEFAULT_QUERIES = [
  'IT company',
  'technology services',
  'facility management',
  'IT solutions provider',
];

export async function POST(req: NextRequest) {
  const { count = 50, searchQueries = DEFAULT_QUERIES, location = 'Qatar' } = await req.json();

  let scraped = 0;
  let enriched = 0;
  let skipped = 0;

  try {
    const places = await scrapeGoogleMapsLeads(count, searchQueries, location);

    for (const place of places) {
      if (!place.title) { skipped++; continue; }

      // Use Google Maps URL as dedup key (stored in linkedin_url column)
      const mapsUrl = place.url ?? null;

      if (mapsUrl) {
        const { data: existing } = await supabaseAdmin
          .from('leads')
          .select('id')
          .eq('linkedin_url', mapsUrl)
          .single();
        if (existing) { skipped++; continue; }
      }

      // Also skip if same company name + phone already exists
      if (place.phone) {
        const { data: byPhone } = await supabaseAdmin
          .from('leads')
          .select('id')
          .eq('phone', place.phone)
          .single();
        if (byPhone) { skipped++; continue; }
      }

      const s = (v: string | null | undefined) => v?.trim() || null;

      const firstEmail = s(place.emails?.[0]);

      const { data: inserted, error } = await supabaseAdmin
        .from('leads')
        .insert({
          full_name: place.title,
          company: place.title,
          title: s(place.categoryName),
          industry: s(place.categoryName),
          phone: s(place.phone) ?? s(place.phoneUnformatted),
          email: firstEmail,
          company_website: s(place.website),
          linkedin_url: mapsUrl,
          location: s(place.address) ?? location,
        })
        .select()
        .single();

      if (error || !inserted) { skipped++; continue; }
      scraped++;
    }

    return NextResponse.json({ scraped, enriched, skipped });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Scrape failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
