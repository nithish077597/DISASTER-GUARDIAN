import { useState } from 'react';
import { ShieldAlert, MapPin, PhoneCall, CheckCircle2, AlertTriangle, Building2, HeartPulse, Shield } from 'lucide-react';

const EMERGENCY_SITUATIONS = [
  { id: 'TRAPPED', label: 'I AM TRAPPED', icon: '????' },
  { id: 'MEDICAL', label: 'I NEED MEDICAL HELP', icon: '????' },
  { id: 'FLOOD_WATER', label: 'FLOOD WATER ENTERING HOME', icon: '????' },
  { id: 'EVACUATION', label: 'I NEED EVACUATION', icon: '????' },
  { id: 'FIRE', label: 'FIRE EMERGENCY', icon: '????' },
  { id: 'INJURY', label: 'SEVERE INJURY', icon: '????' },
  { id: 'MISSING', label: 'MISSING PERSON', icon: '????' },
];

export default function SosConfirmModal({ isOpen, onClose, userLocation }) {
  const [selectedSituation, setSelectedSituation] = useState('TRAPPED');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleConfirmSos = () => {
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border-2 border-red-600 rounded-3xl p-6 space-y-4 shadow-2xl text-white select-none">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-red-500">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
            <h2 className="font-black text-lg uppercase tracking-tight">???? EMERGENCY SOS ACTIVATION</h2>
          </div>
          <button onClick={handleReset} className="text-slate-400 hover:text-white font-bold text-sm">???</button>
        </div>

        {!submitted ? (
          <div className="space-y-4">
            <p className="text-xs text-slate-300">
              Select your exact emergency situation. Your live GPS coordinates will be transmitted to NDRF Command Center.
            </p>

            <div className="grid grid-cols-1 gap-2">
              {EMERGENCY_SITUATIONS.map((sit) => (
                <button
                  key={sit.id}
                  onClick={() => setSelectedSituation(sit.id)}
                  className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                    selectedSituation === sit.id
                      ? 'bg-red-950 border-red-500 text-white font-extrabold shadow-lg'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="text-xl">{sit.icon}</span>
                  <span className="text-xs uppercase font-sans">{sit.label}</span>
                </button>
              ))}
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 text-xs font-mono text-slate-300">
              <p className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-red-400" />
                <span>Location: <strong className="text-white">{userLocation || 'Sulur, Coimbatore (28.618, 77.208)'}</strong></span>
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase"
              >
                CANCEL
              </button>
              <button
                onClick={handleConfirmSos}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider shadow-lg animate-pulse"
              >
                CONFIRM SOS SIGNAL
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-center py-2">
            <div className="w-16 h-16 rounded-full bg-emerald-950 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto text-2xl animate-bounce">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-emerald-400 uppercase">HELP REQUEST TRANSMITTED</h3>
              <p className="text-xs text-slate-300">Your emergency event has been logged in the NDRF Command Portal.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-1.5 text-left text-slate-300">
              <p>???? Location: <strong className="text-white">Sulur, Coimbatore</strong></p>
              <p>???? Situation: <strong className="text-red-400">{selectedSituation}</strong></p>
              <p>???? Nearest Police Station: <strong className="text-cyan-400">Sulur Police Station (1.4 km)</strong></p>
              <p>???? Nearest Hospital: <strong className="text-cyan-400">Coimbatore General (1.8 km)</strong></p>
              <p>???? Nearest Shelter: <strong className="text-emerald-400">Central Relief Camp (2.4 km)</strong></p>
            </div>

            <a
              href="tel:112"
              className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg block"
            >
              <PhoneCall className="w-4 h-4" />
              <span>CALL EMERGENCY HELPLINE (112)</span>
            </a>

            <button
              onClick={handleReset}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase"
            >
              CLOSE
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
