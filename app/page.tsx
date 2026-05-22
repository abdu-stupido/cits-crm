'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, RefreshCw, Users, Zap, Calendar } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { LeadsTable } from '@/components/LeadsTable';
import { LeadPanel } from '@/components/LeadPanel';

const STATUS_TABS = ['All', 'Untouched', 'Called', 'Follow-up', 'Meeting Booked', 'Not Interested', 'Dead'];

interface Lead {
  id: string;
  full_name: string | null;
  title: string | null;
  company: string | null;
  industry: string | null;
  status: string;
  updated_at: string;
  linkedin_url: string | null;
  lead_notes: { count: number }[];
}

export default function CRMDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [calendarConnected, setCalendarConnected] = useState<boolean | null>(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeTab !== 'All') params.set('status', activeTab);
    if (search) params.set('search', search);
    const res = await fetch(`/api/leads?${params}`);
    if (res.ok) {
      const { leads: data } = await res.json();
      setLeads(data ?? []);
    }
    setLoading(false);
  }, [activeTab, search]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Auto-scrape when untouched leads drop below 20
  useEffect(() => {
    async function checkAndScrape() {
      const res = await fetch('/api/leads?status=Untouched&count_only=true');
      if (!res.ok) return;
      const { count } = await res.json();
      if (count < 20) {
        toast.info('Running auto-scrape (50 leads)...');
        fetch('/api/scrape', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ count: 50 }),
        }).then((r) => r.json()).then((d) => {
          if (d.scraped > 0) {
            toast.success(`Auto-scraped ${d.scraped} new leads`);
            fetchLeads();
          }
        });
      }
    }
    checkAndScrape();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check calendar connection
  useEffect(() => {
    fetch('/api/calendar/slots?days=1')
      .then((r) => { setCalendarConnected(r.ok); })
      .catch(() => setCalendarConnected(false));
  }, []);

  function handleStatusChange(id: string, status: string) {
    setLeads((prev) => prev.map((l) => l.id === id ? { ...l, status } : l));
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-slate-700 bg-[#1E293B] flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">C</span>
          </div>
          <div>
            <h1 className="font-semibold text-slate-100 text-sm">CITS CRM</h1>
            <p className="text-xs text-slate-500">Qatar Outreach</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Users size={13} />
            <span>{leads.length} leads</span>
          </div>

          <Link
            href="/calendar"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              calendarConnected
                ? 'bg-green-900/40 text-green-400 border border-green-800/40'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <Calendar size={13} />
            {calendarConnected ? 'Calendar Connected' : 'Connect Calendar'}
          </Link>

          <Link
            href="/scrape"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors"
          >
            <Zap size={13} /> Scrape Leads
          </Link>

          <button
            onClick={fetchLeads}
            className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </header>

      {/* Filter bar */}
      <div className="flex items-center gap-4 px-6 py-3 border-b border-slate-800 flex-shrink-0">
        <div className="flex gap-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5">
          <Search size={13} className="text-slate-500" />
          <input
            type="text"
            placeholder="Search name or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm text-slate-200 placeholder-slate-500 outline-none w-52"
          />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Table */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="space-y-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-12 bg-slate-800 rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <LeadsTable
              leads={leads}
              onSelectLead={setSelectedId}
              selectedId={selectedId}
            />
          )}
        </div>

        {/* Side panel */}
        {selectedId && (
          <LeadPanel
            key={selectedId}
            leadId={selectedId}
            onClose={() => setSelectedId(null)}
            onStatusChange={handleStatusChange}
          />
        )}
      </div>
    </div>
  );
}
