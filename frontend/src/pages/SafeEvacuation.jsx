import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, MapPin, Users, Clock, Navigation } from 'lucide-react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/Leaflet.css';
import { geoApi } from '../api';
import { Button, GlassCard, RiskBadge, Loader, ErrorState, EmptyState } from '../components/ui';
import { useReports, useGeolocation } from '../hooks';
import { useUser } from '../context/UserContext';
import { ShelterMarker, UserLocationMarker, FitToReports } from '../components/MapMarkers';
import { getRiskLevel, disasterLabel, formatDistance, estimateTravelTime, haversineKm } from '../utils/helpers';

export default function SafeEvacuation() {
  const { data: reports, loading: reportsLoading, error, refetch } = useReports();
  const geo = useGeolocation();
  const { user: currentUser } = useUser();
  const [selectedReport, setSelectedReport] = useState(null);
  const [shelters, setShelters] = useState([]);
  const [loadingShelters, setLoadingShelters] = useState(false);

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
  }, [geo.supported, geo.position, geo.loading, geo.error]);

  const rankedReports = useMemo(() => {
    if (!reports) return [];
    return [...reports]
      .filter((r) => ['CRITICAL', 'HIGH_RISK', 'CONFIRMED'].includes(getRiskLevel(r)))
      .sort((a, b) => severityRank(b) - severityRank(a) || new Date(b.timestamp) - new Date(a.timestamp));
  }, [reports]);

  useEffect(() => {
    if (rankedReports.length && !selectedReport) setSelectedReport(rankedReports[0]);
  }, [rankedReports, selectedReport]);

  useEffect(() => {
    if (!selectedReport) { setShelters([]); return; }
    let cancelled = false;
    setLoadingShelters(true);
    geoApi.safeLocations(selectedReport.id)
      .then((safe) => { if (!cancelled) setShelters(safe); })
      .catch(() => { if (!cancelled) setShelters([]); })
      .finally(() => { if (!cancelled) setLoadingShelters(false); });
    return () => { cancelled = true; };
  }, [selectedReport]);

  const center = useMemo(() => {
    if (userPos) return [userPos.lat, userPos.lng];
    if (shelters[0]) return [shelters[0].lat, shelters[0].lng];
    return [28.6139, 77.209];
  }, [userPos, shelters]);

  if (error) return <ErrorState error={error.message} onRetry={refetch} />;

  return (
    <div className="space-y-8">
      <motion.header initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white">Safe Evacuation</h1>
        <p className="text-slate-400 mt-1">Verified shelters outside active danger zones</p>
      </motion.header>

      {!selectedReport ? (
        <EmptyState
          icon={Shield}
          title="No active evacuation required"
          description={reportsLoading ? 'Scanning for at-risk incidents…' : 'No confirmed or high-risk incidents are currently active. You are safe.'}
        />
      ) : (
        <>
          <GlassCard className="p-4 border border-white/10">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-cyan-400" />
                <div>
                  <p className="text-sm text-slate-300">Evacuation sourced from incident</p>
                  <p className="font-medium text-white">{disasterLabel(selectedReport.disaster_type)} • Report #{selectedReport.id}</p>
                </div>
              </div>
              <RiskBadge severity={selectedReport.severity} />
            </div>
          </GlassCard>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-1 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-200">Safe Locations ({shelters.length})</h3>
                <Button variant="ghost" size="sm" icon={MapPin} onClick={refetch}>Refresh</Button>
              </div>
              {loadingShelters ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-white/5 rounded-xl animate-pulse" />)}
                </div>
              ) : shelters.length === 0 ? (
                <EmptyState title="No shelters found" description="No safe locations outside the danger zone for the selected incident." icon={Shield} />
              ) : (
                <div className="space-y-3">
                  {shelters.map((s) => (
                    <ShelterCard key={s.id} shelter={s} userPos={userPos} />
                  ))}
                </div>
              )}
            </div>

            <div className="xl:col-span-2 h-[60vh] rounded-2xl overflow-hidden border border-white/10">
              <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>' />
                <FitToReports reports={shelters} userPos={userPos} />
                {shelters.map((s) => (
                  <ShelterMarker key={s.id} shelter={s} />
                ))}
                {userPos && <UserLocationMarker lat={userPos.lat} lng={userPos.lng} />}
              </MapContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function severityRank(r) {
  const s = getRiskLevel(r);
  return { CRITICAL: 4, HIGH_RISK: 3, CONFIRMED: 2, LOW_CONFIDENCE: 1 }[s] || 0;
}

function ShelterCard({ shelter, userPos }) {
  const dist = useMemo(() => {
    if (!userPos) return shelter.distance_km;
    return shelter.distance_km ?? haversineKm(userPos.lat, userPos.lng, shelter.lat, shelter.lng);
  }, [shelter, userPos]);

  const occupancyPct = shelter.capacity ? Math.round((shelter.current_occupancy / shelter.capacity) * 100) : 0;
  const status = occupancyPct >= 90 ? 'Critical' : occupancyPct >= 70 ? 'Near Capacity' : 'Available';
  const statusColor = occupancyPct >= 90 ? 'red' : occupancyPct >= 70 ? 'amber' : 'emerald';

  return (
    <motion.div whileHover={{ y: -4 }} className="glass-card p-4 border border-white/10">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-white">{shelter.name}</h4>
        <RiskBadge severity="CONFIRMED" dot={false} size="sm" />
      </div>
      <div className="grid grid-cols-2 gap-2.5 text-sm mb-3">
        <Stat icon={MapPin} label="Distance" value={formatDistance(dist)} />
        <Stat icon={Users} label="Capacity" value={`${shelter.capacity}`} />
        <Stat icon={Users} label="Occupancy" value={`${shelter.current_occupancy}/${shelter.capacity}`} />
        <Stat icon={Clock} label="Travel time" value={estimateTravelTime(dist)} />
        <Stat icon={Shield} label="Status" value={status} color={statusColor} />
      </div>
      <Button variant="primary" size="sm" icon={Navigation} className="w-full">
        GET DIRECTIONS
      </Button>
    </motion.div>
  );
}

function Stat({ icon: Icon, label, value, color = 'slate' }) {
  const colorMap = { slate: 'text-slate-400', emerald: 'text-emerald-400', amber: 'text-amber-400', red: 'text-red-400', cyan: 'text-cyan-400' };
  return (
    <div className="flex items-center gap-1.5">
      <Icon className={`w-3.5 h-3.5 ${colorMap[color]}`} />
      <span className="text-slate-400">{label}:</span>
      <span className="text-slate-200 font-medium">{value}</span>
    </div>
  );
}
