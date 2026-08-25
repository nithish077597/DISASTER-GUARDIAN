import { ShieldCheck, Clock, FileText, CheckCircle2, AlertTriangle, User } from 'lucide-react';

const INITIAL_AUDIT_LOGS = [
  { id: 'log-101', timestamp: '23:45:12', action: 'REPORT_VERIFIED', officer: 'NDRF Officer Command (ID #4021)', details: 'Verified Citizen Hazard Report #1042 (Landslide Kallar Valley) with 87% AI evidence confidence.', severity: 'SUCCESS' },
  { id: 'log-102', timestamp: '23:41:08', action: 'ROAD_STATUS_UPDATED', officer: 'NDRF Officer Command (ID #4021)', details: 'Updated status for Village Access Road B to BLOCKED due to mudslide debris.', severity: 'WARNING' },
  { id: 'log-103', timestamp: '23:38:45', action: 'TARGETED_ALERT_DISPATCHED', officer: 'NDRF Officer Command (ID #4021)', details: 'Dispatched geofenced SMS, Voice, and App emergency warnings to 143 targeted residents in Zone A.', severity: 'CRITICAL' },
  { id: 'log-104', timestamp: '23:30:19', action: 'SHELTER_CAPACITY_UPDATED', officer: 'Relief Coordinator Desk', details: 'Highland Disaster Shelter Alpha marked FULL (80/80 capacity).', severity: 'INFO' },
  { id: 'log-105', timestamp: '23:15:02', action: 'ADMIN_LOGIN_AUTHENTICATED', officer: 'NDRF Officer Command (ID #4021)', details: 'Authenticated via Admin Secret Key DISASTER-ADMIN-2026.', severity: 'SUCCESS' },
];

export default function AuditLogsPanel() {
  return (
    <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 text-white shadow-xl select-none">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-base font-black uppercase text-white tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <span>AUTHORITY ACTION AUDIT LOGS</span>
          </h2>
          <p className="text-xs text-slate-400">Immutable record of official emergency operations decisions</p>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-cyan-950 border border-cyan-500/50 text-cyan-300 font-mono font-bold text-xs">
          SIH AUDIT READY
        </span>
      </div>

      <div className="space-y-2">
        {INITIAL_AUDIT_LOGS.map((log) => (
          <div key={log.id} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 text-xs font-mono">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5 font-bold">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>{log.timestamp}</span>
                <span className="text-slate-500">???</span>
                <span className="text-white uppercase tracking-wider">{log.action}</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-cyan-300">
                {log.officer}
              </span>
            </div>
            <p className="text-slate-300 font-sans leading-relaxed text-[11px]">
              {log.details}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
