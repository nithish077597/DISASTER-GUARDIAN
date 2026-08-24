import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer } from 'react-leaflet';
import { MapPin, Layers, Filter, Wind, Navigation, Users, User, RefreshCw } from 'lucide-react';
import {
  ReportMarker, ShelterMarker, UserLocationMarker, LiveUserMarker, DangerZoneCircle, FitToReports,
} from '../components/MapMarkers';
import { Button, GlassCard, RiskBadge, Loader, ErrorState, EmptyState } from '../components/ui';
import { useReports, useGeolocation } from '../hooks';
import { useUser } from '../context/UserContext';
import { geoApi, usersApi } from '../api';
import { getRiskLevel, disasterLabel, timeAgo } from '../utils/helpers';

const DEFAULT_CENTER = [28.6139, 77.209];

const DISASTER_FILTERS = ['ALL', 'FLOOD', 'FIRE', 'LANDSLIDE', 'CYCLONE', 'EARTHQUAKE', 'ACCIDENT', 'OTHER'];
const RISK_FILTERS = ['ALL', 'LOW_CONFIDENCE', 'CONFIRMED', 'HIGH_RISK', 'CRITICAL'];

export default function LiveMap() {
  const { data: reports, loading: reportsLoading, error, refetch } = useReports();
  const geo = useGeolocation();
  const { user: currentUser } = useUser();

  const [selectedItem, setSelectedItem] = useState(null);
  const [dangerZones, setDangerZones] = useState({});
  const [shelters, setShelters] = useState([]);
  const [liveUsers, setLiveUsers] = useState([]);
  const [showLiveUsers, setShowLiveUsers] = useState(true);

  const [activeDisasterFilter, setActiveDisasterFilter] = useState('ALL');
  const [activeRiskFilter, setActiveRiskFilter] = useState('ALL');

  const userPos = useMemo(() => {
    if (currentUser?.lat != null && currentUser?.lng != null) {
      return { lat: currentUser.lat, lng: currentUser.lng };
    }
    if (geo.position) return { lat: geo.position.lat, lng: geo.position.lng };
    return null;
  }, [currentUser, geo.position]);

  useEffect(() => {
    if (geo.supported && !geo.position && !geo.loading && !geo.error) geo.request();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geo.supported, geo.position]);

  // Fetch live active users
  const fetchLiveUsers = async () => {
    try {
      const data = await usersApi.list();
      setLiveUsers(data || []);
    } catch (err) {
      console.error('Failed to load live users:', err);
    }
  };

  useEffect(() => {
    fetchLiveUsers();
    const interval = setInterval(fetchLiveUsers, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, []);

  const visibleReports = useMemo(() => {
    if (!reports) return [];
    return reports.filter((r) => {
      const dMatch = activeDisasterFilter === 'ALL' || r.disaster_type === activeDisasterFilter;
      const rMatch = activeRiskFilter === 'ALL' || getRiskLevel(r) === activeRiskFilter;
      return dMatch && rMatch;
    });
  }, [reports, activeDisasterFilter, activeRiskFilter]);

  useEffect(() => {
    if (!visibleReports.length) {
      setDangerZones({});
      return;
    }
    let cancelled = false;
    const fetchZones = async () => {
      const zones = {};
      const promises = visibleReports.map((r) =>
        geoApi.dangerZone(r.id).then((z) => ({ id: r.id, zone: z })).catch(() => ({ id: r.id, zone: null }))
      );
      const results = await Promise.all(promises);
      results.forEach(({ id, zone }) => { if (zone) zones[id] = zone; });
      if (!cancelled) setDangerZones(zones);
    };
    fetchZones();
    return () => { cancelled = true; };
  }, [visibleReports]);

  useEffect(() => {
    let cancelled = false;
    const loadShelters = async () => {
      const crit = (reports || []).find((r) => getRiskLevel(r) === 'CRITICAL');
      if (!crit) { setShelters([]); return; }
      try {
        const safe = await geoApi.safeLocations(crit.id);
        if (!cancelled) setShelters(safe);
      } catch { if (!cancelled) setShelters([]); }
    };
    loadShelters();
    return () => { cancelled = true; };
  }, [reports]);

  if (error) return <ErrorState error={error.message} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-white">Live Disaster Map</h1>
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              Live Telemetry
            </span>
          </div>
          <p className="text-slate-400 mt-1 text-sm">Real-time hazard intelligence, active danger zones, and live citizen locations</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowLiveUsers(!showLiveUsers)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
              showLiveUsers
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 text-cyan-400" />
            <span>Live Citizens ({liveUsers.length})</span>
          </button>

          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={() => { refetch(); fetchLiveUsers(); }}>
            Refresh Data
          </Button>
        </div>
      </div>

      <div className="glass-card p-3 border border-white/10 flex flex-wrap items-center justify-between gap-4">
        <FilterBar label="Disaster Type" items={DISASTER_FILTERS} value={activeDisasterFilter} onChange={setActiveDisasterFilter} />
        <FilterBar label="Threat Severity" items={RISK_FILTERS} value={activeRiskFilter} onChange={setActiveRiskFilter} />
      </div>

      {reportsLoading && <Loader text="Synchronizing live disaster map layers…" />}

      {!reportsLoading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[68vh] w-full rounded-2xl overflow-hidden border border-white/10 relative shadow-2xl">
          <MapContainer
            center={userPos ? [userPos.lat, userPos.lng] : DEFAULT_CENTER}
            zoom={userPos ? 12 : 11}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
            />
            <FitToReports reports={visibleReports} userPos={userPos} />

            {/* Reports Markers */}
            {visibleReports.map((r) => (
              <ReportMarker key={`rep-${r.id}`} report={r} onClick={(rep) => setSelectedItem({ type: 'report', data: rep })} />
            ))}

            {/* Danger Zones */}
            {Object.entries(dangerZones).map(([id, zone]) => (
              <DangerZoneCircle key={`dz-${id}`} zone={zone} />
            ))}

            {/* Shelters */}
            {shelters.map((s) => (
              <ShelterMarker key={`shelter-${s.id}`} shelter={s} onClick={(sh) => setSelectedItem({ type: 'shelter', data: sh })} />
            ))}

            {/* Live Users Markers */}
            {showLiveUsers &&
              liveUsers.map((u) => (
                <LiveUserMarker key={`usr-${u.id}`} user={u} onClick={(usr) => setSelectedItem({ type: 'user', data: usr })} />
              ))}

            {/* User GPS Pin */}
            {userPos && <UserLocationMarker lat={userPos.lat} lng={userPos.lng} />}
          </MapContainer>
        </motion.div>
      )}

      {/* Selected Item Floating Detail Card */}
      {selectedItem?.type === 'report' && (
        <ReportPopup report={selectedItem.data} onClose={() => setSelectedItem(null)} />
      )}
      {selectedItem?.type === 'shelter' && (
        <ShelterPopup shelter={selectedItem.data} onClose={() => setSelectedItem(null)} />
      )}
      {selectedItem?.type === 'user' && (
        <UserPopup user={selectedItem.data} onClose={() => setSelectedItem(null)} />
      )}
    </div>
  );
}

function FilterBar({ label, items, value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}:</span>
      <div className="flex flex-wrap gap-1">
        {items.map((it) => (
          <button
            key={it}
            onClick={() => onChange(value === it ? 'ALL' : it)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              value === it
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            {it.replace('_', ' ')}
          </button>
        ))}
      </div>
    </div>
  );
}

function ReportPopup({ report, onClose }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="fixed bottom-6 right-6 z-30 w-80 max-w-sm">
      <GlassCard className="p-5 border border-red-500/30 bg-slate-900/95 shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white">{disasterLabel(report.disaster_type)} Report</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-slate-400">✕</button>
        </div>
        <div className="space-y-2 text-sm">
          <p><span className="text-slate-400">Location:</span> <span className="text-slate-200 font-mono">{report.lat.toFixed(4)}, {report.lng.toFixed(4)}</span></p>
          <p><span className="text-slate-400">Reported:</span> <span className="text-slate-200">{timeAgo(report.timestamp)}</span></p>
          <p><span className="text-slate-400">Confidence:</span> <span className="text-slate-200 font-medium">{report.confidence_score ?? 0}%</span></p>
          <div><span className="text-slate-400">Severity:</span> <RiskBadge severity={report.severity} dot={false} size="sm" /></div>
          {report.description && <p className="text-slate-300 text-xs bg-white/5 p-2 rounded-lg mt-2">{report.description}</p>}
        </div>
        <div className="flex gap-2 mt-4">
          <Button size="sm" variant="secondary" className="w-full" onClick={onClose}>Close</Button>
        </div>
      </GlassCard>
    </motion.div>
  );
}

function ShelterPopup({ shelter, onClose }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="fixed bottom-6 right-6 z-30 w-80 max-w-sm">
      <GlassCard className="p-5 border border-emerald-500/30 bg-slate-900/95 shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-emerald-300">{shelter.name}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-slate-400">✕</button>
        </div>
        <div className="space-y-2 text-sm">
          <p><span className="text-slate-400">Capacity:</span> <span className="text-slate-200">{shelter.capacity} citizens</span></p>
          <p><span className="text-slate-400">Occupancy:</span> <span className="text-slate-200">{shelter.current_occupancy}/{shelter.capacity}</span></p>
          <p><span className="text-slate-400">Allowed Disasters:</span> <span className="text-slate-200">{shelter.disaster_types}</span></p>
        </div>
        <div className="flex gap-2 mt-4">
          <Button size="sm" variant="secondary" className="w-full" onClick={onClose}>Close</Button>
        </div>
      </GlassCard>
    </motion.div>
  );
}

function UserPopup({ user, onClose }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="fixed bottom-6 right-6 z-30 w-80 max-w-sm">
      <GlassCard className="p-5 border border-cyan-500/40 bg-slate-900/95 shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">{user.name}</h3>
              <span className="text-[10px] text-cyan-400 font-mono">Live Active Citizen</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-slate-400">✕</button>
        </div>
        <div className="space-y-2 text-sm">
          {user.phone && <p><span className="text-slate-400">Contact:</span> <span className="text-slate-200 font-mono">{user.phone}</span></p>}
          <p><span className="text-slate-400">Coordinates:</span> <span className="text-slate-200 font-mono">{user.lat.toFixed(4)}, {user.lng.toFixed(4)}</span></p>
          <p><span className="text-slate-400">Last Active:</span> <span className="text-slate-200">{user.last_active ? timeAgo(user.last_active) : 'Just now'}</span></p>
        </div>
        <div className="flex gap-2 mt-4">
          <Button size="sm" variant="secondary" className="w-full" onClick={onClose}>Close</Button>
        </div>
      </GlassCard>
    </motion.div>
  );
}
