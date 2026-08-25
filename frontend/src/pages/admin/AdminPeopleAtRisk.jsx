import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer } from 'react-leaflet';
import { Users, MapPin, Shield, RefreshCw, AlertTriangle } from 'lucide-react';
import { usersApi } from '../../api';
import { GlassCard, StatCard, Loader, ErrorState, SeverityBadge, Button } from '../../components/ui';
import { ReportMarker, DangerZoneCircle, LiveUserMarker } from '../../components/MapMarkers';
import { reportsApi } from '../../api';
import { getRiskLevel, disasterLabel, formatTime } from '../../utils/helpers';

export default function AdminPeopleAtRisk() {
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [u, r] = await Promise.all([usersApi.list(), reportsApi.list()]);
      setUsers(u || []);
      setReports(r || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); const id = setInterval(load, 10000); return () => clearInterval(id); }, []);

  const dangerZones = useMemo(() => {
    return (reports || [])
      .filter((r) => ['CRITICAL', 'HIGH_RISK'].includes(getRiskLevel(r)))
      .map((r) => ({
        id: r.id,
        center: { lat: r.lat, lng: r.lng },
        radius_m: 2000,
        severity: getRiskLevel(r),
      }));
  }, [reports]);

  const affectedUsers = useMemo(() => {
    if (!selectedZone) return users;
    return users.filter((u) => {
      if (!u.lat || !u.lng) return false;
      const dist = Math.sqrt((u.lat - selectedZone.center.lat) ** 2 + (u.lng - selectedZone.center.lng) ** 2);
      return dist < 0.03;
    });
  }, [users, selectedZone]);

  if (loading) return <Loader text="Loading people at risk data..." />;
  if (error) return <ErrorState error={error} onRetry={load} />;

  return (
    <div className="space-y-8 py-4">
      <motion.header initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">People at Risk</h1>
          <p className="text-slate-400 text-sm mt-1">Users located in active danger zones</p>
        </div>
        <Button variant="secondary" size="sm" icon={RefreshCw} onClick={load}>Refresh</Button>
      </motion.header>

      {/* Stats */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Users" value={users.length} color="cyan" />
        <StatCard icon={AlertTriangle} label="Danger Zones" value={dangerZones.length} color="red" />
        <StatCard icon={Shield} label="People at Risk" value={affectedUsers.length} color="amber" />
        <StatCard icon={MapPin} label="Active Reports" value={reports.filter((r) => ['CRITICAL', 'HIGH_RISK'].includes(getRiskLevel(r))).length} color="purple" />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Map */}
        <div className="lg:col-span-7 space-y-3">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Risk Zone Map</h3>
          <div className="h-[450px] w-full rounded-2xl overflow-hidden border border-white/10 relative shadow-2xl">
            <MapContainer center={[28.6139, 77.2090]} zoom={11} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>' />
              {dangerZones.map((z) => (
                <DangerZoneCircle key={z.id} zone={z} />
              ))}
              {users.filter((u) => u.lat && u.lng).map((u) => (
                <LiveUserMarker key={u.id} user={u} onClick={() => setSelectedZone({ id: u.id })} />
              ))}
            </MapContainer>
          </div>
        </div>

        {/* User List */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
            Affected Users ({affectedUsers.length})
          </h3>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {affectedUsers.length === 0 ? (
              <EmptyState title="No users in danger zones" description="No users currently located within active danger zones." icon={Users} />
            ) : (
              affectedUsers.map((u) => (
                <motion.div key={u.id} whileHover={{ x: 4 }} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-xs font-bold">
                        {u.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{u.name || 'Unknown'}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{u.phone || 'No phone'}</p>
                      </div>
                    </div>
                    <SeverityBadge severity="CRITICAL" size="sm" />
                  </div>
                  <p className="text-xs text-slate-400 font-mono">{u.lat?.toFixed(4)}, {u.lng?.toFixed(4)}</p>
                  <p className="text-[11px] text-slate-500 mt-1">Last active: {u.last_active ? formatTime(u.last_active) : 'Just now'}</p>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
