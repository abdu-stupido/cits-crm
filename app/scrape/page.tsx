import Link from 'next/link';
import { ArrowLeft, Zap } from 'lucide-react';
import { ScrapeControls } from '@/components/ScrapeControls';

export default function ScrapePage() {
  return (
    <div className="min-h-screen bg-[#ECEEE8]">
      <header className="bg-white border-b border-[#E8EAE4] shadow-sm">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link href="/" className="w-8 h-8 rounded-xl bg-[#F8F9F6] hover:bg-[#F0F1ED] border border-[#E8EAE4] flex items-center justify-center text-[#6B7280] hover:text-[#374151] transition-all">
            <ArrowLeft size={15} />
          </Link>
          <div className="w-8 h-8 rounded-xl bg-[#EBF0FD] flex items-center justify-center">
            <Zap size={15} className="text-[#3462EE]" />
          </div>
          <div>
            <h1 className="font-semibold text-[#121721] text-sm">Scrape New Leads</h1>
            <p className="text-xs text-[#9CA3AF]">LinkedIn · Qatar</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <p className="text-sm text-[#6B7280] mb-8 bg-white rounded-xl border border-[#E8EAE4] px-4 py-3 shadow-sm">
          Pulls qualified leads from LinkedIn and automatically enriches each one with company intel via Firecrawl. Duplicates are skipped.
        </p>
        <ScrapeControls />
      </main>
    </div>
  );
}
