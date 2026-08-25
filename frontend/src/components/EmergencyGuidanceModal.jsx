import { useState } from 'react';
import { HelpCircle, Volume2, VolumeX, CheckCircle2, ShieldAlert } from 'lucide-react';
import { voiceAssistantService } from '../services/voiceAssistantService';

const EMERGENCY_GUIDELINES = {
  FLOOD: [
    'Move to higher ground immediately.',
    'Avoid walking or driving through moving floodwater.',
    'Do not touch electrical equipment in flooded areas.',
    'Follow official evacuation instructions.',
    'Take your emergency essentials pouch if evacuating.',
  ],
  LANDSLIDE: [
    'Move away from steep slopes immediately.',
    'Watch for unusual sounds like trees cracking or falling rocks.',
    'Go to designated emergency shelters on flat terrain.',
    'Do not attempt to cross landslide-blocked roads.',
  ],
  EARTHQUAKE: [
    'Drop, Cover, and Hold On under heavy furniture.',
    'Stay away from glass windows and exterior walls.',
    'Move to open ground if outdoors.',
  ],
};

export default function EmergencyGuidanceModal({ isOpen, onClose, disasterType = 'FLOOD', lang = 'en' }) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  if (!isOpen) return null;

  const rules = EMERGENCY_GUIDELINES[disasterType] || EMERGENCY_GUIDELINES.FLOOD;

  const handleSpeak = () => {
    setIsSpeaking(true);
    const textToRead = `Emergency instructions for ${disasterType}: ` + rules.join('. ');
    voiceAssistantService.speak(textToRead, lang);
    setTimeout(() => setIsSpeaking(false), 8000);
  };

  const handleStop = () => {
    voiceAssistantService.stop();
    setIsSpeaking(false);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border-2 border-red-600 rounded-3xl p-6 space-y-4 shadow-2xl text-white select-none">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-red-500">
            <HelpCircle className="w-6 h-6 animate-pulse" />
            <h2 className="font-black text-lg uppercase tracking-tight">WHAT SHOULD I DO NOW?</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white font-bold text-sm">???</button>
        </div>

        <div className="p-3 rounded-2xl bg-red-950/40 border border-red-600/50 flex items-center justify-between text-xs text-red-300 font-mono">
          <span>EMERGENCY PROTOCOL: <strong className="text-white uppercase">{disasterType}</strong></span>
          <span className="font-bold">IMMEDIATE ACTION</span>
        </div>

        {/* 5 Survival Rules */}
        <div className="space-y-2 text-xs md:text-sm text-slate-200">
          {rules.map((rule, idx) => (
            <div key={idx} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-red-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                {idx + 1}
              </span>
              <p className="font-medium text-white">{rule}</p>
            </div>
          ))}
        </div>

        {/* Audio Controls */}
        <div className="flex items-center gap-2 pt-2">
          {!isSpeaking ? (
            <button
              onClick={handleSpeak}
              className="flex-1 py-3.5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs uppercase flex items-center justify-center gap-2 shadow-lg"
            >
              <Volume2 className="w-4 h-4" />
              <span>???? READ ALOUD (GUARDIAN VOICE)</span>
            </button>
          ) : (
            <button
              onClick={handleStop}
              className="flex-1 py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs uppercase flex items-center justify-center gap-2 shadow-lg"
            >
              <VolumeX className="w-4 h-4" />
              <span>???? MUTE AUDIO</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="py-3.5 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
