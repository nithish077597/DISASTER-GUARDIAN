import { useRealtime } from '../context/RealtimeContext';

export default function RiskCards() {
  const { riskEngine, weatherData, populationAtRisk, roadStatuses } = useRealtime();

  const blockedRoadsCount = roadStatuses.filter((r) => r.status === 'BLOCKED').length;

  return (
    <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {/* 1. LANDSLIDE RISK */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">LANDSLIDE RISK</p>
        <p className="text-3xl font-black text-red-500">{riskEngine.score}%</p>
        <p className="text-xs font-bold text-red-400 uppercase">{riskEngine.level}</p>
      </div>

      {/* 2. RAINFALL */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">RAINFALL</p>
        <p className="text-3xl font-black text-white">{weatherData.current.precipitation || 84} mm</p>
        <p className="text-xs font-bold text-orange-400 uppercase">HIGH</p>
      </div>

      {/* 3. SOIL MOISTURE */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">SOIL MOISTURE</p>
        <p className="text-3xl font-black text-white">{riskEngine.inputs.soilMoisture || 82}%</p>
        <p className="text-xs font-bold text-orange-400 uppercase">HIGH</p>
      </div>

      {/* 4. PEOPLE AT RISK */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">PEOPLE AT RISK</p>
        <p className="text-3xl font-black text-white">{populationAtRisk.count}</p>
        <p className="text-xs text-amber-400 font-medium">+{populationAtRisk.deltaTenMin} in 10m</p>
      </div>

      {/* 5. ROAD STATUS */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">ROAD STATUS</p>
        <p className="text-3xl font-black text-red-400">{blockedRoadsCount} BLOCKED</p>
        <p className="text-xs text-slate-400">Village Road B</p>
      </div>
    </section>
  );
}
