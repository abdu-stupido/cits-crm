'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Play, Loader2, CheckCircle2 } from 'lucide-react';

const INDUSTRIES = ['Hotels & Hospitality','Healthcare','Real Estate','Construction','Education','Government','Retail','Technology','Finance','Oil & Gas'];
const JOB_TITLES = ['IT Manager','Operations Manager','Facility Manager','CTO','CEO','General Manager','Head of IT','Director of Operations'];
const QUANTITIES = [10, 25, 50, 100];

interface ScrapeResult { scraped: number; enriched: number; skipped: number; timestamp: string; }

export function ScrapeControls() {
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedTitles, setSelectedTitles] = useState<string[]>(JOB_TITLES);
  const [quantity, setQuantity] = useState(50);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<ScrapeResult[]>([]);

  function toggle<T>(arr: T[], item: T, setter: (v: T[]) => void) {
    setter(arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item]);
  }

  async function handleScrape() {
    setLoading(true);
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: quantity, industries: selectedIndustries, jobTitles: selectedTitles.length > 0 ? selectedTitles : JOB_TITLES }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setHistory(prev => [{ scraped: data.scraped, enriched: data.enriched, skipped: data.skipped, timestamp: new Date().toLocaleString() }, ...prev].slice(0, 5));
      toast.success(`Scraped ${data.scraped} leads, enriched ${data.enriched}`);
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Scrape failed'); }
    finally { setLoading(false); }
  }

  return (
    <div className="space-y-5">
      {/* Industries */}
      <div className="glass rounded-3xl p-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-0.5">Industries</h3>
        <p className="text-xs text-slate-400 font-light mb-4">Filter by sector — leave blank for all</p>
        <div className="flex flex-wrap gap-2">
          {INDUSTRIES.map(ind => (
            <button key={ind} onClick={() => toggle(selectedIndustries, ind, setSelectedIndustries)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
                selectedIndustries.includes(ind)
                  ? 'bg-[#3462EE] text-white border-[#3462EE] shadow-sm'
                  : 'glass text-slate-500 hover:bg-white/60 hover:text-slate-700'
              }`}>
              {ind}
            </button>
          ))}
        </div>
      </div>

      {/* Job titles */}
      <div className="glass rounded-3xl p-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-0.5">Target Titles</h3>
        <p className="text-xs text-slate-400 font-light mb-4">Click to deselect titles you don't need</p>
        <div className="flex flex-wrap gap-2">
          {JOB_TITLES.map(title => (
            <button key={title} onClick={() => toggle(selectedTitles, title, setSelectedTitles)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
                selectedTitles.includes(title)
                  ? 'bg-[#0F1623] text-white border-[#0F1623]'
                  : 'glass text-slate-300 line-through hover:bg-white/30'
              }`}>
              {title}
            </button>
          ))}
        </div>
      </div>

      {/* Quantity */}
      <div className="glass rounded-3xl p-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">How many leads?</h3>
        <div className="flex gap-3">
          {QUANTITIES.map(q => (
            <button key={q} onClick={() => setQuantity(q)}
              className={`flex-1 py-3 rounded-2xl text-sm font-semibold border transition-all ${
                quantity === q
                  ? 'bg-[#0F1623] text-white border-[#0F1623] shadow-sm'
                  : 'glass text-slate-500 hover:bg-white/60 hover:text-slate-800'
              }`}>
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* CTA */}
      <button onClick={handleScrape} disabled={loading}
        className="w-full flex items-center justify-center gap-2.5 py-4 bg-[#3462EE] hover:bg-[#2850CC] disabled:opacity-40 text-white font-semibold rounded-3xl transition-all shadow-sm text-sm">
        {loading ? <><Loader2 size={16} className="animate-spin" /> Scraping LinkedIn...</> : <><Play size={15} /> Start Scrape — {quantity} leads</>}
      </button>

      {/* History */}
      {history.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Recent Scrapes</p>
          <div className="space-y-2">
            {history.map((h, i) => (
              <div key={i} className="glass rounded-2xl px-4 py-3.5 flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  <span className="text-sm font-semibold text-slate-700">{h.scraped} added</span>
                  <span className="text-xs text-slate-400 font-light">· {h.enriched} enriched · {h.skipped} skipped</span>
                </div>
                <span className="text-xs text-slate-300 font-light">{h.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
