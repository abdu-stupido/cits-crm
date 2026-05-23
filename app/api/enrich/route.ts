import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { enrichCompanyWebsite } from '@/lib/firecrawl';

export const maxDuration = 60;

export async function POST() {
  // Fetch up to 20 leads that have a website but haven't been enriched yet
  const { data: leads, error } = await supabaseAdmin
    .from('leads')
    .select('id, company_website')
    .not('company_website', 'is', null)
    .neq('company_website', '')
    .is('enriched_at', null)
    .limit(20);

  if (error || !leads || leads.length === 0) {
    return NextResponse.json({ enriched: 0 });
  }

  // Run Firecrawl in parallel across all leads
  const results = await Promise.allSettled(
    leads.map(async (lead) => {
      const summary = await enrichCompanyWebsite(lead.company_website!);
      if (!summary) return;
      await supabaseAdmin
        .from('leads')
        .update({ company_summary: summary, enriched_at: new Date().toISOString() })
        .eq('id', lead.id);
    })
  );

  const enriched = results.filter(r => r.status === 'fulfilled').length;
  return NextResponse.json({ enriched });
}
