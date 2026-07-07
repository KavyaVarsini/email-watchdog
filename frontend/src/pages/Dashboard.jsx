import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  RefreshCw, Search, Mail, Send, AlertCircle, CheckCircle2, 
  XCircle, ChevronLeft, ChevronRight, Download, ShieldCheck, HelpCircle
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

export default function Dashboard() {
  const { api } = useAuth();
  
  const [stats, setStats] = useState({
    totalEmails: 0,
    notifiedEmails: 0,
    failedEmails: 0,
    monitoringActive: false,
    telegramChatId: ''
  });
  
  const [emails, setEmails] = useState([]);
  const [activity, setActivity] = useState([]);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [notifiedFilter, setNotifiedFilter] = useState('all');
  
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch Dashboard Stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/dashboard/stats');
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('[Dashboard] Error fetching stats:', err.message);
    }
  }, [api]);

  // Fetch 7-day Activity Chart Data
  const fetchActivity = useCallback(async () => {
    try {
      const res = await api.get('/dashboard/activity');
      if (res.data.success) {
        setActivity(res.data.activity);
      }
    } catch (err) {
      console.error('[Dashboard] Error fetching activity:', err.message);
    }
  }, [api]);

  // Fetch Tracked Emails Log List
  const fetchEmails = useCallback(async () => {
    try {
      let url = `/emails?page=${page}&limit=7&search=${searchQuery}`;
      if (notifiedFilter !== 'all') {
        url += `&notified=${notifiedFilter}`;
      }
      const res = await api.get(url);
      if (res.data.success) {
        setEmails(res.data.emails);
        setTotalPages(res.data.pagination.pages);
      }
    } catch (err) {
      console.error('[Dashboard] Error fetching emails list:', err.message);
    }
  }, [api, page, searchQuery, notifiedFilter]);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchActivity(), fetchEmails()]);
    setLoading(false);
  }, [fetchStats, fetchActivity, fetchEmails]);

  const refreshDataSilent = useCallback(async () => {
    await Promise.all([fetchStats(), fetchActivity(), fetchEmails()]);
  }, [fetchStats, fetchActivity, fetchEmails]);

  useEffect(() => {
    // Initial fetch with spinner
    loadAllData();

    // Polling silently every 10 seconds to auto-refresh dashboard updates
    const intervalId = setInterval(() => {
      refreshDataSilent();
    }, 10000);

    return () => clearInterval(intervalId);
  }, [page, searchQuery, notifiedFilter, loadAllData, refreshDataSilent]);

  // Force poll Gmail immediately
  const handleForceSync = async () => {
    setSyncing(true);
    try {
      const res = await api.post('/test/poll-now');
      if (res.data.success) {
        await Promise.all([fetchStats(), fetchActivity(), fetchEmails()]);
      }
    } catch (err) {
      console.error('[Dashboard] Force sync failed:', err.message);
      alert(`Manual polling failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  // Debounced search trigger
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setSearchQuery(search);
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(emails, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `email_watchdog_export_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const calculateSuccessRate = () => {
    if (stats.totalEmails === 0) return 100;
    return Math.round((stats.notifiedEmails / stats.totalEmails) * 100);
  };

  // Render main screen
  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      
      {/* Upper Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Monitoring Command Center</h2>
          <p className="text-sm text-gray-400 mt-1">Live metrics, alert routing activity, and analytics timeline.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleForceSync}
            disabled={syncing || !stats.monitoringActive}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-xl border font-semibold text-sm transition-all duration-300
              ${syncing 
                ? 'bg-brand-500/10 border-brand-500/20 text-brand-400 cursor-not-allowed'
                : 'bg-brand-500 text-white hover:bg-brand-600 border-transparent shadow-[0_4px_15px_rgba(99,117,255,0.25)] hover:shadow-[0_4px_25px_rgba(99,117,255,0.4)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none'
              }
            `}
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Checking Inbox...' : 'Check Inbox Now'}</span>
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* WatchDog Pulse */}
        <div className="glass-panel rounded-2xl p-5 border border-white/5 relative overflow-hidden flex flex-col justify-between h-32">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-semibold uppercase tracking-wider">WatchDog Status</span>
            {stats.monitoringActive && stats.telegramChatId ? (
              <span className="flex h-3 w-3 relative">
                <span className="pulse-indicator absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            ) : (
              <span className="h-3 w-3 rounded-full bg-amber-500"></span>
            )}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mt-2">
              {stats.monitoringActive && stats.telegramChatId 
                ? 'Active Watcher' 
                : !stats.telegramChatId 
                ? 'Setup Telegram' 
                : 'Connection Paused'}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {stats.monitoringActive && stats.telegramChatId 
                ? 'Checking inbox every 60s' 
                : !stats.telegramChatId 
                ? 'Requires Telegram settings' 
                : 'Re-authenticate Gmail account'}
            </p>
          </div>
        </div>

        {/* Total Emails Tracked */}
        <div className="glass-panel rounded-2xl p-5 border border-white/5 flex flex-col justify-between h-32">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Emails</span>
            <Mail className="w-5 h-5 text-brand-400" />
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-white mt-1">{stats.totalEmails}</h3>
            <p className="text-xs text-gray-500 mt-1">Fetched and processed</p>
          </div>
        </div>

        {/* Dispatch success rate */}
        <div className="glass-panel rounded-2xl p-5 border border-white/5 flex flex-col justify-between h-32">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Alert Success</span>
            <Send className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-white mt-1">{calculateSuccessRate()}%</h3>
            <p className="text-xs text-gray-500 mt-1">{stats.notifiedEmails} successful alerts sent</p>
          </div>
        </div>

        {/* Failed Notifications */}
        <div className="glass-panel rounded-2xl p-5 border border-white/5 flex flex-col justify-between h-32">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Failed Delivery</span>
            <AlertCircle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h3 className={`text-3xl font-extrabold mt-1 ${stats.failedEmails > 0 ? 'text-red-400' : 'text-white'}`}>
              {stats.failedEmails}
            </h3>
            <p className="text-xs text-gray-500 mt-1">Errors logged in notifications</p>
          </div>
        </div>

      </div>

      {/* Analytics Chart */}
      <div className="glass-panel rounded-2xl p-5 md:p-6 border border-white/5">
        <h3 className="text-base font-bold text-white mb-4">Email Traffic & Notification Load (Last 7 Days)</h3>
        <div className="h-72 w-full">
          {activity.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6375ff" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#6375ff" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorNotified" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.03)" />
                <XAxis 
                  dataKey="date" 
                  stroke="rgba(255, 255, 255, 0.3)" 
                  fontSize={11}
                  tickFormatter={(val) => val.substring(5)} 
                />
                <YAxis stroke="rgba(255, 255, 255, 0.3)" fontSize={11} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(13, 17, 39, 0.9)', 
                    borderColor: 'rgba(99, 117, 255, 0.2)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }} 
                />
                <Area 
                  name="Emails Found" 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#6375ff" 
                  fillOpacity={1} 
                  fill="url(#colorCount)" 
                  strokeWidth={2}
                />
                <Area 
                  name="Alerts Sent" 
                  type="monotone" 
                  dataKey="notified" 
                  stroke="#a855f7" 
                  fillOpacity={1} 
                  fill="url(#colorNotified)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              No activity logs available yet.
            </div>
          )}
        </div>
      </div>

      {/* Search, Filter & Email Timeline List */}
      <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
        
        {/* Table Filter Actions Header */}
        <div className="p-5 border-b border-white/5 bg-white/[0.01] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-base font-bold text-white">Inbox Activity Log</h3>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Box */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder="Search sender, subject..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-white/5 bg-[#0a0d24] text-white focus:outline-none focus:border-brand-500/50 transition-colors"
              />
              <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </form>

            {/* Filter Toggle */}
            <select
              value={notifiedFilter}
              onChange={(e) => { setPage(1); setNotifiedFilter(e.target.value); }}
              className="px-3 py-2 text-sm rounded-xl border border-white/5 bg-[#0a0d24] text-white focus:outline-none focus:border-brand-500/50"
            >
              <option value="all">All Logs</option>
              <option value="true">Notified</option>
              <option value="false">Failed Alert</option>
            </select>

            {/* Export JSON Button */}
            <button
              onClick={handleExportData}
              disabled={emails.length === 0}
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border border-white/5 bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Table Body */}
        {loading ? (
          <div className="py-20 text-center text-gray-500">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-brand-500 mb-3" />
            <span>Refreshing logs...</span>
          </div>
        ) : emails.length === 0 ? (
          <div className="py-20 text-center max-w-sm mx-auto space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-gray-500 mx-auto">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">No tracked emails found</p>
              <p className="text-xs text-gray-500 mt-1">
                {searchQuery || notifiedFilter !== 'all' 
                  ? 'No results match your active filters and keywords.'
                  : 'We haven\'t detected any emails yet. Send an email to your Google inbox and click Check Inbox Now.'
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-white/5 text-xs font-semibold text-gray-400 bg-white/[0.005]">
                  <th className="p-4 md:px-6">Sender</th>
                  <th className="p-4 md:px-6">Subject & Snippet</th>
                  <th className="p-4 md:px-6">Received At</th>
                  <th className="p-4 md:px-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {emails.map((email) => (
                  <tr key={email._id} className="hover:bg-white/[0.008] transition-colors">
                    <td className="p-4 md:px-6 font-semibold text-white max-w-[180px] truncate">
                      {email.sender}
                    </td>
                    <td className="p-4 md:px-6 max-w-xs md:max-w-md">
                      <p className="text-white font-medium truncate">{email.subject}</p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{email.snippet}</p>
                    </td>
                    <td className="p-4 md:px-6 text-gray-400 whitespace-nowrap">
                      {new Date(email.receivedAt).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="p-4 md:px-6 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                        email.notified 
                          ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' 
                          : 'bg-red-500/10 border-red-500/25 text-red-400'
                      }`}>
                        {email.notified ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Notified</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Failed</span>
                          </>
                        )}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-white/5 bg-white/[0.005] flex items-center justify-between">
            <span className="text-xs text-gray-500">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-white/5 hover:bg-white/5 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-white/5 hover:bg-white/5 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
        
      </div>

    </div>
  );
}
