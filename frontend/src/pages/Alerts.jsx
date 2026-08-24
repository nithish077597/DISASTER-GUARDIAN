import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellRing, Smartphone, MessageSquare, Phone, Router as GatewayIcon, MapPin, Clock } from 'lucide-react';
import { alertsApi, reportsApi } from '../api';
import { Button, GlassCard, RiskBadge, Loader, ErrorState, EmptyState, StatusIndicator } from '../components/ui';
import { getSeverityInfo, disasterLabel, formatTime } from '../utils/helpers';

const CHANNEL_ICONS = {
  APP: { icon: Smartphone, label: 'App' },
  SMS: { icon: MessageSquare, label: 'SMS' },
  VOICE: { icon: Phone, label: 'Voice' },
  GATEWAY: { icon: GatewayIcon, label: 'Hardware Gateway' },
};

const ALERT_TIER = {
  LOW_CONFIDENCE: { label: 'NORMAL', channels: ['APP'], color: '#22c55e', icon: Bell },
  CONFIRMED: { label: 'NORMAL', channels: ['APP'], color: '#22c55e', icon: Bell },
  HIGH_RISK: { label: 'HIGH RISK', channels: ['APP', 'SMS'], color: '#f97316', icon: BellRing },
  CRITICAL: { label: 'CRITICAL', channels: ['APP', 'SMS', 'VOICE', 'GATEWAY'], color: '#ef4444', icon: BellRing },
};

function DisasterTypeTag({ type }) {
  return <span>{disasterLabel(type)}</span>;
}

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [a, r] = await Promise.all([alertsApi.list(), reportsApi.list()]);
      setAlerts(a || []);
      setReports(r || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); const id = setInterval(load, 8000); return () => clearInterval(id); }, []);

  const alertsWithReport = useMemo(() => {
    if (!alerts || !reports) return [];
    return alerts
      .map((a) => ({ ...a, report: reports.find((r) => r.id === a.report_id) }))
      .filter((a) => a.report);
  }, [alerts, reports]);

  if (loading && !alertsWithReport.length) return <Loader text="Loading alerts…" />;
  if (error) return <ErrorState error={error} onRetry={load} />;

  return (
    <div className="space-y-8">
      <motion.header initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Emergency Alerts</h1>
          <p className="text-slate-400 mt-1">Live alert dispatch center</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <StatusIndicator operational={true} />
          <span className="text-slate-300">{alertsWithReport.length} active alerts</span>
        </div>
      </motion.header>

      <AlertTierVisualization />

      <AnimatePresence>
        {loading ? null : (
          <motion.div layout>
            {alertsWithReport.length === 0 ? (
              <EmptyState icon={Bell} title="No alerts" description="No emergency alerts have been dispatched. Alerts appear here in real time." />
            ) : (
              <div className="space-y-4">
                {alertsWithReport.map((a) => {
                  const tier = ALERT_TIER[a.severity] || ALERT_TIER.LOW_CONFIDENCE;
                  const info = getSeverityInfo(a.severity);
                  return (
                    <motion.div
                      key={a.id}
                      layout
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 40 }}
                      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                      className={`glass-card p-4 border ${a.severity === 'CRITICAL' ? 'border-red-500/40' : 'border-white/10'} overflow-hidden`}
                    >
                      <div className="absolute -inset-x-0 -top-px h-0.5" style={{ background: info.color }} />
                      <div className="flex items-start gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0" style={{ backgroundColor: `${info.color}20` }}>
                          <tier.icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <RiskBadge severity={a.severity} />
                            <span className="text-xs text-slate-500 uppercase font-medium">{tier.label} ALERT</span>
                          </div>
                          <p className="text-slate-200 mt-1.5 break-words">{a.message}</p>
                          <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-400">
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{a.report?.lat}, {a.report?.lng}</span>
                            <span className="flex items-center gap-1"><DisasterTypeTag type={a.report?.disaster_type} /></span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatTime(a.sent_at)}</span>
                          </div>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs text-slate-500">Dispatch channels:</span>
                            {tier.channels.map((ch) => {
                              const c = CHANNEL_ICONS[ch];
                              return (
                                <motion.span key={ch} className="inline-flex items-center gap-1 px-2 py-0.75 rounded-lg bg-white/5 text-slate-200">
                                  <c.icon className="w-3 h-3" />
                                  {c.label}
                                </motion.span>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AlertTierVisualization() {
  return (
    <GlassCard className="p-6 border border-white/10">
      <h3 className="text-sm font-medium text-slate-300 uppercase tracking-wider mb-5">Alert Routing</h3>
      <div className="grid sm:grid-cols-3 gap-4 text-center">
        {Object.values(ALERT_TIER).map((tier, i) => (
          <motion.div key={tier.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 + 0.2 }} className="flex flex-col items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg" style={{ backgroundColor: `${tier.color}20` }}>
              <tier.icon className="w-4 h-4 text-white" />
            </div>
            <div className="font-semibold" style={{ color: tier.color }}>{tier.label}</div>
            <div className="flex items-center justify-center gap-1.5 flex-wrap">
              {tier.channels.map((ch) => {
                const c = CHANNEL_ICONS[ch];
                return <c.icon key={ch} className="w-4 h-4 text-slate-400" title={c.label} />;
              })}
            </div>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
}
