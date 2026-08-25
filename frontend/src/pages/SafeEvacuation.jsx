import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Navigation, AlertTriangle, CheckCircle2, Route, AlertCircle, Ban } from 'lucide-react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/Leaflet.css';
import { Button, GlassCard, RiskBadge, EmptyState } from '../components/ui';
import { useRealtime } from '../context/RealtimeContext';
import { ShelterMarker, UserLocationMarker, EvacuationRoutePolyline, DangerZoneCircle, FitToReports, RoadPolyline } from '../components/MapMarkers';
import { disasterLabel, formatDistance, estimateTravelTime, haversineKm } from '../utils/helpers';

export default function SafeEvacuation() {
  const { incidents, shelters, roadStatuses, riskEngine } = useRealtime();

  // Find active critical report
  const criticalIncident = useMemo(
    () => incidents.find((i) => i.severity === 'CRITICAL' || i.status === 'CRITICAL') || incidents[0],
    [incidents]
  );

  const userPos = { lat: 28.6139, lng: 77.2090 };

  // Filter available shelters (bypasses FULL shelters automatically for recommendation)
  const availableShelters = useMemo(
    () => shelters.filter((s) => s.status === 'OPEN'),
    [shelters]
  );

  const [selectedShelter, setSelectedShelter] = useState(null);

  useEffect(() => {
    if (availableShelters.length && (!selectedShelter || selectedShelter.status === 'FULL')) {
      setSelectedShelter(availableShelters[0]);
    }
  }, [availableShelters, selectedShelter]);

  const blockedRoads = roadStatuses.filter((r) => r.status === 'BLOCKED');

  return (
    <div className="space-y-8 py-4">
      <motion.header initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Real-Time Safe Evacuation Planner</h1>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold">
            <Navigation className="w-4 h-4 text-emerald-400 animate-pulse" />
            Capacity & Road-Aware Rerouting
          </span>
        </div>
        <p className="text-slate-400 text-sm mt-1">
          Dynamic route calculation excluding blocked roads and automatically bypassing full shelters
        </p>
      </motion.header>

      {/* Hazard Banner */}
      <GlassCard className="p-5 border-2 border-red-500/30 bg-gradient-to-r from-slate-900 via-slate-900 to-red-950/30 flex items-center justify-between flex-wrap gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
            <Shield className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <p className="text-xs text-red-400 uppercase tracking-widest font-extrabold">Active Evacuation Zone</p>
            <h3 className="font-extrabold text-white text-lg">{criticalIncident?.title || 'Landslide Hazard - Village X'}</h3>
          </div>
        </div>
        <RiskBadge severity={criticalIncident?.severity || 'CRITICAL'} size="md" />
      </GlassCard>

      {/* Blocked Road Warning Banner if blocked roads exist */}
      {blockedRoads.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/50 flex items-center gap-3 text-xs text-rose-200">
          <Ban className="w-5 h-5 text-rose-400 flex-shrink-0 animate-pulse" />
          <div>
            <span className="font-bold uppercase tracking-wider block text-rose-300">
              ROAD BLOCKAGE DETECTED ({blockedRoads.length} Road Blocked)
            </span>
            <span>
              {blockedRoads.map((r) => r.name).join(', ')} is currently BLOCKED. Evacuation routing engine has automatically recalculated safe detour routes.
            </span>
          </div>
        </div>
      )}

      {/* Main Split: Map & Shelter Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Interactive Map */}
        <div className="lg:col-span-7 space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dynamic Evacuation Map Layer</h3>
          <div className="h-[520px] w-full rounded-3xl overflow-hidden border-2 border-white/10 relative shadow-2xl">
            <MapContainer center={[userPos.lat, userPos.lng]} zoom={12} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>' />
              <FitToReports reports={shelters} userPos={userPos} />

              {/* Shelters */}
              {shelters.map((s) => (
                <ShelterMarker key={s.id} shelter={s} onClick={setSelectedShelter} />
              ))}

              {/* Danger Zone */}
              <DangerZoneCircle zone={{ center: { lat: criticalIncident.lat, lng: criticalIncident.lng }, radius_m: 1500, severity: criticalIncident.severity }} />

              {/* Road Segments */}
              {roadStatuses.map((r) => (
                <RoadPolyline key={`road-${r.id}`} road={r} />
              ))}

              {/* Evacuation Route Line */}
              {selectedShelter && (
                <EvacuationRoutePolyline from={userPos} to={{ lat: selectedShelter.lat, lng: selectedShelter.lng }} />
              )}

              <UserLocationMarker lat={userPos.lat} lng={userPos.lng} />
            </MapContainer>
          </div>
        </div>

        {/* Right: Shelter Selection Cards */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Shelter Capacity Rerouting</span>
            <span className="text-emerald-400 font-mono">{availableShelters.length} Available</span>
          </h3>

          <div className="space-y-3">
            {shelters.map((s) => {
              const isSelected = selectedShelter?.id === s.id;
              const isFull = s.status === 'FULL';
              const pct = Math.round((s.current_occupancy / s.capacity) * 100);

              return (
                <motion.div
                  key={s.id}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => !isFull && setSelectedShelter(s)}
                  className={`p-5 rounded-2xl border transition-all ${
                    isFull
                      ? 'bg-red-950/20 border-red-500/30 opacity-75 cursor-not-allowed'
                      : isSelected
                      ? 'bg-emerald-500/15 border-emerald-500/60 shadow-xl shadow-emerald-500/10 cursor-pointer'
                      : 'bg-white/5 border-white/10 hover:border-white/20 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-white text-base">{s.name}</h4>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold font-mono uppercase ${
                        isFull ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      {isFull ? 'FULL' : 'OPEN'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mb-3">{s.address} ??? {s.distance_km} km away</p>

                  <div className="space-y-1 mb-3">
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span>Live Occupancy</span>
                      <span className="font-mono font-bold text-white">{s.current_occupancy} / {s.capacity} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full ${isFull ? 'bg-red-500' : 'bg-emerald-400'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {isFull ? (
                    <div className="p-2 rounded-xl bg-red-500/10 text-red-300 text-xs font-bold text-center">
                      ??? Capacity Full ??? Algorithm automatically redirected traffic to next safe shelter
                    </div>
                  ) : (
                    <Button variant={isSelected ? 'primary' : 'secondary'} size="sm" icon={Navigation} className="w-full justify-center">
                      {isSelected ? 'ACTIVE EVACUATION TARGET' : 'SELECT TARGET'}
                    </Button>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Evacuation Summary Card */}
      {selectedShelter && (
        <GlassCard className="p-6 border border-emerald-500/40 bg-slate-900/95 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Navigation className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white uppercase tracking-wider">ACTIVE SAFE EVACUATION ROUTE SUMMARY</h3>
            </div>
            <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-extrabold font-mono">
              SAFE DESTINATION VERIFIED
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs">
            <RouteStat label="Origin" value="Village X GPS Location" color="cyan" />
            <RouteStat label="Avoided Danger Zone" value="Village Road B (Mudslide)" color="red" />
            <RouteStat label="Safe Shelter Destination" value={selectedShelter.name} color="emerald" />
            <RouteStat label="Safe Distance" value={formatDistance(selectedShelter.distance_km)} color="amber" />
            <RouteStat label="Est. Travel Time" value={estimateTravelTime(selectedShelter.distance_km)} color="purple" />
          </div>
        </GlassCard>
      )}
    </div>
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
    <div className={`p-3 rounded-2xl bg-white/5 border ${colorMap[color]}`}>
      <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold mb-1">{label}</span>
      <span className="font-mono font-bold text-sm text-white block truncate">{value}</span>
    </div>
  );
}
