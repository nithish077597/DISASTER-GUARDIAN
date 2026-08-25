import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Route, Navigation, Send, X, Radio, CheckCircle, PhoneCall, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRealtime } from '../context/RealtimeContext';
import { Button } from './ui';

export default function CriticalEmergencyAlertModal() {
  const navigate = useNavigate();
  const {
    criticalModalOpen,
    dismissCriticalAlert,
    issueEmergencyAlert,
    riskEngine,
    populationAtRisk,
    roadStatuses,
    alertDelivery,
    emergencyMessages,
  } = useRealtime();

  if (!criticalModalOpen) return null;

  const latestCritical = [...emergencyMessages]
    .reverse()
    .find((m) => String(m.category).toUpperCase() === 'CRITICAL');
  const alertTitle = latestCritical?.title || 'CRITICAL EMERGENCY ALERT';
  const alertLocation = latestCritical?.locationName || 'Your Area';

  const blockedRoadsCount = roadStatuses.filter((r) => r.status === 'BLOCKED').length;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl selection:bg-red-500/30 selection:text-red-200">
        {/* Pulsing hazard border around backdrop */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative max-w-2xl w-full glass-card bg-gradient-to-b from-slate-900 via-slate-900 to-red-950/40 border-2 border-red-500/60 rounded-3xl p-6 md:p-8 shadow-[0_0_60px_rgba(239,68,68,0.4)] overflow-hidden"
        >
          {/* Animated Hazard Pulse Stripe Top Bar */}
          <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-red-600 via-amber-500 to-red-600 animate-pulse" />

          {/* Close / Dismiss top right button */}
          <button
            onClick={dismissCriticalAlert}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all"
            title="Dismiss Alert Overlay"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header Badge */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 animate-bounce">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span className="text-xs font-bold text-red-400 uppercase tracking-widest">
                  CRITICAL EMERGENCY SYSTEM OVERRIDE
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2 mt-0.5">
                {alertTitle}
              </h2>
            </div>
          </div>

          <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-6">
            Emergency conditions near <strong className="text-red-400 font-bold">{alertLocation}</strong> have reached the
            CRITICAL stage. The software siren is active and all channels (notification, SMS, voice mail and call) are
            being dispatched. Follow evacuation guidance immediately.
          </p>

          {/* Incident Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30">
              <p className="text-[11px] font-semibold uppercase text-red-300 tracking-wider">Location</p>
              <p className="text-sm font-bold text-white mt-1 truncate">{alertLocation}</p>
              <p className="text-[10px] text-slate-400">Citizen Live Location</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30">
              <p className="text-[11px] font-semibold uppercase text-red-300 tracking-wider">Risk Score</p>
              <p className="text-xl font-black text-red-400 mt-0.5">{riskEngine.score}%</p>
              <p className="text-[10px] text-red-300 font-medium">CRITICAL DANGER</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-white/10">
              <p className="text-[11px] font-semibold uppercase text-amber-400 tracking-wider">People at Risk</p>
              <p className="text-xl font-bold text-white mt-0.5">{populationAtRisk.count}</p>
              <p className="text-[10px] text-amber-300">+{populationAtRisk.deltaTenMin} in 10m</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-white/10">
              <p className="text-[11px] font-semibold uppercase text-slate-300 tracking-wider">Roads Blocked</p>
              <p className="text-xl font-bold text-rose-400 mt-0.5">{blockedRoadsCount}</p>
              <p className="text-[10px] text-slate-400">Village Road B</p>
            </div>
          </div>

          {/* Action Callout */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/60 via-slate-900 to-red-950/60 border border-red-500/40 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400">
                <Navigation className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <p className="text-xs text-red-300 uppercase tracking-wider font-semibold">Recommended Evacuation Action</p>
                <p className="text-base font-extrabold text-white">EVACUATE IMMEDIATELY TO HIGHLAND RELIEF CAMP ALPHA</p>
              </div>
            </div>
          </div>

          {/* Live Delivery Status if Alert Dispatched */}
          {alertDelivery.active && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/40 mb-6 space-y-3"
            >
              <div className="flex items-center justify-between text-xs font-bold text-cyan-400 uppercase tracking-wider">
                <span className="flex items-center gap-2">
                  <Radio className="w-4 h-4 animate-spin text-cyan-400" />
                  Live Broadcast Delivery Stream
                </span>
                <span>Issued at {alertDelivery.issuedAt}</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-slate-400 flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5 text-cyan-400" /> SMS Broadcast</p>
                  <p className="text-sm font-bold text-emerald-400 mt-1">{alertDelivery.sms.delivered} Delivered</p>
                  <p className="text-[10px] text-slate-500">{alertDelivery.sms.sending} sending, {alertDelivery.sms.failed} failed</p>
                </div>

                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-slate-400 flex items-center gap-1"><PhoneCall className="w-3.5 h-3.5 text-blue-400" /> Voice IVR Calls</p>
                  <p className="text-sm font-bold text-cyan-300 mt-1">{alertDelivery.voice.answered} Answered</p>
                  <p className="text-[10px] text-slate-500">{alertDelivery.voice.calling} calling, {alertDelivery.voice.failed} unreached</p>
                </div>

                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-slate-400 flex items-center gap-1"><Send className="w-3.5 h-3.5 text-purple-400" /> App Push</p>
                  <p className="text-sm font-bold text-purple-300 mt-1">{alertDelivery.app.delivered} Delivered</p>
                  <p className="text-[10px] text-emerald-400 font-semibold">100% Reach</p>
                </div>

                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-slate-400 flex items-center gap-1"><Radio className="w-3.5 h-3.5 text-red-400" /> Local Siren Gateway</p>
                  <p className="text-sm font-bold text-amber-400 mt-1">{alertDelivery.gateway.status}</p>
                  <p className="text-[10px] text-emerald-400 font-semibold">Siren Hardware ON</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Footer Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <Button
              variant="danger"
              size="lg"
              icon={Send}
              onClick={issueEmergencyAlert}
              className="flex-1 shadow-lg shadow-red-500/30 text-sm font-extrabold uppercase py-3.5"
            >
              {alertDelivery.active ? 'Re-issue Emergency Broadcast' : 'ISSUE EMERGENCY ALERT NOW'}
            </Button>

            <Button
              variant="primary"
              size="lg"
              icon={Route}
              onClick={() => {
                dismissCriticalAlert();
                navigate('/shelters');
              }}
              className="flex-1 shadow-lg shadow-cyan-500/20 text-sm font-bold py-3.5"
            >
              VIEW EVACUATION ROUTE
            </Button>

            <Button
              variant="ghost"
              size="lg"
              onClick={dismissCriticalAlert}
              className="text-slate-400 hover:text-white text-xs font-semibold px-4"
            >
              DISMISS / REVIEW
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
