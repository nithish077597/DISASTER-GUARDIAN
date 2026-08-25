import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, RefreshCw, MapPin, User, Clock, FileText, BarChart3, CheckCircle } from 'lucide-react';
import { reportsApi } from '../api';
import { Button, GlassCard, RiskBadge, Loader, ErrorState, EmptyState, AlertBanner } from '../components/ui';
import { getRiskLevel, getSeverityInfo, disasterLabel, formatTime, timeAgo } from '../utils/helpers';

export default function ReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const data = await reportsApi.get(id);
        if (!cancelled) setReport(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [id]);

  const runVerification = async () => {
    setVerifying(true);
    setVerifyError(null);
    try {
      navigate(`/verification/${id}`);
    } catch (err) {
      setVerifyError(err.message);
    } finally {
      setVerifying(false);
    }
  };

  if (loading) return <Loader text="Loading report…" />;
  if (error) return <ErrorState error={error} onRetry={() => { window.location.reload(); }} />;
  if (!report) return <EmptyState title="Report not found" icon={FileText} />;

  const info = getSeverityInfo(report.severity);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.header initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
        <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate(-1)}>Back</Button>
        <h1 className="text-2xl font-bold text-white">{disasterLabel(report.disaster_type)} — Report #{report.id}</h1>
      </motion.header>

      {verifyError && <AlertBanner type="critical" title="Verification failed" message={verifyError} onClose={() => setVerifyError(null)} />}

      <GlassCard className="p-6 border border-white/10">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/10">
                <FileText className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Disaster Type</p>
                <p className="font-semibold text-slate-100">{disasterLabel(report.disaster_type)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-800/50">
                <MapPin className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Location</p>
                <p className="font-semibold text-slate-100">{report.lat.toFixed(5)}, {report.lng.toFixed(5)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Reported</p>
                <p className="font-semibold text-slate-100">{formatTime(report.timestamp)}</p>
                <p className="text-xs text-slate-500">{timeAgo(report.timestamp)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <User className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Reporter ID</p>
                <p className="font-semibold text-slate-100">{report.reporter_id}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-xs text-slate-500 uppercase mb-1">Risk Level</p>
              <div className="flex items-center gap-2.5">
                <RiskBadge severity={report.severity} size="lg" />
                <span className="text-3xl font-bold" style={{ color: info.color }}>{report.confidence_score ?? 0}%</span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-xs text-slate-500 uppercase mb-1">Status</p>
              <p className="font-semibold text-slate-100">{report.status}</p>
            </div>
            {report.photo_url && (
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-xs text-slate-500 uppercase mb-1">Photo</p>
                <img src={report.photo_url} alt="report" className="rounded-lg max-h-32 object-cover" />
              </div>
            )}
          </div>
        </div>

        {report.description && (
          <div className="mt-4">
            <p className="text-xs text-slate-500 uppercase mb-1.5">Description</p>
            <p className="text-slate-300 leading-relaxed">{report.description}</p>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <Button variant="primary" size="md" icon={BarChart3} loading={verifying} onClick={runVerification}>
            Run AI Verification
          </Button>
          <Button variant="secondary" size="md" icon={MapPin}>Navigate to Safety</Button>
        </div>
      </GlassCard>
    </div>
  );
}
