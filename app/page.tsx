'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, RefreshCw, Users, Zap, Calendar, TrendingUp, PhoneCall, CalendarCheck } from 'lucide-react';
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
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
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

  // Fetch all leads for stats
  useEffect(() => {
    fetch('/api/leads').then(r => r.json()).then(d => setAllLeads(d.leads ?? []));
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  useEffect(() => {
    async function checkAndScrape() {
      const res = await fetch('/api/leads?status=Untouched&count_only=true');
      if (!res.ok) return;
      const { count } = await res.json();
      if (count < 20) {
        toast.info('Running auto-scrape (50 leads)...');
        fetch('/api/scrape', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ count: 50 }) })
          .then(r => r.json()).then(d => { if (d.scraped > 0) { toast.success(`Auto-scraped ${d.scraped} new leads`); fetchLeads(); } });
      }
    }
    checkAndScrape();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetch('/api/calendar/slots?days=1').then(r => setCalendarConnected(r.ok)).catch(() => setCalendarConnected(false));
  }, []);

  function handleStatusChange(id: string, status: string) {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    setAllLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
  }

  // Stats
  const stats = {
    total: allLeads.length,
    called: allLeads.filter(l => l.status === 'Called').length,
    followUp: allLeads.filter(l => l.status === 'Follow-up').length,
    booked: allLeads.filter(l => l.status === 'Meeting Booked').length,
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#ECEEE8]">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-[#E8EAE4] shadow-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#3462EE] rounded-xl flex items-center justify-center shadow-sm">
            <span className="text-white text-sm font-bold">C</span>
          </div>
          <div>
            <h1 className="font-semibold text-[#121721] text-sm leading-tight">CITS CRM</h1>
            <p className="text-xs text-[#9CA3AF] leading-tight">Qatar Outreach</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/calendar"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              calendarConnected
                ? 'bg-[#E6F4F1] text-[#2A7A6B] border-[#4A91A8]/30'
                : 'bg-[#F8F9F6] text-[#6B7280] border-[#E8EAE4] hover:border-[#4A91A8] hover:text-[#4A91A8]'
            }`}>
            <Calendar size={12} />
            {calendarConnected ? 'Calendar ✓' : 'Connect Calendar'}
          </Link>

          <Link href="/scrape"
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#3462EE] hover:bg-[#2850CC] text-white rounded-xl text-xs font-semibold transition-all shadow-sm">
            <Zap size={12} /> Scrape Leads
          </Link>

          <button onClick={fetchLeads}
            className="w-8 h-8 rounded-xl bg-[#F8F9F6] hover:bg-[#F0F1ED] border border-[#E8EAE4] flex items-center justify-center text-[#9CA3AF] hover:text-[#6B7280] transition-all">
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </header>

      {/* Stats row */}
      <div className="flex gap-3 px-6 py-4 flex-shrink-0">
        {[
          { label: 'Total Leads', value: stats.total, icon: Users, color: 'bg-[#121721] text-white', iconBg: 'bg-white/10' },
          { label: 'Called', value: stats.called, icon: PhoneCall, color: 'bg-[#3462EE] text-white', iconBg: 'bg-white/20' },
          { label: 'Follow-up', value: stats.followUp, icon: TrendingUp, color: 'bg-[#EFE347] text-[#121721]', iconBg: 'bg-[#121721]/10' },
          { label: 'Meetings', value: stats.booked, icon: CalendarCheck, color: 'bg-[#4A91A8] text-white', iconBg: 'bg-white/20' },
        ].map(({ label, value, icon: Icon, color, iconBg }) => (
          <div key={label} className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl flex-1 ${color} shadow-sm`}>
            <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
              <Icon size={16} />
            </div>
            <div>
              <p className="text-2xl font-bold leading-tight">{value}</p>
              <p className="text-xs opacity-70 leading-tight">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter + search */}
      <div className="flex items-center gap-3 px-6 pb-3 flex-shrink-0">
        <div className="flex bg-white rounded-xl border border-[#E8EAE4] p-1 shadow-sm overflow-x-auto">
          {STATUS_TABS.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                activeTab === tab
                  ? 'bg-[#121721] text-white shadow-sm'
                  : 'text-[#6B7280] hover:text-[#374151] hover:bg-[#F8F9F6]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2 bg-white border border-[#E8EAE4] rounded-xl px-3.5 py-2 shadow-sm">
          <Search size={13} className="text-[#C4C9BE]" />
          <input type="text" placeholder="Search name or company..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm text-[#374151] placeholder-[#C4C9BE] outline-none w-52" />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden px-6 pb-6 gap-4">
        {/* Table card */}
        <div className="flex-1 bg-white rounded-2xl border border-[#E8EAE4] overflow-y-auto shadow-sm px-6 py-4">
          {loading ? (
            <div className="space-y-3 pt-2">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-14 bg-[#F8F9F6] rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <LeadsTable leads={leads} onSelectLead={setSelectedId} selectedId={selectedId} />
          )}
        </div>

        {/* Side panel */}
        {selectedId && (
          <div className="w-[420px] flex-shrink-0 bg-white rounded-2xl border border-[#E8EAE4] overflow-hidden shadow-sm flex flex-col">
            <LeadPanel key={selectedId} leadId={selectedId}
              onClose={() => setSelectedId(null)} onStatusChange={handleStatusChange} />
          </div>
        )}
      </div>
    </div>
  );
}
