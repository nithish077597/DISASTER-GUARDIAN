import { Navigation, AlertTriangle, CheckCircle2, Ban } from 'lucide-react';
import { useRealtime } from '../context/RealtimeContext';

export default function RoadStatus() {
  const { roadStatuses } = useRealtime();

  return (
    <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 text-white">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Navigation className="w-5 h-5 text-amber-400" />
          <h3 className="font-extrabold text-lg uppercase tracking-tight">ROAD STATUS MONITORING</h3>
        </div>
        <span className="text-xs text-slate-400 font-mono">Live Transit Networks</span>
      </div>

      <div className="space-y-3">
        {roadStatuses.map((road) => (
          <div
            key={road.id}
            className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
          >
            <div>
              <p className="font-extrabold text-white text-sm">{road.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">{road.condition}</p>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-black font-mono uppercase tracking-wider ${
                road.status === 'OPEN'
                  ? 'bg-emerald-950 border border-emerald-500/50 text-emerald-400'
                  : road.status === 'AT RISK'
                  ? 'bg-amber-950 border border-amber-500/50 text-amber-400'
                  : 'bg-red-950 border border-red-600 text-red-400'
              }`}
            >
              ??? {road.status}
            </span>
          </div>
        ))}
      </div>

      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
        <Ban className="w-4 h-4 text-red-400 shrink-0" />
        <span>Rerouting Rule: Blocked roads are dynamically excluded from all evacuation path calculations.</span>
      </div>
    </div>
  );
}
