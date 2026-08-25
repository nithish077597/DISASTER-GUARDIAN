import { Link } from 'react-router-dom';
import { ShieldAlert, MapPin, Send, Route, CheckCircle2, Clock, Navigation } from 'lucide-react';
import { useRealtime } from '../context/RealtimeContext';

export default function EmergencyAlertBanner() {
  const {
    riskEngine,
    populationAtRisk,
    roadStatuses,
    lastDataUpdateSec,
    issueEmergencyAlert,
    setCriticalModalOpen,
  } = useRealtime();

  const isEmergency = riskEngine.level === 'CRITICAL' || riskEngine.score >= 80;
  const blockedRoadsCount = roadStatuses.filter((r) => r.status === 'BLOCKED').length;

  if (isEmergency) {
    return (
      <div className="p-6 md:p-8 bg-slate-900 border-2 border-red-600 rounded-2xl shadow-2xl text-white space-y-6 relative overflow-hidden select-none">
        {/* Red accent top stripe */}
        <div className="absolute top-0 inset-x-0 h-2 bg-red-600 animate-pulse" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-red-600/20 border border-red-600/60 flex items-center justify-center text-red-500 shrink-0">
              <ShieldAlert className="w-9 h-9 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span className="text-xs font-black text-red-500 uppercase tracking-widest">
                  CRITICAL EMERGENCY ACTIVE
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mt-0.5">
                ???? CRITICAL LANDSLIDE ALERT
              </h2>
              <p className="text-red-400 font-bold text-sm tracking-wide mt-0.5 uppercase">
                LANDSLIDE RISK DETECTED
              </p>
            </div>
          </div>

          <div className="text-right text-xs text-slate-400 font-mono">
            Updated: <strong className="text-white font-bold">{lastDataUpdateSec} seconds ago</strong>
          </div>
        </div>

        {/* Emergency Metrics Line */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Location</p>
            <p className="text-base font-extrabold text-white mt-1 truncate">High Risk Village (Village X)</p>
            <p className="text-[11px] text-slate-500">Slope Ridge Sector 4</p>
          </div>

          <div className="p-4 rounded-xl bg-red-950/40 border border-red-600/60">
            <p className="text-xs font-bold text-red-400 uppercase tracking-wider">Risk Score</p>
            <p className="text-3xl font-black text-red-500 mt-0.5">{riskEngine.score}%</p>
            <p className="text-[11px] text-red-400 font-extrabold">CRITICAL</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">People at Risk</p>
            <p className="text-2xl font-black text-white mt-1">{populationAtRisk.count}</p>
            <p className="text-[11px] text-amber-400 font-medium">+{populationAtRisk.deltaTenMin} in last 10m</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Roads Blocked</p>
            <p className="text-2xl font-black text-red-400 mt-1">{blockedRoadsCount}</p>
            <p className="text-[11px] text-slate-500">Village Road B</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-4 pt-2">
          <Link to="/map">
            <button className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider border border-slate-700 transition-all flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span>[ VIEW LIVE MAP ]</span>
            </button>
          </Link>

          <button
            onClick={() => {
              issueEmergencyAlert();
              setCriticalModalOpen(true);
            }}
            className="px-6 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-red-600/40 transition-all flex items-center gap-2"
          >
            <Send className="w-4 h-4 text-white" />
            <span>[ ISSUE EMERGENCY ALERT ]</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 bg-slate-900 border border-slate-800 rounded-2xl text-white space-y-3">
      <div className="flex items-center gap-3 text-emerald-400">
        <CheckCircle2 className="w-6 h-6" />
        <span className="text-xs font-extrabold uppercase tracking-widest">SYSTEM STATUS</span>
      </div>
      <h2 className="text-2xl font-extrabold text-white">??? NO ACTIVE CRITICAL EMERGENCY</h2>
      <p className="text-slate-400 text-xs">
        Environmental monitoring active. Sensor streams nominal.
      </p>
    </div>
  );
}
