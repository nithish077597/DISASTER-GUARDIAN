import { motion } from 'framer-motion';
import { Navigation, Users, Clock, MapPin } from 'lucide-react';

export default function EvacuationCard({ location }) {
  const occupancyPct = location.capacity ? Math.round((location.current_occupancy / location.capacity) * 100) : 0;

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      className="glass-card p-4 md:p-5 border border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-400/40 transition-all"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm md:text-base">{location.name}</h4>
            <span className="text-[11px] text-emerald-400 font-medium">SAFE ZONE</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 mb-4">
        <div className="flex items-center gap-1.5">
          <Navigation className="w-3 h-3 text-cyan-400" />
          <span>{location.distance_km != null ? `${location.distance_km.toFixed(1)} km` : '—'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-amber-400" />
          <span>{location.distance_km ? `${Math.max(1, Math.round(location.distance_km * 6))} min` : '—'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users className="w-3 h-3 text-slate-400" />
          <span>{location.current_occupancy ?? 0} / {location.capacity ?? '?'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-emerald-500/30" />
          <span>{occupancyPct}% full</span>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-semibold text-sm hover:bg-emerald-500/30 transition-colors flex items-center justify-center gap-2"
      >
        <Navigation className="w-4 h-4" />
        Start Navigation
      </motion.button>
    </motion.div>
  );
}
