import DemoBar from '../components/DemoBar';
import EvacuationPanel from '../components/EvacuationPanel';
import { useRealtime } from '../context/RealtimeContext';
import { Navigation, Users, Shield, CheckCircle2 } from 'lucide-react';

export default function SheltersPage() {
  const { shelters } = useRealtime();

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white">
      <DemoBar />
      <EvacuationPanel />

      {/* Shelters List Cards */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
        <h3 className="font-extrabold text-lg uppercase tracking-tight flex items-center gap-2">
          <HomeIcon className="w-5 h-5 text-emerald-400" />
          MONITORED COMMUNITY DISASTER SHELTERS ({shelters.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {shelters.map((s) => (
            <div key={s.id} className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white text-base">{s.name}</h4>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono uppercase ${
                  s.status === 'OPEN' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/50' : 'bg-red-950 text-red-400 border border-red-500/50'
                }`}>
                  {s.status}
                </span>
              </div>

              <p className="text-xs text-slate-400">{s.address} ??? {s.distance_km} km</p>

              <div className="space-y-1 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>Occupancy:</span>
                  <span className="font-bold text-white">{s.current_occupancy} / {s.capacity}</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full ${s.status === 'FULL' ? 'bg-red-500' : 'bg-emerald-400'}`}
                    style={{ width: `${Math.round((s.current_occupancy / s.capacity) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                <span>Accessibility: {s.wheelchair ? '??? Wheelchair' : 'Standard'}</span>
                <span>Medical Support: {s.medical ? '???? Active' : 'Basic'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HomeIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  );
}
