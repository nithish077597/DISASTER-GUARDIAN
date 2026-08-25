import { Database, Calendar, MapPin, AlertTriangle, Layers } from 'lucide-react';

const HISTORICAL_LANDSLIDES = [
  { id: 'h1', date: '14 July 2024', location: 'Kallar Pass Pass Road', severity: 'CRITICAL', rain: '168 mm/24h', slope: '39??', casualties: 0, road: 'NH-707', status: 'HISTORICAL' },
  { id: 'h2', date: '02 August 2023', location: 'Subansiri Slope Sector 4', severity: 'HIGH', rain: '134 mm/24h', slope: '36??', casualties: 0, road: 'SH-102', status: 'HISTORICAL' },
  { id: 'h3', date: '21 September 2022', location: 'Village Access Road B', severity: 'HIGH', rain: '121 mm/24h', slope: '34??', casualties: 0, road: 'VILL-B', status: 'HISTORICAL' },
  { id: 'h4', date: '09 June 2021', location: 'Highland Ridge Sector 2', severity: 'MODERATE', rain: '98 mm/24h', slope: '31??', casualties: 0, road: 'NH-707', status: 'HISTORICAL' },
];

export default function HistoricalDataPanel() {
  return (
    <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 text-white shadow-xl select-none">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-base font-black uppercase text-white tracking-tight flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-400" />
            <span>HISTORICAL LANDSLIDE INCIDENT MATRIX</span>
          </h2>
          <p className="text-xs text-slate-400">Past terrain collapse events used for AI model baseline training</p>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-blue-950 border border-blue-500/50 text-blue-300 font-mono font-bold text-xs">
          ???? DEMO DATASET
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {HISTORICAL_LANDSLIDES.map((item) => (
          <div key={item.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                {item.date}
              </span>
              <span className="px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 text-[10px] font-bold">
                {item.severity}
              </span>
            </div>

            <div className="space-y-0.5">
              <h3 className="font-extrabold text-sm text-white font-sans flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-red-400" />
                {item.location}
              </h3>
              <p className="text-[11px] text-slate-400 font-sans">
                Rainfall: <strong className="text-slate-200">{item.rain}</strong> ??? Slope: <strong className="text-slate-200">{item.slope}</strong> ??? Affected Road: <strong className="text-cyan-400">{item.road}</strong>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
