'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Play, Loader2, CheckCircle2, X } from 'lucide-react';

const PRESET_QUERIES = [
  'IT company',
  'IT solutions provider',
  'technology services',
  'software company',
  'facility management',
  'facilities services',
  'hospitality management',
  'hotel management',
  'healthcare services',
  'real estate agency',
  'construction company',
  'education center',
  'financial services',
  'oil and gas services',
];

const LOCATIONS = ['Qatar', 'Doha', 'Al Wakrah', 'Al Khor', 'Lusail'];
const QUANTITIES = [25, 50, 100, 200];

interface ScrapeResult { scraped: number; enriched: number; skipped: number; timestamp: string; }

export function ScrapeControls() {
  const [selectedQueries, setSelectedQueries] = useState<string[]>(['IT company', 'technology services', 'facility management']);
  const [customQuery, setCustomQuery] = useState('');
  const [location, setLocation] = useState('Qatar');
  const [quantity, setQuantity] = useState(50);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<ScrapeResult[]>([]);

  function toggleQuery(q: string) {
    setSelectedQueries(prev => prev.includes(q) ? prev.filter(x => x !== q) : [...prev, q]);
  }

  function addCustomQuery() {
    const q = customQuery.trim();
    if (!q || selectedQueries.includes(q)) return;
    setSelectedQueries(prev => [...prev, q]);
    setCustomQuery('');
  }

  async function handleScrape() {
    if (selectedQueries.length === 0) { toast.error('Select at least one search query'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: quantity, searchQueries: selectedQueries, location }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setHistory(prev => [{
        scraped: data.scraped, enriched: data.enriched, skipped: data.skipped,
        timestamp: new Date().toLocaleString(),
      }, ...prev].slice(0, 5));
      toast.success(`Scraped ${data.scraped} leads, enriched ${data.enriched}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Scrape failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Search queries */}
      <div className="glass rounded-3xl p-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-0.5">Search Queries</h3>
        <p className="text-xs text-slate-400 font-light mb-4">
          What to search on Google Maps — each query runs separately
        </p>

        {/* Preset tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {PRESET_QUERIES.map(q => (
            <button key={q} onClick={() => toggleQuery(q)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
                selectedQueries.includes(q)
                  ? 'bg-[#3462EE] text-white border-[#3462EE] shadow-sm'
                  : 'glass text-slate-500 hover:bg-white/60 hover:text-slate-700'
              }`}>
              {q}
            </button>
          ))}
        </div>

        {/* Custom query input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={customQuery}
            onChange={e => setCustomQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCustomQuery()}
            placeholder="Add custom query (e.g. logistics company)..."
            className="flex-1 bg-white/50 border border-white/60 rounded-2xl px-4 py-2.5 text-sm text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-[#3462EE]/20 focus:border-[#3462EE]/40 backdrop-blur-sm font-light"
          />
          <button onClick={addCustomQuery}
            className="px-4 py-2.5 bg-[#0F1623] hover:bg-slate-700 text-white text-xs font-medium rounded-2xl transition-all">
            Add
          </button>
        </div>

        {/* Selected queries summary */}
        {selectedQueries.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {selectedQueries.map(q => (
              <span key={q} className="flex items-center gap-1.5 pl-3 pr-2 py-1 glass rounded-full text-xs text-slate-600 border-white/50">
                {q}
                <button onClick={() => toggleQuery(q)} className="text-slate-400 hover:text-rose-500 transition-colors">
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Location + Quantity row */}
      <div className="flex gap-4">
        {/* Location */}
        <div className="glass rounded-3xl p-6 flex-1">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Location</h3>
          <div className="flex flex-wrap gap-2">
            {LOCATIONS.map(loc => (
              <button key={loc} onClick={() => setLocation(loc)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  location === loc
                    ? 'bg-[#0F1623] text-white border-[#0F1623] shadow-sm'
                    : 'glass text-slate-500 hover:bg-white/60'
                }`}>
                {loc}
              </button>
            ))}
          </div>
        </div>

        {/* Quantity */}
        <div className="glass rounded-3xl p-6 flex-1">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">How many leads?</h3>
          <div className="flex gap-2">
            {QUANTITIES.map(q => (
              <button key={q} onClick={() => setQuantity(q)}
                className={`flex-1 py-2.5 rounded-2xl text-sm font-semibold border transition-all ${
                  quantity === q
                    ? 'bg-[#0F1623] text-white border-[#0F1623] shadow-sm'
                    : 'glass text-slate-500 hover:bg-white/60 hover:text-slate-800'
                }`}>
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary + CTA */}
      <div className="glass rounded-3xl p-5 flex items-center justify-between gap-4">
        <div className="text-sm text-slate-500 font-light">
          Scraping <span className="font-semibold text-slate-700">{quantity} places</span> across{' '}
          <span className="font-semibold text-slate-700">{selectedQueries.length} search{selectedQueries.length !== 1 ? 'es' : ''}</span> in{' '}
          <span className="font-semibold text-slate-700">{location}</span>
        </div>
        <button onClick={handleScrape} disabled={loading || selectedQueries.length === 0}
          className="flex items-center gap-2 px-6 py-3 bg-[#3462EE] hover:bg-[#2850CC] disabled:opacity-40 text-white font-semibold rounded-2xl transition-all shadow-sm text-sm whitespace-nowrap">
          {loading ? <><Loader2 size={15} className="animate-spin" /> Scraping...</> : <><Play size={14} /> Start Scrape</>}
        </button>
      </div>

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
