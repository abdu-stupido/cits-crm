import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { scrapeLinkedInLeads } from '@/lib/apify';
import { enrichCompanyWebsite } from '@/lib/firecrawl';

const DEFAULT_JOB_TITLES = [
  'IT Manager',
  'Operations Manager',
  'Facility Manager',
  'CTO',
  'CEO',
  'General Manager',
  'Head of IT',
  'Director of Operations',
];

export async function POST(req: NextRequest) {
  const { count = 50, industries = [], jobTitles = DEFAULT_JOB_TITLES } = await req.json();

  let scraped = 0;
  let enriched = 0;
  let skipped = 0;

  try {
    const apifyLeads = await scrapeLinkedInLeads(count, industries, jobTitles);

    for (const lead of apifyLeads) {
      const nameFromParts = `${lead.firstName ?? ''} ${lead.lastName ?? ''}`.trim() || null;
      const fullName = lead.fullName ?? nameFromParts;
      const linkedinUrl = lead.profileUrl ?? null;

      // Skip if no LinkedIn URL (can't deduplicate)
      if (!linkedinUrl) { skipped++; continue; }

      const { data: existing } = await supabaseAdmin
        .from('leads')
        .select('id')
        .eq('linkedin_url', linkedinUrl)
        .single();

      if (existing) { skipped++; continue; }

      const { data: inserted, error } = await supabaseAdmin
        .from('leads')
        .insert({
          full_name: fullName,
          title: lead.headline ?? null,
          company: lead.companyName ?? null,
          company_website: lead.companyWebsite ?? null,
          linkedin_url: linkedinUrl,
          email: lead.email ?? null,
          phone: lead.phone ?? null,
          location: lead.location ?? 'Qatar',
        })
        .select()
        .single();

      if (error || !inserted) { skipped++; continue; }
      scraped++;

      // Enrich with Firecrawl if company website available
      if (lead.companyWebsite) {
        const summary = await enrichCompanyWebsite(lead.companyWebsite);
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
