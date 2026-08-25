import { Mountain, Layers, ShieldCheck, AlertCircle } from 'lucide-react';
import { useRealtime } from '../context/RealtimeContext';

export default function TerrainEvidence() {
  const { riskEngine } = useRealtime();

  return (
    <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-5 text-white">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Mountain className="w-5 h-5 text-amber-400" />
          <h3 className="font-extrabold text-lg uppercase tracking-tight">SATELLITE / TERRAIN EVIDENCE</h3>
        </div>
        <span className="px-3 py-1 rounded-full bg-slate-950 border border-cyan-500/40 text-cyan-300 font-bold text-xs font-mono">
          Satellite layer ??? integration ready
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-slate-400 block font-semibold">Terrain Hazard Risk</span>
          <span className="font-black text-red-400 text-sm block">HIGH (81%)</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-slate-400 block font-semibold">Slope Steepness</span>
          <span className="font-black text-white text-sm block">38?? Angle</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-slate-400 block font-semibold">Elevation Altitude</span>
          <span className="font-black text-cyan-300 text-sm block">1,420 m</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-slate-400 block font-semibold">Historical Landslide Zone</span>
          <span className="font-black text-amber-400 text-sm block">Zone 4 Ridge</span>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0" />
        <span>GIS Remote Sensing Note: Satellite radar & Sentinel SAR land deformation API layers are integration-ready.</span>
      </div>
    </div>
  );
}
