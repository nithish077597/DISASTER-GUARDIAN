import { getSeverityInfo, disasterLabel } from '../utils/helpers';

export default function MapLegend() {
  const items = [
    { label: 'Low Confidence', color: '#475569', shape: '○' },
    { label: 'Confirmed', color: '#d97706', shape: '◐' },
    { label: 'High Risk', color: '#ea580c', shape: '◉' },
    { label: 'Critical', color: '#dc2626', shape: '⬤' },
    { label: 'Safe Location', color: '#22c55e', shape: '◆' },
    { label: 'Evacuation Route', color: '#06b6d4', shape: '—' },
  ];

  return (
    <div className="glass-card p-3 rounded-xl border border-white/10 bg-slate-900/90 backdrop-blur-md space-y-2">
      <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">Map Legend</h4>
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2 text-[11px]">
          <span className="w-4 h-4 flex items-center justify-center text-xs" style={{ color: item.color }}>
            {item.shape}
          </span>
          <span className="text-slate-300">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
