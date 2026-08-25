import { useState } from 'react';
import { ShieldAlert, MapPin, PhoneCall, CheckCircle2, AlertTriangle, Building2, HeartPulse, Shield, Loader2, Radio, MessageSquare, Users } from 'lucide-react';
import { sosApi } from '../api';

const EMERGENCY_SITUATIONS = [
  { id: 'TRAPPED', label: 'I AM TRAPPED', icon: '🆘' },
  { id: 'MEDICAL', label: 'I NEED MEDICAL HELP', icon: '🚑' },
  { id: 'FLOOD_WATER', label: 'FLOOD WATER ENTERING HOME', icon: '🌊' },
  { id: 'EVACUATION', label: 'I NEED EVACUATION', icon: '🏃' },
  { id: 'FIRE', label: 'FIRE EMERGENCY', icon: '🔥' },
  { id: 'INJURY', label: 'SEVERE INJURY', icon: '🩸' },
  { id: 'MISSING', label: 'MISSING PERSON', icon: '📍' },
];

export default function SosConfirmModal({ isOpen, onClose, userLocation, lat = 28.618, lng = 77.208, userName = '', userPhone = '', onSosTriggered }) {
  const [selectedSituation, setSelectedSituation] = useState('TRAPPED');
  const [phase, setPhase] = useState('form'); // form | loading | result
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const reset = () => {
    setPhase('form');
    setResult(null);
    setError(null);
    setSelectedSituation('TRAPPED');
    onClose();
  };

  const handleConfirmSos = async () => {
    setPhase('loading');
    setError(null);
    try {
      const payload = {
        lat: Number(lat),
        lng: Number(lng),
        disasterType: 'CITIZEN SOS',
        severity: 'CRITICAL',
        locationName: userLocation || 'Unknown',
        message: `CITIZEN SOS — Situation: ${selectedSituation}. ${userName ? 'Citizen: ' + userName : ''} ${userPhone ? '(' + userPhone + ')' : ''}`,
        source: 'CITIZEN',
        triggeredBy: userName || 'citizen',
      };
      const res = await sosApi.trigger(payload);
      setResult(res);
      setPhase('result');
      if (res && res.triggered && typeof onSosTriggered === 'function') {
        onSosTriggered(res);
      }
    } catch (err) {
      setError(err.message || 'Failed to transmit SOS signal.');
      setPhase('result');
    }
  };

  const affectedUsers = result?.affectedUsers || [];
  const channelSummary = result?.dispatch || {};

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border-2 border-red-600 rounded-3xl p-6 space-y-4 shadow-2xl text-white select-none max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-red-500">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
            <h2 className="font-black text-lg uppercase tracking-tight">🆘 EMERGENCY SOS ACTIVATION</h2>
          </div>
          <button onClick={reset} className="text-slate-400 hover:text-white font-bold text-sm">✕</button>
        </div>

        {phase === 'loading' && (
          <div className="py-10 text-center space-y-3">
            <Loader2 className="w-10 h-10 text-red-500 animate-spin mx-auto" />
            <p className="text-sm text-slate-300">Transmitting SOS to NDRF Command Center & identifying citizens in danger zone…</p>
          </div>
        )}

        {phase === 'form' && (
          <>
            <p className="text-xs text-slate-300">
              Select your exact emergency situation. Your live GPS coordinates will be transmitted and the
              emergency alert/call workflow will be triggered for everyone inside the danger zone.
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
                onClick={reset}
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
          </>
        )}

        {phase === 'result' && (
          <div className="space-y-4 text-center py-2">
            <div className="w-16 h-16 rounded-full bg-emerald-950 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto text-2xl animate-bounce">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>

            {error ? (
              <div className="p-3 rounded-2xl bg-red-950 border border-red-600 text-red-300 text-xs">
                {error}
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-emerald-400 uppercase">HELP REQUEST TRANSMITTED</h3>
                  <p className="text-xs text-slate-300">Emergency alert/call workflow has been dispatched to the danger zone.</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-left">
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                    <p className="text-[11px] uppercase text-slate-400 flex items-center gap-1"><Users className="w-3.5 h-3.5 text-amber-400" /> Citizens in Danger Zone</p>
                    <p className="text-2xl font-black text-amber-400">{result?.affectedCount ?? 0}</p>
                    <p className="text-[10px] text-slate-500">within {result?.radiusKm ?? '?'} km</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                    <p className="text-[11px] uppercase text-slate-400 flex items-center gap-1"><Radio className="w-3.5 h-3.5 text-red-400" /> Severity</p>
                    <p className="text-2xl font-black text-red-400">{result?.severity ?? 'CRITICAL'}</p>
                    <p className="text-[10px] text-slate-500">Emergency call workflow</p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-1.5">
                  <p className="text-[11px] uppercase text-cyan-400 font-bold flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> Channels Dispatched</p>
                  {(result?.channels || []).map((ch) => {
                    const status =
                      ch === 'CALL' ? channelSummary?.call?.status
                      : ch === 'SMS' ? channelSummary?.sms?.status
                      : ch === 'VOICEMAIL' ? channelSummary?.voicemail?.status
                      : ch === 'APP' ? channelSummary?.app?.status
                      : ch === 'GATEWAY' ? channelSummary?.gateway?.status
                      : channelSummary?.[ch.toLowerCase()]?.status;
                    return (
                      <p key={ch} className="text-[11px] font-mono text-slate-300 flex items-center justify-between">
                        <span>{ch}</span>
                        <span className="text-emerald-400">{status || 'sent'}</span>
                      </p>
                    );
                  })}
                </div>

                {affectedUsers.length > 0 && (
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-1 max-h-40 overflow-y-auto">
                    <p className="text-[11px] uppercase text-slate-400 font-bold">Affected Citizens Notified</p>
                    {affectedUsers.map((u) => (
                      <p key={u.id || u.phone} className="text-[11px] font-mono text-slate-300 flex items-center justify-between">
                        <span>{u.name} · {u.phone}</span>
                        <span className="text-amber-400">{u.distanceKm} km</span>
                      </p>
                    ))}
                  </div>
                )}
              </>
            )}

            <a
              href="tel:112"
              className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg block"
            >
              <PhoneCall className="w-4 h-4" />
              <span>CALL EMERGENCY HELPLINE (112)</span>
            </a>

            <button
              onClick={reset}
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
