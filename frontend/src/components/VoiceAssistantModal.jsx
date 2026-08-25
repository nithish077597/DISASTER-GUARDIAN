import { useState } from 'react';
import { X, Mic, Volume2, Sparkles, Send, Bot, CheckCircle2 } from 'lucide-react';
import { voiceAssistantService } from '../services/voiceAssistantService';
import { useRealtime } from '../context/RealtimeContext';

const PRESET_QUERIES = [
  "Is it safe here?",
  "There is flooding near me.",
  "I see a landslide.",
  "What should I do?",
];

export default function VoiceAssistantModal({ isOpen, onClose, locationName = 'Coimbatore, Tamil Nadu' }) {
  const { riskEngine, shelters, voiceLanguage } = useRealtime();
  const [userQuery, setUserQuery] = useState('');
  const [assistantReply, setAssistantReply] = useState('');
  const [isListening, setIsListening] = useState(false);

  if (!isOpen) return null;

  const safeShelter = shelters.find((s) => s.status === 'OPEN') || shelters[0];

  const handleQuery = (queryText) => {
    setUserQuery(queryText);
    setIsListening(true);

    const reply = voiceAssistantService.askAssistant(
      queryText,
      locationName,
      riskEngine.score,
      safeShelter.name,
      voiceLanguage
    );

    setAssistantReply(reply);
    setTimeout(() => setIsListening(false), 4000);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (userQuery.trim()) {
      handleQuery(userQuery);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none font-sans">
      <div className="max-w-md w-full bg-slate-900 border-2 border-cyan-500 rounded-3xl p-6 space-y-5 shadow-2xl text-white">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-cyan-400 font-extrabold text-sm uppercase">
            <Bot className="w-5 h-5" />
            <span>??????? TALK TO EMERGENCY ASSISTANT</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Assistant Response Visualizer Box */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              AI Voice Assistant ({voiceLanguage})
            </span>
            {isListening && (
              <span className="text-[10px] text-emerald-400 font-mono font-bold animate-pulse">
                ???? Speaking...
              </span>
            )}
          </div>

          <p className="text-xs text-white leading-relaxed font-medium">
            {assistantReply || "Hello! Tap a question below or type your emergency query. I will guide you with live voice instructions."}
          </p>
        </div>

        {/* Preset Emergency Question Chips */}
        <div>
          <label className="block text-slate-400 font-bold uppercase text-[11px] mb-2">QUICK EMERGENCY QUESTIONS</label>
          <div className="grid grid-cols-2 gap-2">
            {PRESET_QUERIES.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => handleQuery(q)}
                className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left text-xs font-semibold text-slate-200 hover:text-white transition-all flex items-center justify-between"
              >
                <span>{q}</span>
                <Volume2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Custom Query Form */}
        <form onSubmit={handleFormSubmit} className="flex gap-2">
          <input
            type="text"
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            placeholder="Type your question..."
            className="flex-1 px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400 font-medium"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            <Send className="w-4 h-4" />
            <span>ASK</span>
          </button>
        </form>
      </div>
    </div>
  );
}
