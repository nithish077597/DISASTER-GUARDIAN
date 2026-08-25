import { useState } from 'react';
import { Send, Radio, MessageSquare, PhoneCall, CheckCircle2, Globe, ShieldAlert } from 'lucide-react';
import { useRealtime } from '../context/RealtimeContext';

const MESSAGES = {
  English: "Critical landslide risk detected. Move away from steep slopes. Follow the evacuation route.",
  Tamil: "????????????????????? ????????????????????? ?????????????????????????????? ?????????????????? ?????????????????????????????????????????????????????????. ????????????????????????????????? ???????????????????????????????????????????????? ??????????????? ???????????????????????????. ??????????????????????????? ????????????????????? ????????????????????????????????????.",
  Hindi: "??????????????? ????????????????????? ??????????????? ?????? ????????? ????????? ????????? ???????????? ???????????? ??????????????????????????? ?????? ????????? ??????????????? ?????????????????? ??????????????? ?????? ???????????? ???????????????",
};

export default function AlertPanel() {
  const { alertDelivery, issueEmergencyAlert, populationAtRisk } = useRealtime();

  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [channels, setChannels] = useState({
    app: true,
    sms: true,
    voice: true,
    gateway: true,
  });

  return (
    <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6 text-white">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Send className="w-5 h-5 text-red-500" />
          <h3 className="font-extrabold text-lg uppercase tracking-tight">EMERGENCY ALERT DISPATCHER</h3>
        </div>
        <span className="text-xs text-slate-400 font-mono">Target: {populationAtRisk.count} Residents</span>
      </div>

      {/* Alert Channels Checkboxes */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">ALERT CHANNELS</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-medium">
          {Object.entries({
            app: 'App Notification',
            sms: 'SMS',
            voice: 'Voice Call',
            gateway: 'Local Emergency Gateway',
          }).map(([key, label]) => (
            <label
              key={key}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer select-none"
            >
              <input
                type="checkbox"
                checked={channels[key]}
                onChange={(e) => setChannels({ ...channels, [key]: e.target.checked })}
                className="w-4 h-4 rounded accent-red-600 cursor-pointer"
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Language Selector */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-cyan-400" /> Broadcast Language
          </p>
          <div className="flex gap-1.5">
            {['English', 'Tamil', 'Hindi'].map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setSelectedLanguage(lang)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedLanguage === lang
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {lang === 'Tamil' ? '???????????????' : lang}
              </button>
            ))}
          </div>
        </div>

        {/* Message Content Box */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <p className="text-[11px] text-slate-500 font-mono">MESSAGE PRESET ({selectedLanguage}):</p>
          <p className="text-xs text-white font-medium leading-relaxed font-sans">{MESSAGES[selectedLanguage]}</p>
        </div>
      </div>

      {/* Send Action Button */}
      <button
        onClick={issueEmergencyAlert}
        className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2"
      >
        <Send className="w-4 h-4" />
        <span>[ SEND EMERGENCY ALERT ]</span>
      </button>

      {/* Live Delivery Status Breakdown */}
      {alertDelivery.active && (
        <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
          <p className="text-xs font-extrabold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            Live Alert Delivery Progress
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block font-semibold">SMS</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">{alertDelivery.sms.delivered} / 143 delivered</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block font-semibold">VOICE</span>
              <span className="font-mono font-bold text-cyan-300 text-sm">{alertDelivery.voice.answered} / 143 answered</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block font-semibold">APP</span>
              <span className="font-mono font-bold text-purple-300 text-sm">{alertDelivery.app.delivered} / 143 delivered</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block font-semibold">GATEWAY</span>
              <span className="font-mono font-bold text-amber-400 text-sm">??? {alertDelivery.gateway.status}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
