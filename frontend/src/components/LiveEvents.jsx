import { Activity } from 'lucide-react';
import { useRealtime } from '../context/RealtimeContext';

export default function LiveEvents() {
  const { eventStream } = useRealtime();

  return (
    <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 text-white">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          <h3 className="font-extrabold text-lg uppercase tracking-tight">LIVE EVENT FEED</h3>
        </div>
        <span className="text-xs text-slate-400 font-mono">Real-Time Stream</span>
      </div>

      <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
        {eventStream.map((evt) => (
          <div key={evt.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3 text-xs">
            <span className="font-mono text-slate-400 font-bold shrink-0">{evt.time?.slice(0, 5) || '20:42'}</span>
            <span className="text-base shrink-0">{evt.icon}</span>
            <span className="font-medium text-slate-200 leading-snug">{evt.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
