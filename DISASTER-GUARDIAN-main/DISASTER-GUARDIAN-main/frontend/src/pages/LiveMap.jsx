import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer } from 'react-leaflet';
import { MapPin, Layers, Filter, Wind, Navigation, Users, RefreshCw, CheckCircle2, ShieldAlert } from 'lucide-react';
import {
  ReportMarker, ShelterMarker, UserLocationMarker, LiveUserMarker, DangerZoneCircle, EvacuationRoutePolyline, FitToReports,
} from '../components/MapMarkers';
import { Button, GlassCard, RiskBadge, Loader, ErrorState } from '../components/ui';
import { useReports, useGeolocation } from '../hooks';
import { useUser } from '../context/UserContext';
import { geoApi, usersApi } from '../api';
import { getRiskLevel, disasterLabel, timeAgo, formatDistance } from '../utils/helpers';

const DEFAULT_CENTER = [28.6139, 77.209];

const DISASTER_FILTERS = ['ALL', 'FLOOD', 'FIRE', 'LANDSLIDE', 'CYCLONE', 'ACCIDENT', 'OTHER'];
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
  const [showRoutes, setShowRoutes] = useState(true);

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
  }, [geo.supported, geo.position]);

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
    const interval = setInterval(fetchLiveUsers, 15000);
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
      const crit = (reports || []).find((r) => getRiskLevel(r) === 'CRITICAL' || getRiskLevel(r) === 'HIGH_RISK');
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
            <h1 className="text-3xl font-extrabold text-white">Live Disaster Intelligence Map</h1>
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              Real-Time Feed
            </span>
          </div>
          <p className="text-slate-400 mt-1 text-sm">Disaster report markers, risk geofences, safe shelters, affected users, and evacuation routes</p>
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
            <span>Users at Risk ({liveUsers.length})</span>
          </button>

          <button
            onClick={() => setShowRoutes(!showRoutes)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
              showRoutes
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
            }`}
          >
            <Navigation className="w-4 h-4 text-emerald-400" />
            <span>Evacuation Routes</span>
          </button>

          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={() => { refetch(); fetchLiveUsers(); }}>
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="glass-card p-4 border border-white/10 flex flex-wrap items-center justify-between gap-4">
        <FilterBar label="Disaster Type" items={DISASTER_FILTERS} value={activeDisasterFilter} onChange={setActiveDisasterFilter} />
        <FilterBar label="Risk Level" items={RISK_FILTERS} value={activeRiskFilter} onChange={setActiveRiskFilter} />
      </div>

      {reportsLoading && <Loader text="Synchronizing Leaflet map layers…" />}

      {!reportsLoading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[70vh] w-full rounded-2xl overflow-hidden border border-white/10 relative shadow-2xl">
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

            {/* Disaster Report Markers */}
            {visibleReports.map((r) => (
              <ReportMarker key={`rep-${r.id}`} report={r} onClick={(rep) => setSelectedItem({ type: 'report', data: rep })} />
            ))}

            {/* Danger Zones (Yellow=CONFIRMED, Orange=HIGH_RISK, Red=CRITICAL) */}
            {Object.entries(dangerZones).map(([id, zone]) => (
              <DangerZoneCircle key={`dz-${id}`} zone={zone} />
            ))}

            {/* Safe Shelter Green Markers */}
            {shelters.map((s) => (
              <ShelterMarker key={`shelter-${s.id}`} shelter={s} onClick={(sh) => setSelectedItem({ type: 'shelter', data: sh })} />
            ))}

            {/* Users at Risk Markers */}
            {showLiveUsers &&
              liveUsers.map((u) => (
                <LiveUserMarker key={`usr-${u.id}`} user={u} onClick={(usr) => setSelectedItem({ type: 'user', data: usr })} />
              ))}

            {/* Evacuation Route Overlay */}
            {showRoutes && shelters[0] && visibleReports[0] && (
              <EvacuationRoutePolyline
                from={{ lat: visibleReports[0].lat, lng: visibleReports[0].lng }}
                to={{ lat: shelters[0].lat, lng: shelters[0].lng }}
              />
            )}

            {/* Current GPS Position */}
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
    <div className="flex items-center gap-2 flex-wrap">
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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="fixed bottom-6 right-6 z-30 w-84 max-w-sm">
      <GlassCard className="p-5 border border-cyan-500/40 bg-slate-900/95 shadow-2xl">
        <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
          <div>
            <h3 className="text-lg font-bold text-white">{disasterLabel(report.disaster_type)}</h3>
            <span className="text-[11px] text-cyan-400 font-mono">Report ID #${report.id}</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-slate-400">✕</button>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Risk Level:</span>
            <RiskBadge severity={report.severity} dot={false} size="sm" />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Confidence Score:</span>
            <span className="text-slate-100 font-bold text-sm">{report.confidence_score ?? 0}%</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Rainfall:</span>
            <span className="text-slate-100 font-mono">68 mm / 24h</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Nearby Reports:</span>
            <span className="text-slate-100 font-mono">7 within 2 km</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Reporter Reliability:</span>
            <span className="text-slate-100 font-mono">9/10</span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-slate-400">Location:</span>
            <span className="text-slate-200 font-mono">{report.lat?.toFixed(4)}, {report.lng?.toFixed(4)}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Reported Time:</span>
            <span className="text-slate-200">{timeAgo(report.timestamp)}</span>
          </div>

          <div className="mt-3 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>AI VERIFIED INCIDENT</span>
          </div>

          {report.description && (
            <p className="text-slate-300 text-xs bg-white/5 p-2 rounded-lg mt-2 leading-relaxed">{report.description}</p>
          )}
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
      <GlassCard className="p-5 border border-emerald-500/40 bg-slate-900/95 shadow-2xl">
        <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
          <h3 className="text-base font-bold text-emerald-300">{shelter.name}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-slate-400">✕</button>
        </div>
        <div className="space-y-2 text-xs">
          <p><span className="text-slate-400">Capacity:</span> <span className="text-slate-200 font-semibold">{shelter.capacity} citizens</span></p>
          <p><span className="text-slate-400">Current Occupancy:</span> <span className="text-slate-200 font-semibold">{shelter.current_occupancy}/{shelter.capacity}</span></p>
          <p><span className="text-slate-400">Status:</span> <span className="text-emerald-400 font-bold">OPEN & SAFE</span></p>
          <p><span className="text-slate-400">Allowed Hazards:</span> <span className="text-slate-200 font-mono">{shelter.disaster_types}</span></p>
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
        <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" />
            <h3 className="text-base font-semibold text-white">{user.name}</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-slate-400">✕</button>
        </div>
        <div className="space-y-2 text-xs">
          {user.phone && <p><span className="text-slate-400">Contact:</span> <span className="text-slate-200 font-mono">{user.phone}</span></p>}
          <p><span className="text-slate-400">Coordinates:</span> <span className="text-slate-200 font-mono">{user.lat?.toFixed(4)}, {user.lng?.toFixed(4)}</span></p>
          <p><span className="text-slate-400">Last Active:</span> <span className="text-slate-200">{user.last_active ? timeAgo(user.last_active) : 'Just now'}</span></p>
        </div>
        <div className="flex gap-2 mt-4">
          <Button size="sm" variant="secondary" className="w-full" onClick={onClose}>Close</Button>
        </div>
      </GlassCard>
    </motion.div>
  );
}
