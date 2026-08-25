import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer } from 'react-leaflet';
import { RefreshCw, Users, User } from 'lucide-react';
import 'leaflet/dist/Leaflet.css';
import { ReportMarker, DangerZoneCircle, LiveUserMarker } from '../components/MapMarkers';
import { GlassCard, Button, RiskBadge, Loader, ErrorState } from '../components/ui';
import { useReports } from '../hooks';
import { geoApi, usersApi } from '../api';
import { getRiskLevel, disasterLabel, timeAgo } from '../utils/helpers';

const DISASTER_FILTERS = ['ALL', 'FLOOD', 'FIRE', 'LANDSLIDE', 'CYCLONE', 'EARTHQUAKE', 'ACCIDENT', 'OTHER'];
const RISK_FILTERS = ['ALL', 'LOW_CONFIDENCE', 'CONFIRMED', 'HIGH_RISK', 'CRITICAL'];

export default function LiveMap() {
  const { data: reports, loading, error, refetch } = useReports();
  const [selected, setSelected] = useState(null);
  const [zones, setZones] = useState({});
  const [liveUsers, setLiveUsers] = useState([]);
  const [showUsers, setShowUsers] = useState(true);
  const [dFilter, setDFilter] = useState('ALL');
  const [rFilter, setRFilter] = useState('ALL');

  const fetchUsers = async () => {
    try {
      const users = await usersApi.list();
      setLiveUsers(users || []);
    } catch (e) {
      console.error('Failed to load users for command map:', e);
    }
  };

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 15000);
    return () => clearInterval(interval);
  }, []);

  const filtered = useMemo(() => {
    if (!reports) return [];
    return reports.filter((r) => {
      const d = dFilter === 'ALL' || r.disaster_type === dFilter;
      const rs = rFilter === 'ALL' || getRiskLevel(r) === rFilter;
      return d && rs;
    });
  }, [reports, dFilter, rFilter]);

  useEffect(() => {
    if (!filtered.length) { setZones({}); return; }
    let cancelled = false;
    const res = filtered.map((r) => geoApi.dangerZone(r.id).then((zone) => ({ id: r.id, zone })).catch(() => ({ id: r.id, zone: null })));
    Promise.all(res).then((out) => {
      if (cancelled) return;
      const z = {};
      out.forEach(({ id, zone }) => { if (zone) z[id] = zone; });
      setZones(z);
    });
    return () => { cancelled = true; };
  }, [filtered]);

  if (error) return <ErrorState error={error.message} onRetry={() => { refetch(); fetchUsers(); }} />;

  return (
    <div className="space-y-6">
      <motion.header initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Command Live Map</h1>
          <p className="text-slate-400 mt-1">All active disaster reports, danger zone geofences, and live citizens</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowUsers(!showUsers)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
              showUsers ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-white/5 text-slate-400 border-white/10'
            }`}
          >
            <Users className="w-4 h-4 text-cyan-400" />
            <span>Live Citizens ({liveUsers.length})</span>
          </button>
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={() => { refetch(); fetchUsers(); }}>
            Refresh Map
          </Button>
        </div>
      </motion.header>

      <GlassCard className="p-4 border border-white/10">
        <div className="flex flex-wrap gap-4">
          <div>
            <p className="text-xs text-slate-400 mb-1.5 font-semibold uppercase">Disaster Type</p>
            <div className="flex flex-wrap gap-1.5">
              {DISASTER_FILTERS.map((f) => (
                <button key={f} onClick={() => setDFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${dFilter === f ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}>
                  {f.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1.5 font-semibold uppercase">Risk Level</p>
            <div className="flex flex-wrap gap-1.5">
              {RISK_FILTERS.map((f) => (
                <button key={f} onClick={() => setRFilter(rFilter === f ? 'ALL' : f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${rFilter === f ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}>
                  {f.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>

      {loading ? <Loader text="Loading command map feed..." /> : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[70vh] w-full rounded-2xl overflow-hidden border border-white/10 relative">
          <MapContainer center={[28.6139, 77.209]} zoom={11} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>' />
            {filtered.map((r) => (
              <ReportMarker key={`r-${r.id}`} report={r} onClick={(rep) => setSelected({ type: 'report', data: rep })} />
            ))}
            {Object.entries(zones).map(([id, zone]) => (
              <DangerZoneCircle key={`zone-${id}`} zone={zone} />
            ))}
            {showUsers && liveUsers.map((u) => (
              <LiveUserMarker key={`u-${u.id}`} user={u} onClick={(usr) => setSelected({ type: 'user', data: usr })} />
            ))}
          </MapContainer>
        </motion.div>
      )}

      {selected?.type === 'report' && (
        <AdminReportCard report={selected.data} onClose={() => setSelected(null)} />
      )}
      {selected?.type === 'user' && (
        <AdminUserCard user={selected.data} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

function AdminReportCard({ report, onClose }) {
  return (
    <motion.div initial={{ x: 320, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 320, opacity: 0 }} className="fixed top-6 right-6 z-30 w-80">
      <GlassCard className="p-5 border border-white/10 bg-slate-900/95 shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white">{disasterLabel(report.disaster_type)} - Report #{report.id}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-slate-400">???</button>
        </div>
        <div className="space-y-2.5 text-sm">
          <RiskBadge severity={report.severity} />
          <p className="text-slate-300">Confidence: <span className="text-slate-100">{report.confidence_score ?? 0}%</span></p>
          <p className="text-slate-300">Status: <span className="text-slate-100">{report.status}</span></p>
          <p className="text-slate-300">Location: <span className="text-slate-100 font-mono">{report.lat.toFixed(4)}, {report.lng.toFixed(4)}</span></p>
          {report.description && <p className="text-slate-300 text-xs bg-white/5 p-2 rounded-lg">{report.description}</p>}
        </div>
      </GlassCard>
    </motion.div>
  );
}

function AdminUserCard({ user, onClose }) {
  return (
    <motion.div initial={{ x: 320, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 320, opacity: 0 }} className="fixed top-6 right-6 z-30 w-80">
      <GlassCard className="p-5 border border-cyan-500/30 bg-slate-900/95 shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-semibold text-white">{user.name}</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-slate-400">???</button>
        </div>
        <div className="space-y-2 text-sm">
          {user.phone && <p className="text-slate-300">Phone: <span className="text-slate-100 font-mono">{user.phone}</span></p>}
          <p className="text-slate-300">Coordinates: <span className="text-slate-100 font-mono">{user.lat.toFixed(4)}, {user.lng.toFixed(4)}</span></p>
          <p className="text-slate-300">Last Active: <span className="text-slate-100">{user.last_active ? timeAgo(user.last_active) : 'Recently'}</span></p>
        </div>
      </GlassCard>
    </motion.div>
  );
}
