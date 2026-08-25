import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, User, ShieldCheck, MapPin, CloudRain, Shield, AlertTriangle, Send, UserCheck, ArrowRight } from 'lucide-react';
import { geoService } from '../services/geoService';
import { authService } from '../services/authService';

export default function LandingPage() {
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState('Sulur, Coimbatore');
  const [gpsActive, setGpsActive] = useState(true);
  const [locLoading, setLocLoading] = useState(false);

  const handleCheckMyArea = async () => {
    setLocLoading(true);
    try {
      const pos = await geoService.requestPosition();
      const name = await geoService.reverseGeocode(pos.lat, pos.lng);
      setUserLocation(name || 'Sulur, Coimbatore');
      setGpsActive(true);
    } catch {
      setUserLocation('Sulur, Coimbatore');
      setGpsActive(false);
    } finally {
      setLocLoading(false);
    }

    if (!authService.isAuthenticated()) {
      navigate('/login');
    } else {
      navigate('/citizen');
    }
  };

  return (
    <div className="min-h-screen w-screen bg-slate-950 text-slate-100 font-sans selection:bg-red-600/30 selection:text-red-200 select-none flex flex-col">
      {/* Top Header */}
      <header className="h-16 px-4 md:px-8 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center text-white font-black shadow-lg shadow-red-600/30">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <span className="font-black text-sm md:text-base text-white tracking-tight uppercase">
            AI DISASTER GUARDIAN
          </span>
        </div>

        {/* Dual Entry Buttons */}
        <div className="flex items-center gap-2">
          <Link to="/login">
            <button className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-md transition-all flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>CITIZEN LOGIN</span>
            </button>
          </Link>

          <Link to="/admin/login">
            <button className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-extrabold text-xs uppercase border border-slate-700 transition-all flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>ADMIN LOGIN</span>
            </button>
          </Link>
        </div>
      </header>

      {/* Main Hero Section */}
      <section className="py-12 md:py-20 px-4 md:px-8 max-w-5xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-950/60 border border-red-500/40 text-red-400 text-xs font-extrabold font-mono uppercase">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span>??? REAL-TIME DISASTER EARLY WARNING & EMERGENCY ASSISTANCE</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight max-w-3xl mx-auto leading-tight uppercase">
          AI DISASTER GUARDIAN
        </h1>

        <p className="text-sm md:text-base text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed">
          One unified system connecting citizens with emergency operations authorities during flood and landslide emergencies.
        </p>

        {/* TWO PRIMARY PORTAL CHOICE CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto pt-4">
          {/* Citizen Portal Card */}
          <div className="p-6 rounded-3xl bg-slate-900 border-2 border-red-600/70 hover:border-red-500 text-left space-y-4 shadow-2xl transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center text-white">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white group-hover:text-red-400 uppercase">???? CITIZEN PORTAL</h2>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Simple safety status, 30s disaster reporting, evacuation guidance, and emergency SOS assistance.
              </p>
            </div>
            <Link to="/login" className="block pt-2">
              <button className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2">
                <span>ENTER CITIZEN PORTAL</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>

          {/* Admin Control Center Card */}
          <div className="p-6 rounded-3xl bg-slate-900 border-2 border-cyan-500/70 hover:border-cyan-400 text-left space-y-4 shadow-2xl transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white group-hover:text-cyan-400 uppercase">??????? ADMIN CONTROL CENTER</h2>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Operations center for emergency authorities: photo report verification, AI risk engine, targeted SMS alerts, and road/shelter control.
              </p>
            </div>
            <Link to="/admin/login" className="block pt-2">
              <button className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2">
                <span>ENTER ADMIN CENTER</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-4 md:px-8 border-t border-slate-800 bg-slate-950 text-center text-xs text-slate-500 mt-auto">
        <p className="font-mono">AI DISASTER GUARDIAN ??? Real-Time Disaster Risk & Emergency Response System</p>
      </footer>
    </div>
  );
}
