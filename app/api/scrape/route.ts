import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { scrapeGoogleMapsLeads } from '@/lib/apify';
import { enrichCompanyWebsite } from '@/lib/firecrawl';

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

      const firstEmail = place.emails?.[0] ?? null;

      const { data: inserted, error } = await supabaseAdmin
        .from('leads')
        .insert({
          full_name: place.title,           // business name as the primary contact label
          company: place.title,
          title: place.categoryName ?? null,
          industry: place.categoryName ?? null,
          phone: place.phone ?? place.phoneUnformatted ?? null,
          email: firstEmail,
          company_website: place.website ?? null,
          linkedin_url: mapsUrl,            // repurposed as Maps URL for dedup
          location: place.address ?? location,
        })
        .select()
        .single();

      if (error || !inserted) { skipped++; continue; }
      scraped++;

      // Enrich via Firecrawl if website available
      if (place.website) {
        const summary = await enrichCompanyWebsite(place.website);
        if (summary) {
          await supabaseAdmin
            .from('leads')
            .update({ company_summary: summary, enriched_at: new Date().toISOString() })
            .eq('id', inserted.id);
          enriched++;
        }
      }
    }

    return NextResponse.json({ scraped, enriched, skipped });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Scrape failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
