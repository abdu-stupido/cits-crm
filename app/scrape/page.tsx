import Link from 'next/link';
import { ArrowLeft, Zap } from 'lucide-react';
import { ScrapeControls } from '@/components/ScrapeControls';

export default function ScrapePage() {
  return (
    <div className="min-h-screen bg-[#0F172A]">
      <header className="flex items-center gap-4 px-6 py-4 border-b border-slate-700 bg-[#1E293B]">
        <Link href="/" className="text-slate-400 hover:text-slate-200 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex items-center gap-2">
          <Zap size={18} className="text-blue-400" />
          <h1 className="font-semibold text-slate-100">Scrape New Leads</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <p className="text-sm text-slate-400 mb-8">
          Pull qualified leads from LinkedIn for Qatar. Leads are automatically enriched with company info via Firecrawl.
          Duplicates are skipped automatically.
        </p>
        <ScrapeControls />
      </main>
    </div>
  );
}
