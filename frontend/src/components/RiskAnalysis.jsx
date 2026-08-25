import { Activity, ShieldCheck, AlertCircle } from 'lucide-react';
import { useRealtime } from '../context/RealtimeContext';

export default function RiskAnalysis() {
  const { riskEngine, lastDataUpdateSec } = useRealtime();

  const factors = [
    { name: 'Rainfall', value: 92, color: 'bg-red-500' },
    { name: 'Soil Moisture', value: 82, color: 'bg-orange-500' },
    { name: 'Slope', value: 76, color: 'bg-amber-500' },
    { name: 'Historical Landslide Risk', value: 68, color: 'bg-yellow-500' },
    { name: 'Citizen Reports', value: 42, color: 'bg-blue-500' },
  ];

  return (
    <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6 text-white">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-red-500" />
            <h3 className="font-extrabold text-lg tracking-tight uppercase">LANDSLIDE RISK PREDICTION</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Automated environmental factor analysis & hazard modeling</p>
        </div>

        <div className="text-right text-xs text-slate-400 font-mono">
          Last calculation: <strong className="text-slate-200">{lastDataUpdateSec} seconds ago</strong>
        </div>
      </div>

      {/* Main Score & AI Confidence */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-center md:text-left">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Predictive Hazard Score</p>
          <div className="flex items-baseline justify-center md:justify-start gap-3">
            <span className="text-4xl font-black text-red-500">{riskEngine.score} / 100</span>
            <span className="px-3 py-1 rounded-full bg-red-950 border border-red-600 text-red-400 font-extrabold text-xs">
              {riskEngine.level}
            </span>
          </div>
          <p className="text-xs text-slate-400">Breaches emergency slippage threshold</p>
        </div>

        <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-400 uppercase">AI Model Confidence</span>
            <span className="font-black text-emerald-400 text-base">91%</span>
          </div>
          <p className="text-xs text-slate-300 italic leading-relaxed">
            "High probability of landslide activity in the monitored region based on soil moisture and terrain saturation."
          </p>
        </div>
      </div>

      {/* Contributing Factors Progress Breakdown */}
      <div className="space-y-3">
        <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Contributing Hazard Factors</p>
        <div className="space-y-2.5">
          {factors.map((f) => (
            <div key={f.name} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">{f.name}</span>
                <span className="font-mono font-bold text-slate-200">{f.value}%</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                <div className={`h-full ${f.color}`} style={{ width: `${f.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Assistance Boundary Statement */}
      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3 text-xs text-slate-400">
        <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0" />
        <p>
          <strong className="text-slate-200">Decision Support Policy:</strong> AI predictions assist disaster management authorities. AI is NOT configured to make automated irreversible emergency decisions without human review.
        </p>
      </div>
    </div>
  );
}
