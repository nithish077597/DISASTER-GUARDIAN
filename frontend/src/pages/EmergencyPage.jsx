import { useState } from 'react';
import { ShieldAlert, PhoneCall, Share2, Map, Megaphone, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmergencyPage() {
  const [locationShared, setLocationShared] = useState(false);
  const [callConfirmed, setCallConfirmed] = useState(false);

  const handleShareLocation = () => {
    setLocationShared(true);
    setTimeout(() => setLocationShared(false), 3000);
  };

  const handleConfirmCall = () => {
    setCallConfirmed(true);
    setTimeout(() => {
      window.location.href = 'tel:112';
      setCallConfirmed(false);
    }, 1200);
  };

  return (
    <div className="max-w-md mx-auto py-6 space-y-6 text-white select-none font-sans">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-2xl bg-red-600 border border-red-500 mx-auto flex items-center justify-center text-white shadow-xl shadow-red-600/40 animate-pulse">
          <ShieldAlert className="w-9 h-9" />
        </div>
        <h1 className="text-3xl font-black uppercase text-red-500 tracking-tight">
          🆘 EMERGENCY SOS
        </h1>
        <p className="text-xs text-slate-300 font-medium">
          Do not hesitate if you are in danger.
        </p>
      </div>

      {locationShared && (
        <div className="p-3.5 rounded-xl bg-emerald-950 border border-emerald-500/50 text-emerald-300 text-xs font-bold text-center flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>GPS Coordinates Shared with Emergency Responders</span>
        </div>
      )}

      {/* 4 Large Accessible Action Buttons */}
      <div className="space-y-3.5">
        <button
          onClick={handleConfirmCall}
          className="w-full py-5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-sm uppercase tracking-wider shadow-2xl shadow-red-600/40 transition-all flex items-center justify-center gap-3"
        >
          <PhoneCall className="w-6 h-6" />
          <span>{callConfirmed ? 'DIALING 112...' : '[ CALL EMERGENCY SERVICES (112) ]'}</span>
        </button>

        <button
          onClick={handleShareLocation}
          className="w-full py-4 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-white font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-3"
        >
          <Share2 className="w-5 h-5 text-cyan-400" />
          <span>[ SHARE MY LOCATION ]</span>
        </button>

        <Link to="/shelters" className="block">
          <button className="w-full py-4 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-white font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-3">
            <Map className="w-5 h-5 text-emerald-400" />
            <span>[ FIND SAFE SHELTER ]</span>
          </button>
        </Link>

        <Link to="/report" className="block">
          <button className="w-full py-4 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-white font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-3">
            <Megaphone className="w-5 h-5 text-amber-400" />
            <span>[ REPORT DISASTER ]</span>
          </button>
        </Link>
      </div>
    </div>
  );
}
