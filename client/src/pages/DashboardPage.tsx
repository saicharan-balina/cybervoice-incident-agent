import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  AlertOctagon,
  Clock,
  Shield,
  ArrowUpRight,
  ShieldAlert,
  Inbox,
  AlertCircle
} from 'lucide-react';
import { IncidentReport, IncidentType, Urgency, Status } from '../types';

export const DashboardPage: React.FC = () => {
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    reviewing: 0,
    resolved: 0,
    highUrgency: 0
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const fetchIncidents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (urgencyFilter !== 'all') params.append('urgency', urgencyFilter);
      if (typeFilter !== 'all') params.append('incidentType', typeFilter);

      const res = await fetch(`/api/incidents?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to load incident reports from database');
      }
      const data = await res.json();
      setIncidents(data.incidents || []);
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (err: any) {
      console.error('Error fetching incidents:', err);
      setError(err.message || 'Error communicating with database');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [statusFilter, urgencyFilter, typeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchIncidents();
  };

  const getUrgencyBadge = (urgency: Urgency) => {
    switch (urgency) {
      case 'critical':
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-red-950 text-red-300 border border-red-800">Critical</span>;
      case 'high':
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-orange-950 text-orange-300 border border-orange-800">High</span>;
      case 'medium':
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-yellow-950 text-yellow-300 border border-yellow-800">Medium</span>;
      default:
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-800 text-slate-300 border border-slate-700">Low</span>;
    }
  };

  const getStatusBadge = (status: Status) => {
    switch (status) {
      case 'new':
        return <span className="px-2.5 py-0.5 text-xs font-mono font-medium rounded-md bg-blue-950 text-blue-300 border border-blue-800">NEW</span>;
      case 'reviewing':
        return <span className="px-2.5 py-0.5 text-xs font-mono font-medium rounded-md bg-purple-950 text-purple-300 border border-purple-800">REVIEWING</span>;
      case 'resolved':
        return <span className="px-2.5 py-0.5 text-xs font-mono font-medium rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800">RESOLVED</span>;
      default:
        return <span className="px-2.5 py-0.5 text-xs font-mono font-medium rounded-md bg-slate-800 text-slate-400 border border-slate-700">ARCHIVED</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Incident Response Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real database records from voice conversations and triage reports.
          </p>
        </div>

        <Link
          to="/assistant"
          className="self-start md:self-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-semibold text-sm shadow-[0_0_15px_rgba(0,210,255,0.3)] transition-all flex items-center space-x-2"
        >
          <ShieldAlert className="w-4 h-4 stroke-[2.5]" />
          <span>Report New Incident</span>
        </Link>
      </div>

      {/* Dynamic Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total */}
        <div className="p-4 rounded-xl glass-card bg-slate-900/60 border border-slate-800">
          <span className="text-xs font-mono text-slate-400 uppercase">Total Reports</span>
          <div className="text-2xl sm:text-3xl font-bold text-white mt-1">{stats.total}</div>
        </div>

        {/* New */}
        <div className="p-4 rounded-xl glass-card bg-slate-900/60 border border-blue-900/40">
          <span className="text-xs font-mono text-blue-400 uppercase">New / Pending</span>
          <div className="text-2xl sm:text-3xl font-bold text-blue-300 mt-1">{stats.new}</div>
        </div>

        {/* Reviewing */}
        <div className="p-4 rounded-xl glass-card bg-slate-900/60 border border-purple-900/40">
          <span className="text-xs font-mono text-purple-400 uppercase">Under Review</span>
          <div className="text-2xl sm:text-3xl font-bold text-purple-300 mt-1">{stats.reviewing}</div>
        </div>

        {/* Resolved */}
        <div className="p-4 rounded-xl glass-card bg-slate-900/60 border border-emerald-900/40">
          <span className="text-xs font-mono text-emerald-400 uppercase">Resolved</span>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-300 mt-1">{stats.resolved}</div>
        </div>

        {/* High/Critical */}
        <div className="p-4 rounded-xl glass-card bg-slate-900/60 border border-red-900/40 col-span-2 lg:col-span-1">
          <span className="text-xs font-mono text-red-400 uppercase">High / Critical</span>
          <div className="text-2xl sm:text-3xl font-bold text-red-300 mt-1">{stats.highUrgency}</div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 rounded-2xl glass-panel border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search incident title or URL..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </form>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="reviewing">Under Review</option>
            <option value="resolved">Resolved</option>
            <option value="archived">Archived</option>
          </select>

          {/* Urgency Filter */}
          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Urgencies</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Incident Categories</option>
            <option value="phishing_email">Phishing Email</option>
            <option value="suspicious_message">Suspicious Message</option>
            <option value="suspicious_url">Suspicious URL</option>
            <option value="scam_call">Scam Call</option>
            <option value="account_compromise">Account Compromise</option>
            <option value="malware_concern">Malware Concern</option>
            <option value="financial_fraud">Financial Fraud</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Incidents Table / List */}
      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/80 text-red-200 text-sm flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="p-16 text-center">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400 font-mono">Querying database records...</p>
        </div>
      ) : incidents.length === 0 ? (
        <div className="p-16 text-center rounded-2xl glass-card bg-slate-900/40 border border-slate-800 space-y-3">
          <Inbox className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Incident Reports Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            The database does not contain any incident records matching your current filter criteria.
          </p>
          <Link
            to="/assistant"
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-300 hover:text-white hover:bg-cyan-900 text-xs font-semibold mt-2"
          >
            <span>Start Voice Reporting</span>
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/70">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Incident Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Urgency</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Risk Flags</th>
                <th className="py-3 px-4">Reported At</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {incidents.map((inc) => (
                <tr key={inc.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <Link
                      to={`/incidents/${inc.id}`}
                      className="font-semibold text-slate-200 hover:text-cyan-400 flex items-center gap-1.5"
                    >
                      <span>{inc.title}</span>
                    </Link>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">{inc.id}</p>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-300">
                    {inc.incidentType.replace('_', ' ')}
                  </td>

                  <td className="py-3.5 px-4">
                    {getUrgencyBadge(inc.urgency)}
                  </td>

                  <td className="py-3.5 px-4">
                    {getStatusBadge(inc.status)}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-1">
                      {inc.clickedLink && (
                        <span className="px-1.5 py-0.5 text-[10px] rounded bg-amber-950 text-amber-300 border border-amber-800" title="Link Clicked">
                          Link
                        </span>
                      )}
                      {inc.sharedCredentials && (
                        <span className="px-1.5 py-0.5 text-[10px] rounded bg-red-950 text-red-300 border border-red-800" title="Credentials Shared">
                          Creds
                        </span>
                      )}
                      {inc.sharedFinancialInformation && (
                        <span className="px-1.5 py-0.5 text-[10px] rounded bg-red-950 text-red-300 border border-red-800" title="Financial Data Entered">
                          Financial
                        </span>
                      )}
                      {!inc.clickedLink && !inc.sharedCredentials && !inc.sharedFinancialInformation && (
                        <span className="text-[11px] text-slate-500">None detected</span>
                      )}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                    {new Date(inc.createdAt).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <Link
                      to={`/incidents/${inc.id}`}
                      className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-400 text-[11px] font-medium transition-all"
                    >
                      <span>Review</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
