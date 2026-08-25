import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, BarChart3, PieChart, AlertTriangle, Calendar, Clock, TrendingUp } from 'lucide-react';
import { ReportsBarChart } from '../components/Charts';
import { GlassCard, StatCard, Loader, ErrorState, EmptyState, RiskBadge } from '../components/ui';
import { useReports, useAlerts } from '../hooks';
import { getRiskLevel, getSeverityInfo, disasterLabel, timeAgo } from '../utils/helpers';

import { Users } from 'lucide-react';
import { usersApi } from '../api';

export default function Overview() {
  const { data: reports, loading: rLoading, error: rError, refetch: rRefetch } = useReports();
  const { data: alerts, loading: aLoading, error: aError, refetch: aRefetch } = useAlerts();
  const [liveUserCount, setLiveUserCount] = useState(0);
  const [uLoading, setULoading] = useState(true);

  useEffect(() => {
    usersApi.list()
      .then((users) => { setLiveUserCount(users?.length || 0); })
      .catch((e) => console.error(e))
      .finally(() => setULoading(false));
  }, []);

  const stats = useMemo(() => {
    const r = reports || [];
    const active = r.filter((x) => x.status !== 'RESOLVED' && x.status !== 'FALSE_REPORT');
    const critical = active.filter((x) => getRiskLevel(x) === 'CRITICAL');
    const high = active.filter((x) => getRiskLevel(x) === 'HIGH_RISK');
    const today = r.filter((x) => { const t = Date.parse(x.timestamp); return !isNaN(t) && t > Date.now() - 86400000; });
    const a = alerts || [];
    const criticalAlerts = a.filter((x) => x.severity === 'CRITICAL');
    return {
      activeCount: active.length,
      highRisk: high.length,
      critical: critical.length,
      reportsToday: today.length,
      criticalAlerts: criticalAlerts.length,
      safeLocations: 4,
      activeReports: active,
      criticalReports: critical,
    };
  }, [reports, alerts]);

  if (rError || aError) return <ErrorState error={rError?.message || aError?.message} onRetry={() => { rRefetch(); aRefetch(); }} />;

  const chartData = useMemo(() => {
    if (!reports) return [];
    const counts = {};
    reports.forEach((r) => { counts[r.disaster_type] = (counts[r.disaster_type] || 0) + 1; });
    return Object.entries(counts).map(([type, value]) => ({ type: disasterLabel(type), value }));
  }, [reports]);

  return (
    <div className="space-y-8">
      <motion.header initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white">Command Overview</h1>
        <p className="text-slate-400 mt-1">Real-time situational summary across all monitored zones</p>
      </motion.header>

      <section className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard icon={AlertTriangle} label="Active Incidents" value={stats.activeCount} loading={rLoading} color="cyan" trend={stats.activeCount} />
        <StatCard icon={Users} label="Live Citizens" value={liveUserCount} loading={uLoading} color="emerald" />
        <StatCard icon={BarChart3} label="High Risk Zones" value={stats.highRisk} loading={rLoading} color="amber" />
        <StatCard icon={AlertTriangle} label="Critical Incidents" value={stats.critical} loading={rLoading} color="red" />
        <StatCard icon={Calendar} label="Reports Today" value={stats.reportsToday} loading={rLoading} color="blue" />
        <StatCard icon={PieChart} label="Critical Alerts" value={stats.criticalAlerts} loading={aLoading} color="purple" />
      </section>

      <GlassCard className="p-6 border border-white/10">
        <h3 className="text-sm font-medium text-slate-300 uppercase tracking-wider mb-4">Reports by Disaster Type</h3>
        <ReportsBarChart data={chartData} loading={rLoading} />
      </GlassCard>

      <GlassCard className="p-6 border border-white/10">
        <h3 className="text-sm font-medium text-slate-300 uppercase tracking-wider mb-4">Recent Critical Incidents</h3>
        {rLoading ? <Loader text="Loading incidents???" /> : stats.criticalReports.length === 0 ? (
          <EmptyState title="No critical incidents" description="All systems nominal." icon={AlertTriangle} />
        ) : (
          <div className="space-y-3">
            {stats.criticalReports.slice(0, 5).map((r) => (
              <motion.div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-3">
                  <RiskBadge severity={r.severity} />
                  <div>
                    <p className="font-medium text-white">{disasterLabel(r.disaster_type)} ??? Report #{r.id}</p>
                    <p className="text-xs text-slate-400">{r.lat.toFixed(3)}, {r.lng.toFixed(3)} ?? {timeAgo(r.timestamp)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-200">{r.confidence_score ?? 0}% confidence</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
