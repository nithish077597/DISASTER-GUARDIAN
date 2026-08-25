import { Activity } from 'lucide-react';
import RiskAnalysis from '../components/RiskAnalysis';
import RiskTimeline from '../components/RiskTimeline';
import HistoricalDataPanel from '../components/HistoricalDataPanel';

export default function RiskPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto select-none">
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div>
          <h1 className="text-xl font-extrabold text-white uppercase tracking-tight flex items-center gap-2">
            <Activity className="w-6 h-6 text-red-500" />
            <span>AI LANDSLIDE RISK ENGINE & PREDICTION MATRIX</span>
          </h1>
          <p className="text-xs text-slate-400">Multi-factor terrain risk calculation and 12-hour warning timeline</p>
        </div>
        <span className="px-3 py-1 rounded-full bg-red-950 border border-red-600 text-red-400 font-mono font-bold text-xs">
          RISK SCORE: 91/100 (CRITICAL)
        </span>
      </div>

      <RiskAnalysis />
      <RiskTimeline />
      <HistoricalDataPanel />
    </div>
  );
}
