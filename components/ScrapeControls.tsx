'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Play, Loader2 } from 'lucide-react';

const INDUSTRIES = [
  'Hotels & Hospitality',
  'Healthcare',
  'Real Estate',
  'Construction',
  'Education',
  'Government',
  'Retail',
  'Technology',
  'Finance',
  'Oil & Gas',
];

const JOB_TITLES = [
  'IT Manager',
  'Operations Manager',
  'Facility Manager',
  'CTO',
  'CEO',
  'General Manager',
  'Head of IT',
  'Director of Operations',
];

const QUANTITIES = [10, 25, 50, 100];

interface ScrapeResult {
  scraped: number;
  enriched: number;
  skipped: number;
  timestamp: string;
}

export function ScrapeControls() {
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedTitles, setSelectedTitles] = useState<string[]>(JOB_TITLES);
  const [quantity, setQuantity] = useState(50);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<ScrapeResult[]>([]);

  function toggleItem<T>(arr: T[], item: T, setter: (v: T[]) => void) {
    setter(arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item]);
  }

  async function handleScrape() {
    setLoading(true);
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          count: quantity,
          industries: selectedIndustries,
          jobTitles: selectedTitles.length > 0 ? selectedTitles : JOB_TITLES,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const result: ScrapeResult = {
        scraped: data.scraped,
        enriched: data.enriched,
        skipped: data.skipped,
        timestamp: new Date().toLocaleString(),
      };
      setHistory((prev) => [result, ...prev].slice(0, 5));
      toast.success(`Scraped ${data.scraped} leads, enriched ${data.enriched}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Scrape failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Industries */}
      <div>
        <p className="text-sm font-medium text-slate-300 mb-3">Industries (optional filter)</p>
        <div className="flex flex-wrap gap-2">
          {INDUSTRIES.map((ind) => (
            <button
              key={ind}
              onClick={() => toggleItem(selectedIndustries, ind, setSelectedIndustries)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedIndustries.includes(ind)
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {ind}
            </button>
          ))}
        </div>
        {selectedIndustries.length === 0 && (
          <p className="text-xs text-slate-500 mt-2">No filter — all industries will be scraped</p>
        )}
      </div>

      {/* Job titles */}
      <div>
        <p className="text-sm font-medium text-slate-300 mb-3">Target Job Titles</p>
        <div className="flex flex-wrap gap-2">
          {JOB_TITLES.map((title) => (
            <button
              key={title}
              onClick={() => toggleItem(selectedTitles, title, setSelectedTitles)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedTitles.includes(title)
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {title}
            </button>
          ))}
        </div>
      </div>

      {/* Quantity */}
      <div>
        <p className="text-sm font-medium text-slate-300 mb-3">How many leads?</p>
        <div className="flex gap-2">
          {QUANTITIES.map((q) => (
            <button
              key={q}
              onClick={() => setQuantity(q)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                quantity === q
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Launch */}
      <button
        onClick={handleScrape}
        disabled={loading}
        className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium rounded-lg transition-colors"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Scraping...
          </>
        ) : (
          <>
            <Play size={16} /> Start Scrape
          </>
        )}
      </button>

      {/* History */}
      {history.length > 0 && (
        <div>
          <p className="text-sm font-medium text-slate-400 mb-3">Recent Scrapes</p>
          <div className="space-y-2">
            {history.map((h, i) => (
              <div key={i} className="bg-slate-800 rounded-lg px-4 py-3 flex justify-between items-center">
                <div className="text-sm">
                  <span className="text-green-400 font-medium">{h.scraped} added</span>
                  <span className="text-slate-400 ml-2">· {h.enriched} enriched · {h.skipped} skipped</span>
                </div>
                <span className="text-xs text-slate-500">{h.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
