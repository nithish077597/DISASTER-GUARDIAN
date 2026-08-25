import { Clock, TrendingUp, AlertTriangle } from 'lucide-react';

const TIMELINE_SLOTS = [
  { time: '06:00', level: 'LOW', score: 18, rain: '12 mm/h', temp: '22??C', badge: 'bg-emerald-950 text-emerald-400 border-emerald-600' },
  { time: '10:00', level: 'MODERATE', score: 42, rain: '48 mm/h', temp: '24??C', badge: 'bg-amber-950 text-amber-400 border-amber-600' },
  { time: '14:00', level: 'HIGH', score: 76, rain: '94 mm/h', temp: '25??C', badge: 'bg-orange-950 text-orange-400 border-orange-600' },
  { time: '18:00 (FORECAST)', level: 'CRITICAL', score: 91, rain: '142 mm/h', temp: '23??C', badge: 'bg-red-950 text-red-400 border-red-600 animate-pulse' },
];

export default function RiskTimeline() {
  return (
    <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 text-white shadow-xl select-none">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-base font-black uppercase text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-red-500" />
            <span>RISK PREDICTION TIMELINE (EARLY WARNING)</span>
          </h2>
          <p className="text-xs text-slate-400">Forecasted landslide risk progression over the next 12 hours</p>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-red-950 border border-red-600 text-red-400 font-mono font-bold text-xs">
          CRITICAL FORECAST
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {TIMELINE_SLOTS.map((slot) => (
          <div key={slot.time} className={`p-4 rounded-2xl border ${slot.badge} space-y-2`}>
            <div className="flex items-center justify-between text-xs font-mono font-bold">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {slot.time}
              </span>
              <span>{slot.score}%</span>
            </div>

            <div className="space-y-0.5">
              <h3 className="font-extrabold text-sm uppercase">{slot.level}</h3>
              <p className="text-[11px] opacity-90 font-mono">??????? Rain: {slot.rain}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
