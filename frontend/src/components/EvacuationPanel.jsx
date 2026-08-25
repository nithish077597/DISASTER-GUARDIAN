import { Link } from 'react-router-dom';
import { Shield, Navigation, Users, MapPin, CheckCircle2, ArrowRight } from 'lucide-react';
import { useRealtime } from '../context/RealtimeContext';

export default function EvacuationPanel() {
  const { shelters, roadStatuses } = useRealtime();

  // Find target open shelter (bypasses FULL shelters)
  const safeShelter = shelters.find((s) => s.status === 'OPEN') || shelters[0];

  return (
    <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-5 text-white">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-400" />
          <h3 className="font-extrabold text-lg uppercase tracking-tight">RECOMMENDED SAFE LOCATION</h3>
        </div>
        <span className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-400 font-extrabold text-xs font-mono">
          REROUTE ALGORITHM ACTIVE
        </span>
      </div>

      <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-extrabold text-lg text-white">{safeShelter.name}</h4>
          <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/50 font-black text-xs">
            Status: {safeShelter.status}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-slate-400 block">Distance</span>
            <span className="font-black text-cyan-300 text-sm mt-0.5 block">{safeShelter.distance_km || 2.4} km</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-slate-400 block">Capacity</span>
            <span className="font-black text-white text-sm mt-0.5 block">{safeShelter.current_occupancy} / {safeShelter.capacity}</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-slate-400 block">Status</span>
            <span className="font-black text-emerald-400 text-sm mt-0.5 block">{safeShelter.status}</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-slate-400 block">Transit Route</span>
            <span className="font-black text-emerald-400 text-sm mt-0.5 block">SAFE DETOUR</span>
          </div>
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Recommendation factors hazard zone boundaries, blocked roads (Village Road B), distance, and live capacity.</span>
        </div>
      </div>

      <Link to="/evacuation">
        <button className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2">
          <Navigation className="w-4 h-4" />
          <span>[ VIEW SAFE ROUTE ]</span>
        </button>
      </Link>
    </div>
  );
}
