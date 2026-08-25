import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, useAnimation } from 'framer-motion';
import { Droplets, Users, Shield, BarChart3, FileText, AlertTriangle, MapPin, Send } from 'lucide-react';
import { reportsApi, verificationApi } from '../api';
import { Button, GlassCard, RiskBadge, Loader, ErrorState, EmptyState } from '../components/ui';
import { getSeverityInfo, disasterLabel, getRiskLevel, haversineKm } from '../utils/helpers';

const STEPS = [
  { id: 'received', label: 'Report Received', desc: 'Citizen report submitted', icon: FileText },
  { id: 'location', label: 'Location Checked', desc: 'Coordinates validated', icon: MapPin },
  { id: 'weather', label: 'Weather Analyzed', desc: 'Rainfall data fetched', icon: Droplets },
  { id: 'nearby', label: 'Nearby Reports Checked', desc: 'Correlation analysis', icon: Users },
  { id: 'confidence', label: 'Confidence Generated', desc: 'Score computed', icon: BarChart3 },
  { id: 'risk', label: 'Risk Determined', desc: 'Severity assigned', icon: AlertTriangle },
];

export default function VerificationResult() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const controls = useAnimation();

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
      const [verified, all] = await Promise.all([verificationApi.score(id), reportsApi.list()]);
      if (!cancelled) {
        setReport({ ...verified, _allReports: all });
      }
    } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    if (!report) return;
    setActiveStep(0);
    controls.set({ width: '0%' });
    const steps = STEPS.length;
    let i = 0;
    const interval = setInterval(() => {
      i += 1;
      setActiveStep(i);
      if (i >= steps) clearInterval(interval);
    }, 550);
    controls.start({ width: '100%', transition: { duration: (steps - 1) * 0.55 + 0.3, ease: 'easeOut' } });
    return () => clearInterval(interval);
  }, [report, controls]);

  const score = report?.confidence_score ?? 0;
  const severity = report?.severity || 'LOW_CONFIDENCE';
  const info = getSeverityInfo(severity);

  const nearbyCount = useMemo(() => {
    if (!report || !report._allReports || report._allReports.length === 0) return 0;
    const cutoff = Date.now() - 6 * 60 * 60 * 1000;
    return report._allReports.filter((r) => {
      if (r.id === report.id) return false;
      if (r.disaster_type !== report.disaster_type) return false;
      const t = Date.parse(r.timestamp);
      if (t < cutoff) return false;
      return haversineKm(report.lat, report.lng, r.lat, r.lng) <= 2;
    }).length;
  }, [report]);

  const rainfall = report?.weather?.precipitation_mm ?? 0;
  const nearbyPts = nearbyCount >= 5 ? 30 : nearbyCount >= 2 ? 15 : 0;
  const rainfallPts = rainfall >= 50 ? 40 : rainfall >= 20 ? 20 : 0;

  if (loading) return <Loader text="Running AI verification???" />;
  if (error) return <ErrorState error={error} onRetry={() => { window.location.reload(); }} />;
  if (!report) return <EmptyState title="No verification data" icon={Shield} />;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <motion.header initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">AI Verification Result</h1>
          <p className="text-slate-400 mt-1">Report #{report.id} ??? {disasterLabel(report.disaster_type)}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          Back
        </Button>
      </motion.header>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-1">
          <GlassCard className="p-6 border border-white/10 text-center">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Confidence Score</h3>
            <motion.div
              key={score}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, type: 'spring', stiffness: 120 }}
              className="relative w-40 h-40 mx-auto"
            >
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(148,163,184,0.15)" strokeWidth="7" />
                <motion.circle
                  cx="50" cy="50" r="44" fill="none"
                  stroke={info.color}
                  strokeWidth="7"
                  strokeDasharray={`${(score / 100) * 276} 276`}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                  initial={{ strokeDasharray: '0 276' }}
                  animate={{ strokeDasharray: `${(score / 100) * 276} 276` }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                  className="text-4xl font-extrabold"
                  style={{ color: info.color }}
                  key={score}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {score}%
                </motion.span>
                <RiskBadge severity={severity} size="sm" dot={false} />
              </div>
            </motion.div>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2 space-y-5">
          <GlassCard className="p-6 border border-white/10">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Verification Factors</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FactorRow label="Rainfall contribution (24h)" value={`${rainfall} mm`} sub={`+${rainfallPts} pts`} icon={Droplets} color={rainfall >= 20 ? '#06b6d4' : '#94a3b8'} />
              <FactorRow label="Nearby reports (within 2km)" value={`${nearbyCount} reports`} sub={`+${nearbyPts} pts`} icon={Users} color={nearbyCount >= 2 ? '#8b5cf6' : '#94a3b8'} />
              <FactorRow label="Reporter reliability" value="Mock baseline" sub="+10 pts max" icon={Shield} color="#22c55e" />
              <FactorRow label="Final confidence" value={`${score}%`} sub={info.label} icon={BarChart3} color={info.color} highlight />
              <FactorRow label="Final risk level" value={info.label} sub={getRiskLevel(report)} icon={AlertTriangle} color={info.color} highlight />
            </div>
          </GlassCard>

          <GlassCard className="p-6 border border-white/10">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Verification Process</h3>
            <div className="space-y-4">
              {STEPS.map((step, idx) => {
                const isActive = idx <= activeStep;
                const isCurrent = idx === activeStep;
                return (
                  <motion.div key={step.id} className="flex items-start gap-4" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.15 + 0.2 }}>
                    <div className={`mt-0.5 flex items-center justify-center w-9 h-9 rounded-full transition-all ${isActive ? 'bg-cyan-500 text-slate-950' : 'bg-white/5 text-slate-500 border border-white/10'}`}>
                      <step.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <motion.div animate={{ color: isCurrent ? '#ffffff' : '#cbd5e1' }} className={`font-medium transition-colors`}>{step.label}</motion.div>
                      <p className="text-xs text-slate-500 mt-0.5">{step.desc}</p>
                    </div>
                    {isCurrent && (
                      <motion.div layoutId="progress" className="mt-0.5">
                        <div className="w-1.5 h-5 rounded-full bg-cyan-400 animate-pulse" />
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
              <div className="mt-4 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div className="h-full bg-cyan-400 rounded-full" style={{ width: activeStep === 0 ? '0%' : `${(activeStep / (STEPS.length - 1)) * 100}%` }} />
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex justify-end gap-3">
        <Button variant="secondary" size="md" icon={Send} onClick={() => navigate('/report')}>
          Report Another
        </Button>
        <Button variant="primary" size="md" icon={Send} onClick={() => navigate('/evacuation')}>
          View Safe Evacuation
        </Button>
      </motion.div>
    </div>
  );
}

function FactorRow({ label, value, sub, icon: Icon, color, highlight }) {
  return (
    <div className={`p-3 rounded-xl ${highlight ? 'bg-white/10 border border-cyan-500/20' : 'bg-white/5 border border-white/10'}`}>
      <div className="flex items-center gap-2.5">
        <Icon className="w-4 h-4" style={{ color }} />
        <div>
          <p className="text-xs text-slate-400">{label}</p>
          <p className="text-lg font-semibold text-slate-100">{value}</p>
          <p className="text-xs text-slate-500">{sub}</p>
        </div>
      </div>
    </div>
  );
}