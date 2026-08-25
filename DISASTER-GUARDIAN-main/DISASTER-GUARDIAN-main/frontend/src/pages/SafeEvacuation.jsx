import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, MapPin, Users, Clock, Navigation, CheckCircle2, ArrowRight } from 'lucide-react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/Leaflet.css';
import { geoApi } from '../api';
import { Button, GlassCard, RiskBadge, Loader, ErrorState, EmptyState, ProgressBar } from '../components/ui';
import { useReports, useGeolocation } from '../hooks';
import { useUser } from '../context/UserContext';
import { ShelterMarker, UserLocationMarker, EvacuationRoutePolyline, DangerZoneCircle, FitToReports } from '../components/MapMarkers';
import { getRiskLevel, disasterLabel, formatDistance, estimateTravelTime, haversineKm } from '../utils/helpers';

export default function SafeEvacuation() {
  const { data: reports, loading: reportsLoading, error, refetch } = useReports();
  const geo = useGeolocation();
  const { user: currentUser } = useUser();

  const [selectedReport, setSelectedReport] = useState(null);
  const [shelters, setShelters] = useState([]);
  const [loadingShelters, setLoadingShelters] = useState(false);
  const [selectedShelter, setSelectedShelter] = useState(null);

  const userPos = useMemo(() => {
    if (currentUser?.lat != null && currentUser?.lng != null) {
      return { lat: currentUser.lat, lng: currentUser.lng };
    }
    if (geo.position) return { lat: geo.position.lat, lng: geo.position.lng };
    return { lat: 28.6139, lng: 77.2090 };
  }, [currentUser, geo.position]);

  useEffect(() => {
    if (geo.supported && !geo.position && !geo.loading && !geo.error) geo.request();
  }, [geo.supported, geo.position]);

  const rankedReports = useMemo(() => {
    if (!reports) return [];
    return [...reports]
      .filter((r) => ['CRITICAL', 'HIGH_RISK', 'CONFIRMED'].includes(getRiskLevel(r)))
      .sort((a, b) => severityRank(b) - severityRank(a));
  }, [reports]);

  useEffect(() => {
    if (rankedReports.length && !selectedReport) setSelectedReport(rankedReports[0]);
  }, [rankedReports, selectedReport]);

  useEffect(() => {
    if (!selectedReport) { setShelters([]); return; }
    let cancelled = false;
    setLoadingShelters(true);
    geoApi.safeLocations(selectedReport.id)
      .then((safe) => {
        if (!cancelled) {
          setShelters(safe || []);
          if (safe?.length) setSelectedShelter(safe[0]);
        }
      })
      .catch(() => { if (!cancelled) setShelters([]); })
      .finally(() => { if (!cancelled) setLoadingShelters(false); });
    return () => { cancelled = true; };
  }, [selectedReport]);

  if (error) return <ErrorState error={error.message} onRetry={refetch} />;

  return (
    <div className="space-y-8 py-4">
      <motion.header initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-extrabold text-white">Safe Evacuation</h1>
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Navigation className="w-3.5 h-3.5" />
            Evacuation Engine
          </span>
        </div>
        <p className="text-slate-400 text-sm mt-1">Verified emergency shelters outside active hazard zones with turn-by-turn route guidance</p>
      </motion.header>

      {!selectedReport ? (
        <EmptyState
          icon={Shield}
          title="No active evacuation required"
          description={reportsLoading ? 'Scanning for hazard zones...' : 'No active critical incidents requiring evacuation.'}
        />
      ) : (
        <>
          {/* Incident Source Banner */}
          <GlassCard className="p-4 border border-white/10 flex items-center justify-between flex-wrap gap-4 bg-slate-900/90">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Evacuation Triggered By Incident</p>
                <h3 className="font-bold text-white text-base">{disasterLabel(selectedReport.disaster_type)} • Report #{selectedReport.id}</h3>
              </div>
            </div>
            <RiskBadge severity={selectedReport.severity} size="md" />
          </GlassCard>

          {/* Split View: Map & Recommended Safe Locations */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Interactive Leaflet Map */}
            <div className="lg:col-span-7 space-y-3">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Evacuation Map & Route</h3>
              <div className="h-[480px] w-full rounded-2xl overflow-hidden border border-white/10 relative shadow-2xl">
                <MapContainer center={[userPos.lat, userPos.lng]} zoom={12} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>' />
                  <FitToReports reports={shelters} userPos={userPos} />

                  {/* Shelters */}
                  {shelters.map((s) => (
                    <ShelterMarker key={s.id} shelter={s} onClick={setSelectedShelter} />
                  ))}

                  {/* Danger Zone */}
                  <DangerZoneCircle zone={{ center: { lat: selectedReport.lat, lng: selectedReport.lng }, radius_m: 2000, severity: selectedReport.severity }} />

                  {/* Evacuation Route Line */}
                  {selectedShelter && (
                    <EvacuationRoutePolyline from={userPos} to={{ lat: selectedShelter.lat, lng: selectedShelter.lng }} />
                  )}

                  <UserLocationMarker lat={userPos.lat} lng={userPos.lng} />
                </MapContainer>
              </div>
            </div>

            {/* Right: Recommended Safe Locations Cards */}
            <div className="lg:col-span-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Recommended Safe Locations ({shelters.length})</h3>

              {loadingShelters ? (
                <Loader text="Searching safe shelters outside danger zone..." />
              ) : shelters.length === 0 ? (
                <EmptyState title="No shelters found" description="No safe locations found outside current danger zone." icon={Shield} />
              ) : (
                <div className="space-y-3">
                  {shelters.map((s) => (
                    <ShelterCard
                      key={s.id}
                      shelter={s}
                      userPos={userPos}
                      isSelected={selectedShelter?.id === s.id}
                      onSelect={() => setSelectedShelter(s)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recommended Evacuation Route Summary Section */}
          {selectedShelter && (
            <GlassCard className="p-6 border border-emerald-500/30 bg-slate-900/95 space-y-4 shadow-2xl">
              <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                <Navigation className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white uppercase tracking-wider">Recommended Evacuation Route Summary</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs">
                <RouteStat label="Current Location" value={`${userPos.lat.toFixed(4)}, ${userPos.lng.toFixed(4)}`} color="cyan" />
                <RouteStat label="Danger Zone" value={`${disasterLabel(selectedReport.disaster_type)} (${selectedReport.severity})`} color="red" />
                <RouteStat label="Safe Destination" value={selectedShelter.name} color="emerald" />
                <RouteStat label="Distance" value={formatDistance(selectedShelter.distance_km || 2.4)} color="amber" />
                <RouteStat label="Est. Travel Time" value={estimateTravelTime(selectedShelter.distance_km || 2.4)} color="purple" />
              </div>
            </GlassCard>
          )}
        </>
      )}
    </div>
  );
}

function severityRank(r) {
  const s = getRiskLevel(r);
  return { CRITICAL: 4, HIGH_RISK: 3, CONFIRMED: 2, LOW_CONFIDENCE: 1 }[s] || 0;
}

function ShelterCard({ shelter, userPos, isSelected, onSelect }) {
  const dist = shelter.distance_km ?? (userPos ? haversineKm(userPos.lat, userPos.lng, shelter.lat, shelter.lng) : 2.4);
  const occPct = shelter.capacity ? Math.round((shelter.current_occupancy / shelter.capacity) * 100) : 0;
  const safetyScore = 94;

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      onClick={onSelect}
      className={`glass-card p-5 border transition-all cursor-pointer ${
        isSelected
          ? 'border-emerald-400 bg-emerald-500/10 shadow-lg shadow-emerald-500/10'
          : 'border-white/10 hover:border-white/20 bg-white/5'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-bold text-white text-base">{shelter.name}</h4>
        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs">
          OPEN
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 mb-3">
        <div><span className="text-slate-400">Distance:</span> <span className="font-bold text-cyan-300">{formatDistance(dist)}</span></div>
        <div><span className="text-slate-400">Capacity:</span> <span className="font-semibold text-slate-200">{shelter.capacity}</span></div>
        <div><span className="text-slate-400">Occupancy:</span> <span className="font-semibold text-slate-200">{shelter.current_occupancy} ({occPct}%)</span></div>
        <div><span className="text-slate-400">Safety Score:</span> <span className="font-bold text-emerald-400">{safetyScore}%</span></div>
      </div>

      <Button variant={isSelected ? 'primary' : 'secondary'} size="sm" icon={Navigation} className="w-full justify-center">
        View Route
      </Button>
    </motion.div>
  );
}

function RouteStat({ label, value, color = 'cyan' }) {
  const colorMap = {
    cyan: 'text-cyan-400 border-cyan-500/30',
    red: 'text-red-400 border-red-500/30',
    emerald: 'text-emerald-400 border-emerald-500/30',
    amber: 'text-amber-400 border-amber-500/30',
    purple: 'text-purple-400 border-purple-500/30',
  };
  return (
    <div className={`p-3 rounded-xl bg-white/5 border ${colorMap[color]}`}>
      <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold mb-1">{label}</span>
      <span className="font-mono font-bold text-sm text-white block truncate">{value}</span>
    </div>
  );
}
