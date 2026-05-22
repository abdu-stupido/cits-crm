import Link from 'next/link';
import { ArrowLeft, Zap } from 'lucide-react';
import { ScrapeControls } from '@/components/ScrapeControls';

export default function ScrapePage() {
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="glass-strong rounded-3xl px-6 py-4 flex items-center gap-3">
          <Link href="/" className="w-8 h-8 glass rounded-2xl flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors">
            <ArrowLeft size={14} />
          </Link>
          <div className="w-8 h-8 rounded-2xl bg-[#3462EE] flex items-center justify-center">
            <Zap size={14} className="text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-slate-800 text-sm">Scrape New Leads</h1>
            <p className="text-[10px] text-slate-400 font-light">LinkedIn · Qatar</p>
          </div>
        </div>

        <p className="text-sm text-slate-500 font-light glass rounded-2xl px-5 py-3.5">
          Pulls qualified leads from LinkedIn and automatically enriches each one with company intel via Firecrawl. Duplicates are skipped automatically.
        </p>

        <ScrapeControls />
      </div>
    </div>
  );
}
