import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, ChevronUp, ChevronDown, Eye, AlertTriangle, BarChart3, ArrowUpCircle, XCircle } from 'lucide-react';
import { reportsApi } from '../../api';
import { Button, GlassCard, SeverityBadge, Loader, ErrorState, EmptyState } from '../../components/ui';
import { getRiskLevel, disasterLabel, formatTime, timeAgo } from '../../utils/helpers';

const PAGE_SIZE = 10;

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState('timestamp');
  const [sortDir, setSortDir] = useState('desc');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [actioning, setActioning] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await reportsApi.list();
      setReports(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAction = async (id, action) => {
    setActioning(id);
    try {
      if (action === 'escalate') await reportsApi.escalate(id);
      else if (action === 'dismiss') await reportsApi.dismiss(id);
      await load();
    } catch (err) {
      console.error(err);
    } finally {
      setActioning(null);
    }
  };

  const filtered = useMemo(() => {
    if (!reports) return [];
    let result = [...reports];
    if (severityFilter !== 'ALL') {
      result = result.filter((r) => getRiskLevel(r) === severityFilter);
    }
    if (typeFilter !== 'ALL') {
      result = result.filter((r) => r.disaster_type === typeFilter);
    }
    result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (sortField === 'confidence_score') {
        aVal = aVal ?? 0;
        bVal = bVal ?? 0;
      }
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [reports, severityFilter, typeFilter, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  if (loading) return <Loader text="Loading reports..." />;
  if (error) return <ErrorState error={error} onRetry={load} />;

  return (
    <div className="space-y-6 py-4">
      <motion.header initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Incoming Reports</h1>
          <p className="text-slate-400 text-sm mt-1">{filtered.length} total reports</p>
        </div>
      </motion.header>

      {/* Filters */}
      <GlassCard className="p-4 border border-white/10 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Filters:</span>
        </div>
        <select
          value={severityFilter}
          onChange={(e) => { setSeverityFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-200 text-xs focus:outline-none focus:border-cyan-400"
        >
          <option value="ALL">All Severities</option>
          <option value="LOW_CONFIDENCE">Low Confidence</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="HIGH_RISK">High Risk</option>
          <option value="CRITICAL">Critical</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-200 text-xs focus:outline-none focus:border-cyan-400"
        >
          <option value="ALL">All Types</option>
          {['FLOOD', 'FIRE', 'LANDSLIDE', 'CYCLONE', 'EARTHQUAKE', 'ACCIDENT'].map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </GlassCard>

      {/* Desktop Table */}
      <GlassCard className="p-0 border border-white/10 overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 text-xs uppercase tracking-wider border-b border-white/10">
                <th className="pb-3 pl-4">ID</th>
                <th className="pb-3">Type</th>
                <th className="pb-3 cursor-pointer hover:text-white transition-colors" onClick={() => toggleSort('severity')}>
                  Severity {sortField === 'severity' && (sortDir === 'asc' ? <ChevronUp className="w-3 h-3 inline" /> : <ChevronDown className="w-3 h-3 inline" />)}
                </th>
                <th className="pb-3 cursor-pointer hover:text-white transition-colors" onClick={() => toggleSort('confidence_score')}>
                  Confidence {sortField === 'confidence_score' && (sortDir === 'asc' ? <ChevronUp className="w-3 h-3 inline" /> : <ChevronDown className="w-3 h-3 inline" />)}
                </th>
                <th className="pb-3">Location</th>
                <th className="pb-3 cursor-pointer hover:text-white transition-colors" onClick={() => toggleSort('timestamp')}>
                  Time {sortField === 'timestamp' && (sortDir === 'asc' ? <ChevronUp className="w-3 h-3 inline" /> : <ChevronDown className="w-3 h-3 inline" />)}
                </th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right pr-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {pageData.map((r) => (
                <tr key={r.id} className="hover:bg-white/5 transition-colors" style={{ borderLeft: `3px solid ${getSeverityInfo(getRiskLevel(r)).color}` }}>
                  <td className="py-3 pl-4 font-mono text-xs">#{r.id}</td>
                  <td className="py-3">{disasterLabel(r.disaster_type)}</td>
                  <td className="py-3"><SeverityBadge severity={getRiskLevel(r)} size="sm" /></td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-100 font-bold text-xs">{r.confidence_score ?? 0}%</span>
                      <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-cyan-400" style={{ width: `${r.confidence_score ?? 0}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-xs text-slate-400 font-mono">{r.lat?.toFixed(3)}, {r.lng?.toFixed(3)}</td>
                  <td className="py-3 text-xs text-slate-400">{timeAgo(r.timestamp)}</td>
                  <td className="py-3 text-xs text-slate-400">{r.status}</td>
                  <td className="py-3 text-right pr-4">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" icon={ArrowUpCircle} onClick={() => handleAction(r.id, 'escalate')} disabled={actioning === r.id} title="Escalate">
                        {actioning === r.id ? '...' : <ArrowUpCircle className="w-3.5 h-3.5" />}
                      </Button>
                      <Button variant="ghost" size="sm" icon={XCircle} onClick={() => handleAction(r.id, 'dismiss')} disabled={actioning === r.id} title="Dismiss">
                        {actioning === r.id ? '...' : <XCircle className="w-3.5 h-3.5" />}
                      </Button>
                      <Button variant="ghost" size="sm" icon={Eye} onClick={() => window.open(`/report/${r.id}`, '_blank')}>
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {pageData.map((r) => (
          <motion.div key={r.id} whileHover={{ y: -2 }} className="glass-card p-4 border border-white/5" style={{ borderLeft: `4px solid ${getSeverityInfo(getRiskLevel(r)).color}` }}>
            <div className="flex items-center justify-between mb-2">
              <SeverityBadge severity={getRiskLevel(r)} size="sm" />
              <span className="text-xs text-slate-500">{r.status}</span>
            </div>
            <p className="font-semibold text-white text-sm">{disasterLabel(r.disaster_type)} #{r.id}</p>
            <p className="text-xs text-slate-400 mt-1">Confidence: {r.confidence_score ?? 0}%</p>
            <p className="text-xs text-slate-500 font-mono">{r.lat?.toFixed(4)}, {r.lng?.toFixed(4)}</p>
            <p className="text-xs text-slate-500">{timeAgo(r.timestamp)}</p>
            <div className="flex gap-2 mt-3">
              <Button variant="ghost" size="sm" icon={ArrowUpCircle} onClick={() => handleAction(r.id, 'escalate')} disabled={actioning === r.id}>Escalate</Button>
              <Button variant="ghost" size="sm" icon={XCircle} onClick={() => handleAction(r.id, 'dismiss')} disabled={actioning === r.id}>Dismiss</Button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
        <span className="text-xs text-slate-400">Page {page} of {totalPages}</span>
        <Button variant="secondary" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</Button>
      </div>
    </div>
  );
}
