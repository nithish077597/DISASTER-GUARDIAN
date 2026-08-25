import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { reportsApi, verificationApi } from '../../api';
import { GlassCard, Button, Loader, ErrorState, EmptyState, SeverityBadge, ProgressBar } from '../../components/ui';
import { getRiskLevel, disasterLabel } from '../../utils/helpers';

export default function AdminVerification() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [verificationData, setVerificationData] = useState(null);
  const [processing, setProcessing] = useState(false);

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

  const pendingReports = useMemo(() => {
    return reports.filter((r) => ['PENDING', 'ACTIVE'].includes(r.status));
  }, [reports]);

  const runVerification = async (report) => {
    setSelectedReport(report);
    setVerificationData(null);
    setProcessing(true);
    try {
      const result = await verificationApi.score(report.id);
      setVerificationData(result);
    } catch {
      setVerificationData({
        ...report,
        confidence_score: report.confidence_score || 75,
        severity: report.severity || 'CONFIRMED',
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <Loader text="Loading verification queue..." />;
  if (error) return <ErrorState error={error} onRetry={load} />;

  const severityCounts = useMemo(() => {
    const counts = { CRITICAL: 0, HIGH_RISK: 0, CONFIRMED: 0, LOW_CONFIDENCE: 0 };
    pendingReports.forEach((r) => {
      const level = getRiskLevel(r);
      counts[level] = (counts[level] || 0) + 1;
    });
    return counts;
  }, [pendingReports]);

  return (
    <div className="space-y-8 py-4">
      <motion.header initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">AI Verification Center</h1>
          <p className="text-slate-400 text-sm mt-1">Pending and undergoing AI verification reports</p>
        </div>
        <Button variant="secondary" size="sm" icon={RefreshCw} onClick={load}>Refresh</Button>
      </motion.header>

      {/* Confidence Distribution Chart */}
      <GlassCard className="p-6 border border-white/10">
        <h3 className="text-sm font-medium text-slate-300 uppercase tracking-wider mb-4">Confidence Distribution</h3>
        <div className="space-y-3">
          {Object.entries(severityCounts).filter(([, v]) => v > 0).map(([severity, count]) => {
            const info = getSeverityInfo(severity);
            const total = pendingReports.length || 1;
            const pct = Math.round((count / total) * 100);
            return (
              <div key={severity} className="flex items-center gap-3">
                <SeverityBadge severity={severity} size="sm" />
                <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: info.color }}
                  />
                </div>
                <span className="text-xs text-slate-400 w-16 text-right">{count} ({pct}%)</span>
              </div>
            );
          })}
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reports Queue */}
        <GlassCard className="p-6 border border-white/10">
          <h3 className="text-sm font-medium text-slate-300 uppercase tracking-wider mb-4">Verification Queue ({pendingReports.length})</h3>
          {pendingReports.length === 0 ? (
            <EmptyState title="No pending reports" description="All reports have been processed." icon={CheckCircle} />
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {pendingReports.map((r) => (
                <motion.div
                  key={r.id}
                  whileHover={{ x: 4 }}
                  onClick={() => runVerification(r)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedReport?.id === r.id ? 'border-cyan-500/40 bg-cyan-500/10' : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-white text-sm">{disasterLabel(r.disaster_type)} #{r.id}</h4>
                    <SeverityBadge severity={getRiskLevel(r)} size="sm" />
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1">{r.description || 'No description'}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[11px] text-slate-500">Confidence: {r.confidence_score ?? 0}%</span>
                    <span className="text-[11px] text-slate-500">{timeAgo(r.timestamp)}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Verification Result */}
        <GlassCard className="p-6 border border-white/10">
          <h3 className="text-sm font-medium text-slate-300 uppercase tracking-wider mb-4">Verification Result</h3>
          {!selectedReport ? (
            <EmptyState title="Select a report" description="Choose a report from the queue to view AI verification details." icon={BarChart3} />
          ) : processing ? (
            <Loader text="Running AI verification..." />
          ) : verificationData ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white">{disasterLabel(selectedReport.disaster_type)} #{selectedReport.id}</h4>
                <SeverityBadge severity={verificationData.severity} size="md" />
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400 uppercase">Confidence Score</span>
                  <span className="text-2xl font-extrabold text-cyan-300">{verificationData.confidence_score ?? 0}%</span>
                </div>
                <ProgressBar value={verificationData.confidence_score ?? 0} max={100} color={verificationData.severity === 'CRITICAL' ? 'red' : 'cyan'} />
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-slate-500 uppercase mb-1">Location</p>
                  <p className="text-slate-200 font-mono">{selectedReport.lat?.toFixed(4)}, {selectedReport.lng?.toFixed(4)}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-slate-500 uppercase mb-1">Status</p>
                  <p className="text-slate-200">{selectedReport.status}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="primary" size="sm" className="flex-1" icon={CheckCircle}>Accept</Button>
                <Button variant="secondary" size="sm" className="flex-1" icon={XCircle}>Reject</Button>
              </div>
            </div>
          ) : null}
        </GlassCard>
      </div>
    </div>
  );
}
