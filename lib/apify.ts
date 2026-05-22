import { ApifyClient } from 'apify-client';

const client = new ApifyClient({ token: process.env.APIFY_API_KEY });

export interface ApifyLead {
  fullName?: string;
  firstName?: string;
  lastName?: string;
  headline?: string;
  location?: string;
  profileUrl?: string;
  companyName?: string;
  companyWebsite?: string;
  email?: string;
  phone?: string;
}

export async function scrapeLinkedInLeads(
  count: number,
  industries: string[],
  jobTitles: string[]
): Promise<ApifyLead[]> {
  const titleQuery = jobTitles.join(' OR ');
  const industryQuery = industries.length > 0 ? industries.join(' OR ') : '';

  const input = {
    searchQueries: [
      `(${titleQuery}) ${industryQuery} Qatar`.trim(),
    ],
    maxResults: count,
    country: 'QA',
  };

  const run = await client.actor('bebity/linkedin-people-search-scraper').call(input, {
    waitSecs: 300,
  });

  const { items } = await client.dataset(run.defaultDatasetId).listItems();
  return items as ApifyLead[];
}
