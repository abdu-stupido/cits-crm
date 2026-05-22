'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, RefreshCw, Users, Zap, Calendar, PhoneCall, TrendingUp, CalendarCheck, Phone, Mail, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { LeadsTable } from '@/components/LeadsTable';
import { LeadPanel } from '@/components/LeadPanel';

const STATUS_TABS = ['All', 'Untouched', 'Called', 'Follow-up', 'Meeting Booked', 'Not Interested', 'Dead'];

interface Lead {
  id: string; full_name: string | null; title: string | null; company: string | null;
  industry: string | null; status: string; updated_at: string; linkedin_url: string | null;
  lead_notes: { count: number }[];
}

export default function CRMDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [hasPhone, setHasPhone] = useState(false);
  const [hasEmail, setHasEmail] = useState(false);
  const [enriched, setEnriched] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [calendarConnected, setCalendarConnected] = useState<boolean | null>(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeTab !== 'All') params.set('status', activeTab);
    if (search) params.set('search', search);
    if (hasPhone) params.set('has_phone', 'true');
    if (hasEmail) params.set('has_email', 'true');
    if (enriched) params.set('enriched', 'true');
    const res = await fetch(`/api/leads?${params}`);
    if (res.ok) { const { leads: d } = await res.json(); setLeads(d ?? []); }
    setLoading(false);
  }, [activeTab, search, hasPhone, hasEmail, enriched]);

  useEffect(() => { fetch('/api/leads').then(r => r.json()).then(d => setAllLeads(d.leads ?? [])); }, []);
  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  useEffect(() => {
    async function checkAutoScrape() {
      const res = await fetch('/api/leads?status=Untouched&count_only=true');
      if (!res.ok) return;
      const { count } = await res.json();
      if (count < 20) {
        toast.info('Auto-scraping 50 leads...');
        fetch('/api/scrape', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ count: 50 }) })
          .then(r => r.json()).then(d => { if (d.scraped > 0) { toast.success(`Auto-scraped ${d.scraped} leads`); fetchLeads(); } });
      }
    }
    checkAutoScrape();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetch('/api/calendar/slots?days=1').then(r => setCalendarConnected(r.ok)).catch(() => setCalendarConnected(false));
  }, []);

  function handleStatusChange(id: string, status: string) {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    setAllLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
  }

  const stats = {
    total: allLeads.length,
    called: allLeads.filter(l => l.status === 'Called').length,
    followUp: allLeads.filter(l => l.status === 'Follow-up').length,
    booked: allLeads.filter(l => l.status === 'Meeting Booked').length,
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden p-4 gap-4">

      {/* Top bar */}
      <header className="glass-strong rounded-3xl flex items-center justify-between px-6 py-3.5 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#0F1623] rounded-2xl flex items-center justify-center shadow-sm">
            <span className="text-white text-sm font-bold">C</span>
          </div>
          <div>
            <h1 className="font-semibold text-slate-800 text-sm leading-tight">CITS CRM</h1>
            <p className="text-[10px] text-slate-400 font-light leading-tight">Qatar Outreach</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="flex items-center gap-2 glass rounded-2xl px-3.5 py-2">
            <Search size={12} className="text-slate-300" />
            <input type="text" placeholder="Search name or company..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="bg-transparent text-sm text-slate-600 placeholder-slate-300 outline-none w-44 font-light" />
          </div>

          <Link href="/calendar"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-medium border transition-all ${
              calendarConnected
                ? 'bg-emerald-50/60 text-emerald-700 border-emerald-100/80'
                : 'glass text-slate-500 hover:bg-white/60'
            }`}>
            <Calendar size={12} />
            {calendarConnected ? 'Calendar ✓' : 'Connect Calendar'}
          </Link>

          <Link href="/scrape"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#3462EE] hover:bg-[#2850CC] text-white rounded-2xl text-xs font-semibold transition-all shadow-sm">
            <Zap size={12} /> Scrape Leads
          </Link>

          <button onClick={fetchLeads}
            className="w-8 h-8 glass rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all">
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </header>

      {/* Stat cards */}
      <div className="flex gap-4 flex-shrink-0">
        {/* Total — dark accent */}
        <div className="glass rounded-3xl px-6 py-5 flex-1 flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-[#0F1623] flex items-center justify-center flex-shrink-0">
            <Users size={16} className="text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800 leading-none">{stats.total}</p>
            <p className="text-xs text-slate-400 font-light mt-1">Total Leads</p>
          </div>
        </div>

        {/* Called — blue accent */}
        <div className="glass rounded-3xl px-6 py-5 flex-1 flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-[#3462EE] flex items-center justify-center flex-shrink-0">
            <PhoneCall size={16} className="text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800 leading-none">{stats.called}</p>
            <p className="text-xs text-slate-400 font-light mt-1">Called</p>
          </div>
        </div>

        {/* Follow-up — yellow accent */}
        <div className="glass rounded-3xl px-6 py-5 flex-1 flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-[#EFE347] flex items-center justify-center flex-shrink-0">
            <TrendingUp size={16} className="text-[#0F1623]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800 leading-none">{stats.followUp}</p>
            <p className="text-xs text-slate-400 font-light mt-1">Follow-up</p>
          </div>
        </div>

        {/* Meetings — teal accent */}
        <div className="glass rounded-3xl px-6 py-5 flex-1 flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-[#4A91A8] flex items-center justify-center flex-shrink-0">
            <CalendarCheck size={16} className="text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800 leading-none">{stats.booked}</p>
            <p className="text-xs text-slate-400 font-light mt-1">Meetings Booked</p>
          </div>
        </div>
      </div>

      {/* Table + panel area */}
      <div className="flex flex-1 gap-4 overflow-hidden min-h-0">
        {/* Table card */}
        <div className="glass rounded-3xl flex-1 overflow-hidden flex flex-col min-w-0">
          {/* Filter tabs */}
          <div className="flex items-center gap-1.5 px-5 pt-4 pb-3 border-b border-white/30 overflow-x-auto flex-shrink-0">
            {STATUS_TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  activeTab === tab
                    ? 'bg-[#0F1623] text-white shadow-sm'
                    : 'text-slate-500 hover:bg-white/40 hover:text-slate-700'
                }`}>
                {tab}
              </button>
            ))}

            <div className="w-px h-4 bg-white/40 mx-1 flex-shrink-0" />

            <button onClick={() => setHasPhone(p => !p)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap border transition-all ${
                hasPhone
                  ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                  : 'text-slate-500 border-transparent hover:bg-white/40 hover:text-slate-700'
              }`}>
              <Phone size={10} /> Has Number
            </button>

            <button onClick={() => setHasEmail(p => !p)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap border transition-all ${
                hasEmail
                  ? 'bg-violet-500 text-white border-violet-500 shadow-sm'
                  : 'text-slate-500 border-transparent hover:bg-white/40 hover:text-slate-700'
              }`}>
              <Mail size={10} /> Has Email
            </button>

            <button onClick={() => setEnriched(p => !p)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap border transition-all ${
                enriched
                  ? 'bg-[#3462EE] text-white border-[#3462EE] shadow-sm'
                  : 'text-slate-500 border-transparent hover:bg-white/40 hover:text-slate-700'
              }`}>
              <Sparkles size={10} /> Enriched
            </button>
          </div>

          {/* Table body */}
          <div className="flex-1 overflow-y-auto px-5 py-3">
            {loading ? (
              <div className="space-y-3 pt-2">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="h-14 glass rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : (
              <LeadsTable leads={leads} onSelectLead={setSelectedId} selectedId={selectedId} />
            )}
          </div>
        </div>

        {/* Lead panel */}
        {selectedId && (
          <div className="w-[540px] flex-shrink-0 overflow-hidden flex flex-col">
            <LeadPanel key={selectedId} leadId={selectedId}
              onClose={() => setSelectedId(null)} onStatusChange={handleStatusChange} />
          </div>
        )}
      </div>
    </div>
  );
}
