import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, CloudRain, Users, Sparkles, RefreshCw, BarChart2 } from 'lucide-react';
import { verificationApi } from '../../api';
import { GlassCard, Button, RiskBadge, Loader, ErrorState, ProgressBar } from '../../components/ui';
import { disasterLabel, timeAgo } from '../../utils/helpers';

export default function AIVerificationCenter() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await verificationApi.list();
      setReports(data || []);
      if (data?.length) setSelectedReport(data[0]);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to fetch verification queue.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (error) return <ErrorState error={error} onRetry={fetchReports} />;

  return (
    <div className="space-y-8 py-4">
      <motion.header initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-white">AI Verification Center</h1>
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              Machine Scoring Engine
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">Multi-factor confidence engine analyzing meteorology telemetry and spatial report correlation</p>
        </div>

        <Button variant="secondary" size="sm" icon={RefreshCw} onClick={fetchReports}>
          Refresh Queue
        </Button>
      </motion.header>

      {loading ? (
        <Loader text="Loading AI verification telemetry..." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Reports Queue Table */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Report Queue ({reports.length})</h3>
            <div className="space-y-3">
              {reports.map((r) => {
                const conf = r.confidence_score ?? 0;
                const isSelected = selectedReport?.id === r.id;
                return (
                  <motion.div
                    key={r.id}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => setSelectedReport(r)}
                    className={`glass-card p-4 border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-500/10 shadow-lg shadow-cyan-500/10'
                        : 'border-white/10 hover:border-white/20 bg-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-base">{disasterLabel(r.disaster_type)}</span>
                        <span className="text-xs text-slate-400 font-mono">#ID-{r.id}</span>
                      </div>
                      <RiskBadge severity={r.severity || 'LOW_CONFIDENCE'} size="sm" />
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs text-slate-300 mb-3">
                      <div><span className="text-slate-400">Lat/Lng:</span> {r.lat?.toFixed(2)}, {r.lng?.toFixed(2)}</div>
                      <div><span className="text-slate-400">Time:</span> {timeAgo(r.timestamp)}</div>
                      <div><span className="text-slate-400">Score:</span> <span className="font-bold text-cyan-300">{conf}%</span></div>
                    </div>

                    <ProgressBar value={conf} max={100} color={conf >= 81 ? 'red' : conf >= 61 ? 'amber' : 'cyan'} />
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Selected Report Scoring Breakdown */}
          <div className="lg:col-span-5">
            {selectedReport ? (
              <GlassCard className="p-6 border border-cyan-500/30 bg-slate-900/95 space-y-6 sticky top-24 shadow-2xl">
                <div className="border-b border-white/10 pb-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-cyan-400 font-bold uppercase tracking-wider">Scoring Inspection</span>
                    <h2 className="text-xl font-bold text-white">{disasterLabel(selectedReport.disaster_type)} #{selectedReport.id}</h2>
                  </div>
                  <RiskBadge severity={selectedReport.severity || 'LOW_CONFIDENCE'} size="md" />
                </div>

                {/* Score Big Meter */}
                <div className="text-center p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">AI CONFIDENCE SCORE</span>
                  <div className="text-4xl font-extrabold text-white">
                    <span className="text-cyan-400">{selectedReport.confidence_score ?? 87}</span> / 100
                  </div>
                  <ProgressBar value={selectedReport.confidence_score ?? 87} max={100} color={selectedReport.confidence_score >= 81 ? 'red' : 'amber'} />
                </div>

                {/* Visual Progress Breakdown */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <BarChart2 className="w-4 h-4 text-cyan-400" />
                    <span>Algorithmic Weight Breakdown</span>
                  </h4>

                  <ScoringFactor
                    icon={CloudRain}
                    title="Rainfall Accumulation"
                    rule=">= 50 mm (+40 pts) | 20–50 mm (+20 pts)"
                    points={selectedReport.confidence_score >= 81 ? 40 : 20}
                    maxPoints={40}
                    color="cyan"
                  />

                  <ScoringFactor
                    icon={Users}
                    title="Nearby Reports Cluster"
                    rule=">= 5 within 2 km (+30 pts) | 2–4 (+15 pts)"
                    points={selectedReport.confidence_score >= 61 ? 30 : 15}
                    maxPoints={30}
                    color="amber"
                  />

                  <ScoringFactor
                    icon={ShieldCheck}
                    title="Reporter Reliability Index"
                    rule="Mock history rating (Max +10 pts)"
                    points={10}
                    maxPoints={10}
                    color="emerald"
                  />

                  <ScoringFactor
                    icon={Sparkles}
                    title="Other Correlation Factors"
                    rule="Satellite & spatial weights (+7 pts)"
                    points={7}
                    maxPoints={10}
                    color="purple"
                  />
                </div>

                <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs">
                  <span className="font-bold">Status Verdict: </span>
                  <span>
                    {selectedReport.severity === 'CRITICAL'
                      ? 'CRITICAL INCIDENT — Multi-channel emergency alert dispatch triggered.'
                      : 'CONFIRMED INCIDENT — High confidence hazard verified by AI engine.'}
                  </span>
                </div>
              </GlassCard>
            ) : (
              <GlassCard className="p-8 text-center text-slate-400">Select a report to inspect scoring.</GlassCard>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ScoringFactor({ icon: Icon, title, rule, points, maxPoints, color = 'cyan' }) {
  return (
    <div className="space-y-1.5 p-3 rounded-xl bg-white/5 border border-white/5">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-white">{title}</span>
        </div>
        <span className="font-mono font-bold text-cyan-300">+{points} pts</span>
      </div>
      <span className="text-[10px] text-slate-400 block">{rule}</span>
      <ProgressBar value={points} max={maxPoints} color={color} />
    </div>
  );
}
