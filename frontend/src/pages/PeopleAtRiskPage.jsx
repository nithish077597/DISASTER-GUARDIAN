import { Users, AlertTriangle, ShieldCheck, PhoneCall, CheckCircle2, MessageSquare } from 'lucide-react';
import PeopleAtRisk from '../components/PeopleAtRisk';
import TargetedSmsPanel from '../components/TargetedSmsPanel';

export default function PeopleAtRiskPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto select-none">
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div>
          <h1 className="text-xl font-extrabold text-white uppercase tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-red-500" />
            <span>POPULATION AT RISK & GEOFENCE IMPACT ANALYSIS</span>
          </h1>
          <p className="text-xs text-slate-400">Aggregated resident safety metrics in active disaster zones</p>
        </div>
        <span className="px-3 py-1 rounded-full bg-red-950 border border-red-600 text-red-400 font-mono font-bold text-xs">
          143 RESIDENTS IN DANGER ZONE
        </span>
      </div>

      <PeopleAtRisk />
      <TargetedSmsPanel />
    </div>
  );
}
