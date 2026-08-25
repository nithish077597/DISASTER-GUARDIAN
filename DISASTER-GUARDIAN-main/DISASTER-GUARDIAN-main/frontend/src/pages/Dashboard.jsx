import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Wind, Bell, Navigation, Users, RefreshCw, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button, GlassCard, RiskBadge, StatusIndicator, AnimatedCounter, Loader, ErrorState, EmptyState, AlertBanner } from '../components/ui';
import { useReports, useAlerts, useGeolocation } from '../hooks';
import { getSafetyStatus, getSeverityInfo, getRiskLevel, formatDistance, formatTime, timeAgo, haversineKm, disasterLabel, nearestLocation, estimateTravelTime } from '../utils/helpers';
import { geoApi } from '../api';

const DEFAULT_CENTER = [28.6139, 77.209];

export default function Dashboard() {
  const { data: reports, loading: reportsLoading, error: reportsError, refetch: refetchReports } = useReports();
  const { data: alerts, loading: alertsLoading, error: alertsError, refetch: refetchAlerts } = useAlerts();
  const geo = useGeolocation();
  const [dangerZone, setDangerZone] = useState(null);
  const [nearestShelters, setNearestShelters] = useState([]);
  const [loadingZone, setLoadingZone] = useState(false);

  const userPos = geo.position ? { lat: geo.position.lat, lng: geo.position.lng } : null;

  const criticalReport = useMemo(() => {
    if (!reports) return null;
    return [...reports].find((r) => getRiskLevel(r) === 'CRITICAL') || null;
  }, [reports]);

  useEffect(() => {
    if (geo.supported && !geo.position && !geo.loading && !geo.error) {
      geo.request();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geo.supported, geo.position, geo.loading, geo.error]);

  useEffect(() => {
    if (!criticalReport) {
      setDangerZone(null);
      setNearestShelters([]);
      return;
    }
    let cancelled = false;
    setLoadingZone(true);
    geoApi
      .dangerZone(criticalReport.id)
      .then((dz) => {
        if (!cancelled) setDangerZone(dz);
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoadingZone(false));

    geoApi
      .safeLocations(criticalReport.id)
      .then((safe) => {
        if (!cancelled) setNearestShelters(safe);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [criticalReport]);

  const safety = useMemo(() => getSafetyStatus(reports), [reports]);

  const nearbyIncidents = useMemo(() => {
    if (!reports || !userPos) return [];
    return [...reports]
      .map((r) => ({ ...r, distance_km: haversineKm(userPos.lat, userPos.lng, r.lat, r.lng) }))
      .filter((r) => r.distance_km <= 5)
      .sort((a, b) => a.distance_km - b.distance_km)
      .slice(0, 6);
  }, [reports, userPos]);

  const latestAlert = useMemo(() => (alerts && alerts.length ? alerts[0] : null), [alerts]);

  const safetyColor = safety.color;

  if (reportsError || alertsError)
    return (
      <div className="py-10">
        <ErrorState error={reportsError?.message || alertsError?.message} onRetry={() => { refetchReports(); refetchAlerts(); }} />
      </div>
    );

  return (
    <div className="space-y-8">
      <motion.header initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white">Citizen Dashboard</h1>
        <p className="text-slate-400 mt-1">Real-time situational awareness for your area</p>
      </motion.header>

      <motion.div layout transition={{ duration: 0.5, ease: 'easeOut' }}>
        <GlassCard className="p-8 text-center border-2" style={{ borderColor: safetyColor, boxShadow: `0 0 25px 4px ${safetyColor}25` }}>
          <motion.div
            key={safety.status}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="flex items-center gap-3">
              <StatusIndicator operational={safety.status !== 'OFFLINE'} />
              <span className="text-2xl font-medium text-slate-300">Safety Status</span>
            </div>
            <motion.span
              key={safety.status}
              className="text-4xl md:text-5xl font-extrabold"
              style={{ color: safetyColor }}
            >
              {safety.label}
            </motion.span>
            <RiskBadge severity={safety.status === 'SAFE' ? 'LOW_CONFIDENCE' : safety.status} dot />
          </motion.div>
        </GlassCard>
      </motion.div>

      {geo.error && (
        <AlertBanner
          type="info"
          title="Location services unavailable"
          message="Live geolocation could not be determined. Showing data relative to Delhi NCR."
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <StatTile icon={MapPin} label="Current Location" value={userPos ? `${userPos.lat.toFixed(4)}, ${userPos.lng.toFixed(4)}` : 'Delhi NCR (28.61, 77.21)'} sub={geo.loading ? 'Detecting…' : geo.error ? 'Using default' : 'Live GPS'} accent="cyan" />
        <StatTile icon={Wind} label="Nearby Incidents" value={nearbyIncidents.length.toString()} sub={reportsLoading ? 'Scanning…' : nearbyIncidents.length ? `${nearbyIncidents[0].distance_km.toFixed(1)} km to nearest` : 'None in 5 km'} accent={nearbyIncidents.length ? 'red' : 'emerald'} />
        <StatTile icon={Bell} label="Latest Alert" value={latestAlert ? latestAlert.severity.replace('_', ' ') : 'No Active Alerts'} sub={latestAlert ? timeAgo(latestAlert.sent_at) : alertsLoading ? 'Checking…' : 'All clear'} accent={latestAlert && latestAlert.severity === 'CRITICAL' ? 'red' : 'amber'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-6 border border-white/5">
          <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">Nearby Incidents</h3>
          {reportsLoading ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}</div>
          ) : nearbyIncidents.length ? (
            <div className="space-y-3">
              {nearbyIncidents.map((r) => (
                <motion.div key={r.id} layout whileHover={{ x: 6 }} className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <RiskBadge severity={r.severity} dot={false} />
                    <div>
                      <p className="font-medium text-slate-100">{disasterLabel(r.disaster_type)}</p>
                      <p className="text-xs text-slate-400">{r.description?.slice(0, 50) || 'No description'}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{formatTime(r.timestamp)}</p>
                    </div>
                  </div>
                  <span className="text-sm text-slate-400">{formatDistance(r.distance_km)}</span>
                </motion.div>
              ))}
            </div>
          ) : (
            <EmptyState title="No nearby incidents" description="No reports within 5 km of your location." icon={MapPin} />
          )}
          <div className="mt-4">
            <Link to="/map">
              <Button variant="ghost" size="sm" icon={ChevronRight}>View all on map</Button>
            </Link>
          </div>
        </GlassCard>

        <GlassCard className="p-6 border border-white/5">
          <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">Nearest Safe Location</h3>
          {loadingZone ? (
            <Loader text="Calculating evacuation routes…" />
          ) : nearestShelters.length ? (
            <div className="space-y-4">
              {nearestShelters.slice(0, 1).map((s) => (
                <motion.div key={s.id} className="p-4 rounded-xl bg-white/5 border border-emerald-500/20" whileHover={{ y: -3 }}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-emerald-300">{s.name}</h4>
                    <RiskBadge severity="CONFIRMED" dot={false} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p className="text-slate-300">Capacity: <span className="text-slate-100">{s.capacity}</span></p>
                    <p className="text-slate-300">Occupancy: <span className="text-cyan-300">{s.current_occupancy}/{s.capacity}</span></p>
                    <p className="text-slate-300">Distance: <span className="text-slate-100">{formatDistance(s.distance_km)}</span></p>
                    <p className="text-slate-300">Travel: <span className="text-slate-100">{estimateTravelTime(s.distance_km)}</span></p>
                  </div>
                  <Button variant="primary" size="sm" className="mt-3 w-full" icon={Navigation}>
                    Get Directions
                  </Button>
                </motion.div>
              ))}
            </div>
          ) : (
            <EmptyState title="No safe locations loaded" description="Safe shelters are computed from active critical incidents. None are currently active." icon={Navigation} />
          )}
        </GlassCard>
      </div>

      <GlassCard className="p-6 border border-white/5">
        <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">Recent Activity</h3>
        {(reportsLoading && !reports) ? (
          <Loader text="Loading activity…" />
        ) : reports.length === 0 ? (
          <EmptyState title="No reports yet" description="Be the first to report a disaster." icon={Bell} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 text-xs uppercase tracking-wider">
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Risk</th>
                  <th className="pb-3">Confidence</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Time</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {reports.slice(0, 8).map((r) => (
                  <tr key={r.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-2.5">{disasterLabel(r.disaster_type)}</td>
                    <td><RiskBadge severity={r.severity} dot={false} size="sm" /></td>
                    <td className="text-slate-300">{r.confidence_score ?? 0}%</td>
                    <td className="text-slate-400">{r.status}</td>
                    <td className="text-slate-400">{timeAgo(r.timestamp)}</td>
                    <td className="text-right">
                      <Link to={`/report/${r.id}`}>
                        <Button variant="ghost" size="sm">View</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
}

function StatTile({ icon: Icon, label, value, sub, accent = 'cyan' }) {
  const accentMap = { cyan: 'text-cyan-400', amber: 'text-amber-400', emerald: 'text-emerald-400', red: 'text-red-400' };
  return (
    <motion.div whileHover={{ y: -4 }} className="glass-card p-5 border border-white/5">
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 mt-0.5 ${accentMap[accent]}`} />
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wider">{label}</p>
          <p className="text-xl font-bold text-slate-100 mt-1">{value}</p>
          <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
        </div>
      </div>
    </motion.div>
  );
}

function SkeletonRow() {
  return <div className="h-14 bg-white/5 rounded-lg animate-pulse" />;
}
