import { useState } from 'react';
import { X, User, Phone, MapPin, Globe, Shield, Save, CheckCircle2 } from 'lucide-react';
import { useRealtime } from '../context/RealtimeContext';

export default function ProfileModal({ isOpen, onClose }) {
  const { voiceLanguage, setVoiceLanguage } = useRealtime();

  const [name, setName] = useState('Resident Citizen');
  const [mobile, setMobile] = useState('+91 98765 43210');
  const [location, setLocation] = useState('Coimbatore, Tamil Nadu');
  const [emergencyContact, setEmergencyContact] = useState('+91 91234 56789');
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none font-sans">
      <div className="max-w-md w-full bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 space-y-5 shadow-2xl text-white">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 font-bold text-sm uppercase">
            <User className="w-5 h-5 text-cyan-400" />
            <span>CITIZEN REGISTRATION PROFILE</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {saved && (
          <div className="p-3 rounded-xl bg-emerald-950 border border-emerald-500/50 text-emerald-300 text-xs font-bold text-center flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Profile Saved Successfully</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-400 font-bold uppercase mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-bold uppercase mb-1">Registered Mobile Number</label>
            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono font-medium focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-bold uppercase mb-1">Primary Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-bold uppercase mb-1">Preferred Language</label>
            <div className="flex gap-2">
              {['English', 'Tamil', 'Hindi'].map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setVoiceLanguage(lang)}
                  className={`flex-1 py-2 rounded-xl border text-xs font-bold ${
                    voiceLanguage === lang ? 'bg-cyan-600 border-cyan-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  {lang === 'Tamil' ? '???????????????' : lang}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-bold uppercase mb-1">Emergency Contact Number</label>
            <input
              type="tel"
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono font-medium focus:outline-none focus:border-cyan-400"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>[ SAVE PROFILE ]</span>
          </button>
        </form>
      </div>
    </div>
  );
}
