const FIRECRAWL_URL = 'https://api.firecrawl.dev/v1';

export async function enrichCompanyWebsite(url: string): Promise<string | null> {
  try {
    const res = await fetch(`${FIRECRAWL_URL}/scrape`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        formats: ['markdown'],
        onlyMainContent: true,
        maxDepth: 0,
      }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const content: string = data?.data?.markdown ?? '';
    if (!content) return null;

    // Extract a useful 2-3 sentence summary from the top content
    const lines = content
      .split('\n')
      .map((l: string) => l.trim())
      .filter((l: string) => l.length > 40 && !l.startsWith('#') && !l.startsWith('!'));

    return lines.slice(0, 3).join(' ').slice(0, 400) || null;
  } catch {
    return null;
  }
}
