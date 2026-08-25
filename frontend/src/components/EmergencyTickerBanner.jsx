import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Siren, X, BellRing, MessageSquareText, Mic, PhoneCall, MapPin } from 'lucide-react';
import { useRealtime } from '../context/RealtimeContext';

const CATEGORY_STYLES = {
  NORMAL: {
    container: 'border-sky-500/60 bg-sky-950/80',
    chip: 'bg-sky-500 text-white',
    text: 'text-sky-200',
    icon: 'text-sky-400',
    label: 'NORMAL',
  },
  HIGH: {
    container: 'border-amber-500/60 bg-amber-950/80',
    chip: 'bg-amber-500 text-black',
    text: 'text-amber-100',
    icon: 'text-amber-400',
    label: 'HIGH',
  },
  RISK: {
    container: 'border-orange-500/60 bg-orange-950/80',
    chip: 'bg-orange-500 text-white',
    text: 'text-orange-100',
    icon: 'text-orange-400',
    label: 'RISK',
  },
  CRITICAL: {
    container: 'border-red-600 bg-red-950/90 animate-pulse',
    chip: 'bg-red-600 text-white',
    text: 'text-red-100',
    icon: 'text-red-300',
    label: 'CRITICAL',
  },
};

const CHANNEL_ICONS = {
  NOTIFICATION: BellRing,
  SMS: MessageSquareText,
  'SMS (OFFLINE QUEUED)': MessageSquareText,
  'VOICE MESSAGE': Mic,
  'VOICE MAIL': Mic,
  'EMERGENCY CALL': PhoneCall,
};

export default function EmergencyTickerBanner() {
  const { emergencyMessages, dismissEmergencyMessage } = useRealtime();
  const [showAll, setShowAll] = useState(false);

  if (!emergencyMessages.length) return null;

  const visible = showAll ? emergencyMessages : emergencyMessages.slice(0, 2);

  return (
    <div className="fixed top-16 inset-x-0 z-[60] px-3 md:px-6 pointer-events-none">
      <div className="max-w-5xl mx-auto space-y-2">
        <AnimatePresence>
          {visible.map((msg) => {
            const style = CATEGORY_STYLES[msg.category] || CATEGORY_STYLES.NORMAL;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: -24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl border backdrop-blur-md shadow-2xl ${style.container}`}
              >
                <Siren className={`w-5 h-5 mt-0.5 shrink-0 ${style.icon}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-md font-mono font-black text-[10px] tracking-widest ${style.chip}`}>
                      {style.label}
                    </span>
                    <span className={`text-xs font-extrabold uppercase tracking-wide ${style.text}`}>
                      {msg.title}
                    </span>
                    {msg.locationName && (
                      <span className="flex items-center gap-1 text-[10px] text-slate-300 font-medium">
                        <MapPin className="w-3 h-3" />
                        {msg.locationName}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-200 mt-1 leading-snug">{msg.message}</p>
                  {msg.channels?.length > 0 && (
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {msg.channels.map((ch) => {
                        const Icon = CHANNEL_ICONS[ch] || BellRing;
                        return (
                          <span
                            key={ch}
                            className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/40 border border-white/10 text-[9px] font-mono font-bold text-slate-300 uppercase"
                          >
                            <Icon className="w-2.5 h-2.5" />
                            {ch}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => dismissEmergencyMessage(msg.id)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  title="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {emergencyMessages.length > 2 && !showAll && (
          <button
            onClick={() => setShowAll(true)}
            className="pointer-events-auto mx-auto block px-3 py-1 rounded-full bg-black/60 border border-white/10 text-[10px] font-bold text-slate-300 hover:text-white"
          >
            +{emergencyMessages.length - 2} MORE EMERGENCY MESSAGES
          </button>
        )}
      </div>
    </div>
  );
}
