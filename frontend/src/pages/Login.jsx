import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldAlert, User, ShieldCheck, Phone, MapPin, ArrowRight,
  Loader2, Navigation, Radio, Waves, Siren
} from 'lucide-react';
import { authService } from '../services/authService';
import { geoService } from '../services/geoService';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const isAdminRoute = location.pathname.includes('/admin');
  const [activeTab, setActiveTab] = useState(isAdminRoute ? 'ADMIN' : 'CITIZEN');

  // Citizen register/login fields (Name + Mobile + Location only)
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [locationText, setLocationText] = useState('');
  const [coords, setCoords] = useState(null);
  const [locLoading, setLocLoading] = useState(false);

  // Admin login state
  const [adminUser, setAdminUser] = useState('ndrf_command');
  const [adminPass, setAdminPass] = useState('');
  const [adminSecretKey, setAdminSecretKey] = useState('DG-ADMIN-9942');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleDetectLocation = async () => {
    setLocLoading(true);
    setErrorMsg('');
    try {
      const pos = await geoService.requestPosition();
      setCoords({ lat: pos.lat, lng: pos.lng });
      const address = await geoService.reverseGeocode(pos.lat, pos.lng);
      setLocationText(address || `${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)}`);
    } catch {
      setErrorMsg('Unable to detect GPS. Please type your location manually.');
    } finally {
      setLocLoading(false);
    }
  };

  const handleCitizenLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      await authService.registerOrLogin({
        name,
        mobile: mobileNumber,
        location: locationText,
        lat: coords?.lat ?? null,
        lng: coords?.lng ?? null,
      });
      setLoading(false);
      navigate('/citizen');
    } catch (err) {
      setLoading(false);
      setErrorMsg(err.message || 'Login failed. Please try again.');
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      await authService.loginAdminWithSecretKey(adminUser, adminPass, adminSecretKey);
      setLoading(false);
      navigate('/admin');
    } catch (err) {
      setLoading(false);
      setErrorMsg(err.message || 'Invalid Admin Secret Key.');
    }
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-[#04121f] via-[#062a33] to-[#032118] flex items-center justify-center p-4 selection:bg-cyan-500/30 selection:text-cyan-100 select-none relative overflow-hidden">
      {/* Ambient glow orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-24 w-[28rem] h-[28rem] rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full bg-teal-400/5 blur-2xl pointer-events-none" />

      {/* Live status strip */}
      <div className="fixed top-0 inset-x-0 z-20 px-4 py-1.5 bg-black/30 backdrop-blur-sm border-b border-cyan-500/20 flex items-center justify-center gap-2 text-[10px] font-mono text-cyan-300 tracking-widest uppercase">
        <Radio className="w-3 h-3 animate-pulse text-emerald-400" />
        <span>Emergency Network Online</span>
        <span className="text-slate-600">|</span>
        <Waves className="w-3 h-3 text-cyan-400" />
        <span>Monitoring Live</span>
      </div>

      {/* Brand side */}
      <div className="hidden lg:flex flex-col justify-between max-w-md w-full mr-14 py-8 relative z-10">
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-black text-white tracking-tight uppercase">
              Disaster<br />Management
            </h1>
          </div>
          <p className="text-sm text-teal-100/70 leading-relaxed max-w-xs">
            Know the danger. Find safety. Get help.
          </p>
          <div className="space-y-3 pt-6">
            {[
              { icon: Siren, title: 'Real-Time Alerts', desc: 'Category-based emergency escalation' },
              { icon: Waves, title: 'Live Location News', desc: 'Incidents reported near you instantly' },
              { icon: Navigation, title: 'Safe Route Guidance', desc: 'Evacuate through verified safe paths' },
            ].map((f) => (
              <div key={f.title} className="flex items-start gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-sm">
                <f.icon className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-extrabold text-white uppercase tracking-wide">{f.title}</p>
                  <p className="text-[11px] text-slate-400">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Citizen Safety Platform · 2026</p>
      </div>

      {/* Auth Card */}
      <div className="max-w-md w-full relative z-10">
        <div className="rounded-3xl p-[1px] bg-gradient-to-br from-cyan-500/50 via-emerald-500/20 to-transparent shadow-2xl shadow-black/50">
          <div className="bg-[#071823]/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 space-y-6">
            {/* Mobile brand header */}
            <div className="lg:hidden text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-600 mx-auto flex items-center justify-center text-white shadow-lg shadow-cyan-500/30">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <h1 className="text-lg font-black text-white tracking-tight uppercase">Disaster Management</h1>
              <p className="text-[11px] text-teal-100/60">Know the danger. Find safety. Get help.</p>
            </div>

            {/* Role tabs */}
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-black/40 border border-white/10 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('CITIZEN');
                  setErrorMsg('');
                  navigate('/login');
                }}
                className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'CITIZEN'
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-600 text-white shadow-md shadow-cyan-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>CITIZEN LOGIN</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('ADMIN');
                  setErrorMsg('');
                  navigate('/admin/login');
                }}
                className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'ADMIN'
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-600 text-white shadow-md shadow-cyan-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>ADMIN LOGIN</span>
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-300 text-xs font-bold">
                {errorMsg}
              </div>
            )}

            {/* CITIZEN LOGIN: NAME + MOBILE + LOCATION ONLY */}
            {activeTab === 'CITIZEN' && (
              <form onSubmit={handleCitizenLogin} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-bold uppercase mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Arjun Kumar"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/40 transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold uppercase mb-1.5">Mobile Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="9876543210"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/40 transition-all font-medium tracking-wider"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-slate-400 font-bold uppercase">Location</label>
                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      disabled={locLoading}
                      className="flex items-center gap-1 text-[10px] text-cyan-300 font-mono font-bold hover:text-cyan-200 disabled:opacity-50"
                    >
                      {locLoading ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Navigation className="w-3 h-3" />
                      )}
                      USE GPS
                    </button>
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={locationText}
                      onChange={(e) => setLocationText(e.target.value)}
                      placeholder="e.g. Sulur, Coimbatore"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 transition-all font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-cyan-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                  <span>{loading ? 'Signing you in...' : 'Enter Safety Portal'}</span>
                </button>

                <p className="text-center text-[10px] text-slate-500 leading-relaxed">
                  Your details are stored in the citizen safety dataset so responders can reach you during emergencies.
                </p>
              </form>
            )}

            {/* ADMIN LOGIN */}
            {activeTab === 'ADMIN' && (
              <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-bold uppercase mb-1.5">Official Admin Username</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={adminUser}
                      onChange={(e) => setAdminUser(e.target.value)}
                      placeholder="ndrf_command"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold uppercase mb-1.5">Security Password</label>
                  <div className="relative">
                    <ShieldAlert className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      required
                      value={adminPass}
                      onChange={(e) => setAdminPass(e.target.value)}
                      placeholder="Enter password"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-cyan-400 font-extrabold uppercase">Official Secret Key</label>
                    <span className="text-[10px] text-slate-500 font-mono">Default: DG-ADMIN-9942</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={adminSecretKey}
                    onChange={(e) => setAdminSecretKey(e.target.value)}
                    placeholder="DG-ADMIN-9942"
                    className="w-full px-3 py-2.5 rounded-xl bg-black/40 border-2 border-cyan-500/50 text-cyan-200 font-mono font-bold focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-cyan-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{loading ? 'Verifying...' : 'Access Control Center'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
