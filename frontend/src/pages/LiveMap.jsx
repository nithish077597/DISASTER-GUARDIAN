import { useState } from 'react';
import { MapContainer, TileLayer, Circle, Polyline } from 'react-leaflet';
import { Map, Layers, RefreshCw, Activity, Shield } from 'lucide-react';
import { useRealtime } from '../context/RealtimeContext';
import { RedBeaconMarker, ShelterMarker, UserMarker } from '../components/MapMarkers';
import 'leaflet/dist/leaflet.css';

export default function LiveMap() {
  const { shelters, roadStatuses, riskEngine } = useRealtime();

  const [activeLayer, setActiveLayer] = useState('ALL'); // 'ALL' | 'RISK' | 'SHELTERS' | 'ROADS'
  const center = [28.621, 77.214];

  return (
    <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 text-white select-none">
      {/* Map Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Map className="w-5 h-5 text-cyan-400" />
          <h3 className="font-extrabold text-lg uppercase tracking-tight">REAL-TIME GIS DISASTER MAP</h3>
        </div>

        {/* Real-time map data streaming status badge */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/80 border border-red-500/50 text-red-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>??? REAL-TIME MAP DATA - Synced 3s ago</span>
          </span>

          {/* Layer toggles */}
          <div className="flex gap-1">
            {['ALL', 'RISK', 'SHELTERS', 'ROADS'].map((layer) => (
              <button
                key={layer}
                onClick={() => setActiveLayer(layer)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                  activeLayer === layer
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {layer}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive GIS Leaflet Container */}
      <div className="h-[480px] w-full rounded-2xl overflow-hidden border border-slate-800 relative z-10 shadow-2xl">
        <MapContainer center={center} zoom={13} scrollWheelZoom={true} className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Animated Pulsing Red Beacon Light on Affected Landslide Zone */}
          {(activeLayer === 'ALL' || activeLayer === 'RISK') && (
            <>
              <RedBeaconMarker
                position={center}
                title="Kallar Valley Critical Landslide Slope"
                riskScore={91}
                peopleAtRisk={143}
                rainfall={142}
              />
              <Circle
                center={center}
                radius={900}
                pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.35, weight: 3 }}
              />
            </>
          )}

          {/* User Current Location Marker */}
          <UserMarker position={[28.618, 77.208]} />

          {/* Shelters */}
          {(activeLayer === 'ALL' || activeLayer === 'SHELTERS') &&
            shelters.map((s) => <ShelterMarker key={s.id} shelter={s} />)}

          {/* Blocked Road Segment Lines */}
          {(activeLayer === 'ALL' || activeLayer === 'ROADS') &&
            roadStatuses.map((road) => (
              <Polyline
                key={road.id}
                positions={road.latlngs}
                pathOptions={{
                  color: road.status === 'BLOCKED' ? '#ef4444' : road.status === 'AT RISK' ? '#f97316' : '#10b981',
                  weight: 5,
                  dashArray: road.status === 'BLOCKED' ? '8, 8' : null,
                }}
              />
            ))}
        </MapContainer>

        {/* Legend Overlay */}
        <div className="absolute bottom-4 right-4 z-[1000] p-3 rounded-xl bg-slate-950/90 border border-slate-800 text-[11px] font-mono space-y-1 text-slate-300 backdrop-blur-md">
          <span className="font-bold text-white uppercase block border-b border-slate-800 pb-1">GIS Map Legend</span>
          <div className="flex items-center gap-2 text-red-400 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span>???? Affected Red Light Beacon</span>
          </div>
          <div className="flex items-center gap-2 text-amber-400">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>???? High Risk Area</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>???? Open Shelter / Safe Route</span>
          </div>
        </div>
      </div>
    </div>
  );
}
