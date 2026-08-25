import { Radio, ShieldCheck, Activity } from 'lucide-react';
import GatewayPanel from '../components/GatewayPanel';
import AuditLogsPanel from '../components/AuditLogsPanel';

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto select-none">
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div>
          <h1 className="text-xl font-extrabold text-white uppercase tracking-tight flex items-center gap-2">
            <Radio className="w-6 h-6 text-cyan-400" />
            <span>SYSTEM STATUS & AUTHORITY AUDIT LOGS</span>
          </h1>
          <p className="text-xs text-slate-400">Software-only telemetry integrations and official authority action records</p>
        </div>
        <span className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-600 text-emerald-400 font-mono font-bold text-xs">
          ???? SOFTWARE SYSTEM OPERATIONAL
        </span>
      </div>

      <GatewayPanel />
      <AuditLogsPanel />
    </div>
  );
}
