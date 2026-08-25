import { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, X, Radio } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { criticalAnnouncer } from '../services/criticalAnnouncer';
import { newsApi } from '../api';

// Voice command → action mapping (hands-free site navigation)
const COMMANDS = [
  { keywords: ['open map', 'show map', 'live map', 'map'], action: 'NAVIGATE', target: '/map', reply: 'Opening the live disaster map.' },
  { keywords: ['report emergency', 'report a disaster', 'new report', 'report'], action: 'NAVIGATE', target: '/report', reply: 'Opening the emergency report form.' },
  { keywords: ['alerts', 'alert', 'warning', 'warnings'], action: 'NAVIGATE', target: '/alerts', reply: 'Showing current alerts.' },
  { keywords: ['shelter', 'shelters', 'evacuate', 'evacuation route', 'safe route'], action: 'NAVIGATE', target: '/shelters', reply: 'Finding safe shelters and evacuation routes.' },
  { keywords: ['weather', 'weather report', 'rain'], action: 'NAVIGATE', target: '/weather', reply: 'Opening weather intelligence.' },
  { keywords: ['nearby help', 'help nearby', 'find help', 'help me'], action: 'NAVIGATE', target: '/nearby-help', reply: 'Locating emergency help near you.' },
  { keywords: ['safety guide', 'guide', 'what should i do'], action: 'NAVIGATE', target: '/safety-guides', reply: 'Opening safety guides.' },
  { keywords: ['sos', 'save me', 'rescue'], action: 'SOS', reply: 'Activating Emergency SOS.' },
  { keywords: ['stop', 'quiet', 'silence', 'cancel speech'], action: 'STOP', reply: null },
  { keywords: ['read news', 'news update', "what's the news", 'latest news', 'news'], action: 'READ_NEWS', reply: 'Reading the latest verified news.' },
];

const SpeechRecognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);

export default function VoiceCommandBar({ onSos }) {
  const navigate = useNavigate();
  const [supported] = useState(!!SpeechRecognition);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState('');
  const recognitionRef = useRef(null);
  const listeningRef = useRef(false);

  useEffect(() => () => {
    recognitionRef.current?.abort?.();
    criticalAnnouncer.stop();
  }, []);

  const executeCommand = useCallback(async (text) => {
    const lower = text.toLowerCase().trim();

    for (const cmd of COMMANDS) {
      if (cmd.keywords.some((k) => lower.includes(k))) {
        if (cmd.reply) {
          setFeedback(cmd.reply);
          criticalAnnouncer.speak(cmd.reply);
        }
        switch (cmd.action) {
          case 'NAVIGATE':
            setTimeout(() => navigate(cmd.target), 600);
            break;
          case 'SOS':
            setTimeout(() => (onSos ? onSos() : navigate('/emergency')), 400);
            break;
          case 'STOP':
            criticalAnnouncer.stop();
            break;
          case 'READ_NEWS': {
            try {
              const items = await newsApi.live(null, null, 5);
              const latest = Array.isArray(items) ? items.slice(0, 3) : [];
              if (latest.length === 0) {
                setFeedback('No verified emergency news in your area right now.');
                criticalAnnouncer.speak('There is no verified emergency news in your area right now.');
              } else {
                const summary = latest
                  .map((n) => `${(n.disaster_type || 'event').replace(/_/g, ' ')} — ${n.category || 'NORMAL'}${n.location_name ? ` near ${n.location_name}` : ''}`)
                  .join('. ');
                setFeedback(summary);
                criticalAnnouncer.speak(`Latest verified reports: ${summary}.`);
              }
            } catch {
              setFeedback('Sorry, I could not fetch the news right now.');
              criticalAnnouncer.speak('Sorry, I could not fetch the news right now.');
            }
            break;
          }
          default:
            break;
        }
        return true;
      }
    }

    setFeedback(`Command not recognized: "${text}"`);
    criticalAnnouncer.speak('Sorry, I did not recognize that command.');
    return false;
  }, [navigate, onSos]);

  const stopListening = useCallback(() => {
    listeningRef.current = false;
    setListening(false);
    try { recognitionRef.current?.stop(); } catch {}
  }, []);

  const startListening = useCallback(() => {
    if (!supported || listeningRef.current) return;
    criticalAnnouncer.stop();

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = async (event) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      await executeCommand(text);
      // Keep listening briefly so users can chain commands, then auto-stop
      setTimeout(stopListening, 800);
    };
    recognition.onerror = () => {
      setFeedback('Mic error or permission denied.');
      stopListening();
    };
    recognition.onend = () => {
      listeningRef.current = false;
      setListening(false);
    };

    recognitionRef.current = recognition;
    listeningRef.current = true;
    setListening(true);
    setTranscript('');
    setFeedback('');
    recognition.start();
  }, [supported, executeCommand, stopListening]);

  if (!supported) return null;

  return (
    <div className="fixed bottom-20 left-4 md:bottom-6 md:left-6 z-[9990] flex flex-col items-start gap-2">
      {(listening || feedback) && (
        <div className="max-w-[280px] p-3 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-gold-500/40 shadow-xl space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-gold-400">
              <Radio className={`w-3 h-3 ${listening ? 'animate-pulse' : ''}`} />
              {listening ? 'Listening…' : 'Voice Command'}
            </span>
            {!listening && (
              <button onClick={() => setFeedback('')} className="p-0.5 rounded hover:bg-slate-800 text-slate-500" title="Dismiss">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {listening && (
            <p className="text-xs text-slate-300 font-medium">
              Say: <span className="text-gold-300">"open map"</span>, <span className="text-gold-300">"report emergency"</span>,{' '}
              <span className="text-gold-300">"read news"</span>, <span className="text-gold-300">"show alerts"</span>,{' '}
              <span className="text-gold-300">"SOS"</span>…
            </p>
          )}
          {transcript && <p className="text-xs text-white font-semibold italic">"{transcript}"</p>}
          {feedback && <p className="text-[11px] text-cyan-300 leading-snug">{feedback}</p>}
        </div>
      )}

      <button
        onClick={listening ? stopListening : startListening}
        className={`relative w-14 h-14 rounded-full flex items-center justify-center border-2 shadow-2xl transition-all transform active:scale-95 ${
          listening
            ? 'bg-gradient-to-br from-gold-500 to-gold-700 border-gold-300 voice-listening-ring scale-105'
            : 'bg-gradient-to-br from-slate-800 to-slate-950 border-gold-500/60 hover:border-gold-400 hover:scale-105'
        }`}
        title={listening ? 'Stop listening' : 'Voice commands — hands-free navigation'}
      >
        {listening ? (
          <Mic className="w-6 h-6 text-white" />
        ) : (
          <>
            <MicOff className="w-6 h-6 text-gold-400" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gold-500 border-2 border-slate-950" />
          </>
        )}
      </button>
    </div>
  );
}
