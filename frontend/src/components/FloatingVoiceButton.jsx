import { Bot } from 'lucide-react';

export default function FloatingVoiceButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-[9990] w-14 h-14 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white shadow-2xl flex items-center justify-center border-2 border-cyan-300 transition-all transform hover:scale-105 active:scale-95"
      title="Talk to Voice Assistant"
    >
      <Bot className="w-7 h-7 text-white" />
      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 border-2 border-slate-950 animate-ping" />
    </button>
  );
}
