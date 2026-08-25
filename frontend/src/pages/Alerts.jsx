import { motion } from 'framer-motion';
import { Send, Radio, MessageSquare, PhoneCall, CheckCircle2, ShieldAlert, AlertTriangle } from 'lucide-react';
import { Button, GlassCard } from '../components/ui';
import { useRealtime } from '../context/RealtimeContext';

export default function Alerts() {
  const { alertDelivery, issueEmergencyAlert, riskEngine, populationAtRisk, gateways } = useRealtime();

  return (
    <div className="space-y-8 py-4">
      <motion.header initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Real-Time Alert Dispatch Console</h1>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/40 text-red-300 text-xs font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              ??? BROADCAST SYSTEM READY
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Multi-channel emergency broadcast dispatcher (SMS, Voice IVR, App Push, & Local Siren Gateways)
          </p>
        </div>

        <Button variant="danger" size="md" icon={Send} onClick={issueEmergencyAlert} className="shadow-lg shadow-red-500/30">
          ISSUE EMERGENCY BROADCAST NOW
        </Button>
      </motion.header>

      {/* Alert Delivery Live Status Card */}
      <GlassCard className="p-6 border-2 border-red-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-red-950/20 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-lg">EMERGENCY ALERT DELIVERY STATUS</h3>
              <p className="text-xs text-slate-400">Target Audience: {populationAtRisk.count} Registered Residents inside Danger Zone</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 font-mono">
            Status: {alertDelivery.active ? 'DISPATCH IN PROGRESS' : 'IDLE / READY'}
          </span>
        </div>

        {/* 4 Multi-Channel Progress Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* SMS */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-cyan-400">
              <span className="flex items-center gap-1.5"><MessageSquare className="w-4 h-4" /> SMS BROADCAST</span>
              <span className="text-emerald-400">96.5% Reach</span>
            </div>
            <p className="text-2xl font-black text-white">{alertDelivery.sms.delivered} <span className="text-xs font-normal text-slate-400">Delivered</span></p>
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>Sending: {alertDelivery.sms.sending}</span>
              <span>Failed: {alertDelivery.sms.failed}</span>
            </div>
          </div>

          {/* VOICE */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-blue-400">
              <span className="flex items-center gap-1.5"><PhoneCall className="w-4 h-4" /> VOICE IVR CALLS</span>
              <span className="text-cyan-300">84.6% Answered</span>
            </div>
            <p className="text-2xl font-black text-white">{alertDelivery.voice.answered} <span className="text-xs font-normal text-slate-400">Answered</span></p>
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>Calling: {alertDelivery.voice.calling}</span>
              <span>Unreached: {alertDelivery.voice.failed}</span>
            </div>
          </div>

          {/* APP PUSH */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-purple-400">
              <span className="flex items-center gap-1.5"><Send className="w-4 h-4" /> CITIZEN APP PUSH</span>
              <span className="text-emerald-400">100% Reach</span>
            </div>
            <p className="text-2xl font-black text-white">{alertDelivery.app.delivered} <span className="text-xs font-normal text-slate-400">Delivered</span></p>
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>Sent: {alertDelivery.app.sent}</span>
              <span className="text-emerald-400 font-bold">100% Instant</span>
            </div>
          </div>

          {/* HARDWARE GATEWAY */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-red-400">
              <span className="flex items-center gap-1.5"><Radio className="w-4 h-4" /> SIREN GATEWAY</span>
              <span className="text-emerald-400">Active</span>
            </div>
            <p className="text-2xl font-black text-amber-400">{alertDelivery.gateway.status}</p>
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>Gateways: {gateways.filter((g) => g.status === 'ONLINE').length}/{gateways.length} Online</span>
              <span className="text-emerald-400 font-bold">Siren ON</span>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
