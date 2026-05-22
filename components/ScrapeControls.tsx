'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Play, Loader2, CheckCircle2 } from 'lucide-react';

const INDUSTRIES = [
  'Hotels & Hospitality', 'Healthcare', 'Real Estate', 'Construction',
  'Education', 'Government', 'Retail', 'Technology', 'Finance', 'Oil & Gas',
];

const JOB_TITLES = [
  'IT Manager', 'Operations Manager', 'Facility Manager', 'CTO',
  'CEO', 'General Manager', 'Head of IT', 'Director of Operations',
];

const QUANTITIES = [10, 25, 50, 100];

interface ScrapeResult { scraped: number; enriched: number; skipped: number; timestamp: string; }

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
        body: JSON.stringify({ count: quantity, industries: selectedIndustries, jobTitles: selectedTitles.length > 0 ? selectedTitles : JOB_TITLES }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setHistory((prev) => [{ scraped: data.scraped, enriched: data.enriched, skipped: data.skipped, timestamp: new Date().toLocaleString() }, ...prev].slice(0, 5));
      toast.success(`Scraped ${data.scraped} leads, enriched ${data.enriched}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Scrape failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Industries */}
      <div className="bg-white rounded-2xl border border-[#E8EAE4] p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-[#121721] mb-1">Industries</h3>
        <p className="text-xs text-[#9CA3AF] mb-4">Filter by industry (leave blank for all)</p>
        <div className="flex flex-wrap gap-2">
          {INDUSTRIES.map((ind) => (
            <button key={ind} onClick={() => toggleItem(selectedIndustries, ind, setSelectedIndustries)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
                selectedIndustries.includes(ind)
                  ? 'bg-[#3462EE] text-white border-[#3462EE] shadow-sm'
                  : 'bg-[#F8F9F6] text-[#6B7280] border-[#E8EAE4] hover:border-[#3462EE] hover:text-[#3462EE]'
              }`}
            >
              {ind}
            </button>
          ))}
        </div>
      </div>

      {/* Job titles */}
      <div className="bg-white rounded-2xl border border-[#E8EAE4] p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-[#121721] mb-1">Target Titles</h3>
        <p className="text-xs text-[#9CA3AF] mb-4">Uncheck titles you don't want</p>
        <div className="flex flex-wrap gap-2">
          {JOB_TITLES.map((title) => (
            <button key={title} onClick={() => toggleItem(selectedTitles, title, setSelectedTitles)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
                selectedTitles.includes(title)
                  ? 'bg-[#121721] text-white border-[#121721]'
                  : 'bg-[#F8F9F6] text-[#9CA3AF] border-[#E8EAE4] line-through'
              }`}
            >
              {title}
            </button>
          ))}
        </div>
      </div>

      {/* Quantity */}
      <div className="bg-white rounded-2xl border border-[#E8EAE4] p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-[#121721] mb-4">How many leads?</h3>
        <div className="flex gap-3">
          {QUANTITIES.map((q) => (
            <button key={q} onClick={() => setQuantity(q)}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold border transition-all ${
                quantity === q
                  ? 'bg-[#121721] text-white border-[#121721] shadow-sm'
                  : 'bg-[#F8F9F6] text-[#6B7280] border-[#E8EAE4] hover:border-[#121721] hover:text-[#121721]'
              }`}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* CTA */}
      <button onClick={handleScrape} disabled={loading}
        className="w-full flex items-center justify-center gap-2.5 py-4 bg-[#3462EE] hover:bg-[#2850CC] disabled:bg-[#F3F4F0] disabled:text-[#C4C9BE] text-white font-semibold rounded-2xl transition-all shadow-sm text-sm"
      >
        {loading ? <><Loader2 size={16} className="animate-spin" /> Scraping LinkedIn...</> : <><Play size={16} /> Start Scrape — {quantity} leads</>}
      </button>

      {/* History */}
      {history.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3">Recent Scrapes</h3>
          <div className="space-y-2">
            {history.map((h, i) => (
              <div key={i} className="bg-white rounded-xl px-4 py-3 border border-[#E8EAE4] flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#4A91A8]" />
                  <span className="text-sm font-medium text-[#121721]">{h.scraped} added</span>
                  <span className="text-sm text-[#9CA3AF]">· {h.enriched} enriched · {h.skipped} skipped</span>
                </div>
                <span className="text-xs text-[#C4C9BE]">{h.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
