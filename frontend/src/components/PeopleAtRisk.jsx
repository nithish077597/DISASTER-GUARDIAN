import { Link } from 'react-router-dom';
import { Users, MapPin, AlertTriangle, Map } from 'lucide-react';
import { useRealtime } from '../context/RealtimeContext';

export default function PeopleAtRisk() {
  const { populationAtRisk } = useRealtime();

  return (
    <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-5 text-white">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-red-500" />
          <h3 className="font-extrabold text-lg uppercase tracking-tight">PEOPLE AT RISK</h3>
        </div>
        <span className="text-xs text-slate-400 font-mono">Emergency Impact</span>
      </div>

      <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
        <div className="flex items-baseline justify-between">
          <p className="text-4xl font-black text-white">{populationAtRisk.count}</p>
          <span className="text-xs text-amber-400 font-bold font-mono">+{populationAtRisk.deltaTenMin} in last 10 min</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs text-slate-300">
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-slate-400 block">Villages Affected</span>
            <span className="font-bold text-white text-sm mt-0.5 block">{populationAtRisk.villages}</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-slate-400 block">Homes</span>
            <span className="font-bold text-white text-sm mt-0.5 block">{populationAtRisk.homes}</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-slate-400 block">Schools</span>
            <span className="font-bold text-white text-sm mt-0.5 block">{populationAtRisk.schools}</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-slate-400 block">Hospitals</span>
            <span className="font-bold text-white text-sm mt-0.5 block">{populationAtRisk.hospitals}</span>
          </div>
        </div>

        {/* Priority breakdown */}
        <div className="space-y-1 pt-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Evacuation Priority Breakdown:</p>
          <div className="grid grid-cols-3 gap-2 text-xs text-center font-mono">
            <div className="p-2 rounded-lg bg-red-950/60 border border-red-600/60 text-red-400 font-bold">
              CRITICAL: {populationAtRisk.breakdown.critical}
            </div>
            <div className="p-2 rounded-lg bg-orange-950/60 border border-orange-600/60 text-orange-400 font-bold">
              HIGH: {populationAtRisk.breakdown.high}
            </div>
            <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-600/60 text-amber-300 font-bold">
              MODERATE: {populationAtRisk.breakdown.moderate}
            </div>
          </div>
        </div>
      </div>

      <Link to="/map">
        <button className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs uppercase tracking-wider border border-slate-700 transition-all flex items-center justify-center gap-2">
          <Map className="w-4 h-4 text-cyan-400" />
          <span>[ VIEW AFFECTED AREA ]</span>
        </button>
      </Link>
    </div>
  );
}
