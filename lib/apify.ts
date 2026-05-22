import { ApifyClient } from 'apify-client';

const client = new ApifyClient({ token: process.env.APIFY_API_KEY });

export interface GoogleMapsPlace {
  title?: string;
  categoryName?: string;
  address?: string;
  phone?: string;
  phoneUnformatted?: string;
  website?: string;
  url?: string;           // Google Maps URL
  emails?: string[];
  permanentlyClosed?: boolean;
}

export async function scrapeGoogleMapsLeads(
  count: number,
  searchQueries: string[],
  location: string = 'Qatar'
): Promise<GoogleMapsPlace[]> {
  const input = {
    includeWebResults: false,
    language: 'en',
    locationQuery: location,
    maxCrawledPlacesPerSearch: Math.ceil(count / searchQueries.length),
    maxImages: 0,
    scrapeContacts: true,
    scrapeDirectories: false,
    scrapeImageAuthors: false,
    scrapeOrderOnline: false,
    scrapePlaceDetailPage: false,
    scrapeReviewsPersonalData: false,
    scrapeTableReservationProvider: false,
    searchStringsArray: searchQueries,
    skipClosedPlaces: true,
    verifyLeadsEnrichmentEmails: false,
  };

  const run = await client.actor('nwua9Gu5YrADL7ZDj').call(input, { waitSecs: 300 });
  const { items } = await client.dataset(run.defaultDatasetId).listItems();
  return items as GoogleMapsPlace[];
}
