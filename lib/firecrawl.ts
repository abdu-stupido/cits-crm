import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function enrichCompanyWebsite(url: string): Promise<string | null> {
  try {
    // Step 1: Scrape the website
    const res = await fetch('https://api.firecrawl.dev/v2/scrape', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        formats: ['markdown'],
        onlyMainContent: true,
      }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const content: string = data?.data?.markdown ?? '';
    if (!content || content.length < 100) return null;

    // Step 2: Generate a sales brief using Claude
    const trimmed = content.slice(0, 4000);

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: `You are a B2B sales intelligence assistant for CITS Qatar, an IT services and solutions company.

Based on this company's website content, write a 100-120 word sales brief for a cold caller. Cover:
- What the company does and their core business
- Industry/sector and apparent company size
- Any technology needs or IT gaps you can infer
- 1-2 specific talking points for the CITS sales rep to use

Be specific, factual, and conversational. No bullet points — write in flowing sentences. No fluff or filler.

Website content:
${trimmed}`,
      }],
    });

    const brief = (message.content[0] as { type: string; text: string }).text?.trim();
    return brief || null;
  } catch {
    return null;
  }
}
