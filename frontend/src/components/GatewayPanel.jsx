import { Radio, Wifi, Battery, Volume2, ShieldAlert, Cpu } from 'lucide-react';
import { useRealtime } from '../context/RealtimeContext';

export default function GatewayPanel() {
  const { gatewayStatus, issueGatewaySiren } = useRealtime();

  return (
    <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-5 text-white select-none">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Radio className="w-5 h-5 text-red-500" />
          <h3 className="font-extrabold text-lg uppercase tracking-tight">REMOTE VILLAGE EMERGENCY GATEWAY</h3>
        </div>
        <span className="px-3 py-1 rounded-full bg-amber-950 border border-amber-500/50 text-amber-300 font-extrabold text-xs font-mono uppercase">
          ???? SIMULATION / FUTURE HARDWARE
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-slate-400 block font-medium font-sans">Hardware Gateway</span>
          <span className="font-bold text-emerald-400 text-base mt-0.5 block flex items-center gap-1">
            <Wifi className="w-4 h-4" /> ???? ONLINE
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-slate-400 block font-medium font-sans">Battery Backup</span>
          <span className="font-bold text-white text-base mt-0.5 block flex items-center gap-1">
            <Battery className="w-4 h-4 text-emerald-400" /> 87%
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-slate-400 block font-medium font-sans">Siren / Loudspeaker</span>
          <span className="font-bold text-cyan-400 text-base mt-0.5 block flex items-center gap-1">
            <Volume2 className="w-4 h-4" /> READY
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-slate-400 block font-medium font-sans">Last Heartbeat</span>
          <span className="font-bold text-slate-300 text-base mt-0.5 block">2m ago</span>
        </div>
      </div>

      {/* Hardware Architecture Flow */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 flex items-center justify-between overflow-x-auto">
        <span className="text-cyan-400 font-bold">CENTRAL SYSTEM</span>
        <span>&rarr;</span>
        <span className="text-amber-300 font-bold">ESP32 GATEWAY</span>
        <span>&rarr;</span>
        <span className="text-red-400 font-bold">PHYSICAL SIREN / SPEAKER</span>
        <span>&rarr;</span>
        <span className="text-emerald-400 font-bold">LOCAL VILLAGERS</span>
      </div>

      <button
        onClick={issueGatewaySiren}
        className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2"
      >
        <Volume2 className="w-4 h-4" />
        <span>[ TEST REMOTE HARDWARE SIREN (SIMULATED) ]</span>
      </button>
    </div>
  );
}
