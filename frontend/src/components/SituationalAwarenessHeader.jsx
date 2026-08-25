import { motion } from 'framer-motion';
import { AlertTriangle, MapPin, ShieldAlert, Users, Route, Navigation, Send, Radio, CheckCircle2, Clock } from 'lucide-react';
import { useRealtime } from '../context/RealtimeContext';
import { Link } from 'react-router-dom';

export default function SituationalAwarenessHeader() {
  const {
    riskEngine,
    populationAtRisk,
    roadStatuses,
    shelters,
    alertDelivery,
    gateways,
    clock,
    connectionState,
    lastDataUpdateSec,
  } = useRealtime();

  const blockedRoad = roadStatuses.find((r) => r.status === 'BLOCKED') || roadStatuses[0];
  const openShelter = shelters.find((s) => s.status === 'OPEN') || shelters[0];
  const onlineGatewaysCount = gateways.filter((g) => g.status === 'ONLINE').length;

  return (
    <motion.section
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 p-5 md:p-6 glass-card bg-gradient-to-r from-slate-900 via-slate-900 to-red-950/30 border-2 border-red-500/30 rounded-3xl shadow-2xl relative overflow-hidden"
    >
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-white/10 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-[10px] font-extrabold text-red-400 uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              OPERATOR COMMAND CONSOLE ??? 3-SECOND SITUATIONAL SUMMARY
            </span>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              Local Time: {clock}
            </span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Disaster Operational Status: <span className="text-red-400">{riskEngine.level}</span>
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-medium">Data Stream:</span>
            <span className="font-mono font-bold text-emerald-400">{connectionState}</span>
            <span className="text-slate-500 text-[10px]">({lastDataUpdateSec}s ago)</span>
          </div>
        </div>
      </div>

      {/* 8-Point 3-Second Awareness Answers Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* 1. WHAT */}
        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-red-500/40 transition-all">
          <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider">1. WHAT</p>
          <p className="text-xs font-black text-white mt-1 truncate">Landslide Slip</p>
          <p className="text-[10px] text-slate-400">Slope collapse</p>
        </div>

        {/* 2. WHERE */}
        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-red-500/40 transition-all">
          <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider">2. WHERE</p>
          <p className="text-xs font-black text-white mt-1 truncate">Village X Slope</p>
          <p className="text-[10px] text-slate-400">Zone 4 Ridge</p>
        </div>

        {/* 3. HOW SERIOUS */}
        <div className="p-3 rounded-2xl bg-red-500/15 border border-red-500/40 hover:scale-[1.02] transition-all">
          <p className="text-[10px] font-bold text-red-300 uppercase tracking-wider">3. SEVERITY</p>
          <p className="text-sm font-black text-red-400 mt-0.5">{riskEngine.score}% Risk</p>
          <p className="text-[10px] text-red-300 font-extrabold">{riskEngine.level}</p>
        </div>

        {/* 4. WHO */}
        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-500/40 transition-all">
          <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">4. WHO</p>
          <p className="text-xs font-black text-white mt-1">{populationAtRisk.count} Citizens</p>
          <p className="text-[10px] text-amber-300 font-medium">+{populationAtRisk.deltaTenMin} in 10m</p>
        </div>

        {/* 5. WHICH ROADS */}
        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-rose-500/40 transition-all">
          <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">5. ROADS</p>
          <p className="text-xs font-black text-rose-300 mt-1 truncate">{blockedRoad.name}</p>
          <p className="text-[10px] text-rose-400 font-bold">???? BLOCKED</p>
        </div>

        {/* 6. WHERE TO EVACUATE */}
        <Link to="/evacuation" className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 hover:border-emerald-500/60 transition-all">
          <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">6. EVACUATE TO</p>
          <p className="text-xs font-black text-emerald-300 mt-1 truncate">{openShelter.name}</p>
          <p className="text-[10px] text-emerald-400 font-semibold">{openShelter.current_occupancy}/{openShelter.capacity} spots</p>
        </Link>

        {/* 7. ALERT SENT */}
        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/40 transition-all">
          <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">7. ALERT SENT</p>
          <p className="text-xs font-black text-white mt-1">
            {alertDelivery.active ? `${alertDelivery.sms.delivered} Delivered` : 'Ready to Dispatch'}
          </p>
          <p className="text-[10px] text-cyan-300 font-medium">{alertDelivery.active ? '100% Broadcast' : 'Pending'}</p>
        </div>

        {/* 8. COMMS AVAILABLE */}
        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/40 transition-all">
          <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">8. COMMS</p>
          <p className="text-xs font-black text-emerald-300 mt-1">{onlineGatewaysCount}/{gateways.length} Gateways</p>
          <p className="text-[10px] text-emerald-400 font-semibold">Siren Ready</p>
        </div>
      </div>
    </motion.section>
  );
}
