import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { User, Phone, MapPin, Navigation, ShieldCheck, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/Leaflet.css';
import { useUser } from '../context/UserContext';
import { Button, GlassCard } from '../components/ui';

// Custom user pin icon
const userPinIcon = L.divIcon({
  className: 'custom-user-pin',
  html: `<div class="relative flex items-center justify-center">
    <span class="animate-ping absolute inline-flex h-10 w-10 rounded-full bg-cyan-400 opacity-75"></span>
    <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 border-2 border-white flex items-center justify-center shadow-lg shadow-cyan-500/50 text-white font-bold text-xs">
      📍
    </div>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const DEFAULT_COORDS = { lat: 28.6139, lng: 77.2090 }; // Default Delhi center

const PRESETS = [
  { name: 'Delhi NCR', lat: 28.6139, lng: 77.2090 },
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
  { name: 'Bengaluru', lat: 12.9716, lng: 77.5946 },
  { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
  { name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
];

function LocationPickerMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition({ lat: Number(e.latlng.lat.toFixed(6)), lng: Number(e.latlng.lng.toFixed(6)) });
    },
  });

  return position ? <Marker position={[position.lat, position.lng]} icon={userPinIcon} /> : null;
}

export default function Login() {
  const { user, loginUser, logoutUser } = useUser();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [position, setPosition] = useState({
    lat: user?.lat || DEFAULT_COORDS.lat,
    lng: user?.lng || DEFAULT_COORDS.lng,
  });

  const [detecting, setDetecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }
    setDetecting(true);
    setErrorMsg('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          lat: Number(pos.coords.latitude.toFixed(6)),
          lng: Number(pos.coords.longitude.toFixed(6)),
        });
        setDetecting(false);
        setSuccessMsg('GPS Location successfully detected!');
        setTimeout(() => setSuccessMsg(''), 3000);
      },
      (err) => {
        setDetecting(false);
        setErrorMsg('Unable to retrieve your location. Please select on the map or enter coordinates.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter your full name');
      return;
    }
    if (position.lat == null || position.lng == null) {
      setErrorMsg('Please select a valid location');
      return;
    }

    setErrorMsg('');
    setLoading(true);
    try {
      await loginUser({
        name: name.trim(),
        phone: phone.trim(),
        lat: position.lat,
        lng: position.lng,
      });
      setLoading(false);
      navigate('/map');
    } catch (err) {
      setLoading(false);
      setErrorMsg(err.message || 'Failed to complete login.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-3">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>Citizen Profile & Live Telemetry</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white">
          {user ? 'Update Profile & Location' : 'Citizen Registration / Login'}
        </h1>
        <p className="text-slate-400 mt-2 max-w-xl mx-auto text-sm md:text-base">
          Enter your details and live coordinates to receive real-time disaster alerts and ensure emergency responders know your safety status.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Container */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-6 space-y-6">
          <GlassCard className="p-6 md:p-8 border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -z-10" />

            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Full Name <span className="text-cyan-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Phone / Emergency Contact
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all text-sm"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Live Location Coordinates
                  </label>
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={detecting}
                    className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors disabled:opacity-50"
                  >
                    <Navigation className={`w-3.5 h-3.5 ${detecting ? 'animate-spin' : ''}`} />
                    <span>{detecting ? 'Detecting GPS...' : 'Auto-Detect GPS'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">Latitude</span>
                    <input
                      type="number"
                      step="any"
                      required
                      value={position.lat}
                      onChange={(e) => setPosition({ ...position, lat: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">Longitude</span>
                    <input
                      type="number"
                      step="any"
                      required
                      value={position.lng}
                      onChange={(e) => setPosition({ ...position, lng: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block mb-1.5">Quick Location Presets:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESETS.map((p) => (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => setPosition({ lat: p.lat, lng: p.lng })}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[11px] text-slate-300 font-medium transition-all"
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <Button type="submit" variant="primary" size="lg" className="flex-1 justify-center" icon={ArrowRight} loading={loading}>
                  {user ? 'Save Profile & Location' : 'Register & Enter App'}
                </Button>
                {user && (
                  <Button type="button" variant="secondary" size="lg" onClick={logoutUser}>
                    Logout
                  </Button>
                )}
              </div>
            </form>
          </GlassCard>
        </motion.div>

        {/* Map Preview Picker */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-6 space-y-4">
          <GlassCard className="p-4 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-white">Interactive Pin Drop</h3>
              </div>
              <span className="text-xs text-slate-400">Click anywhere on the map to place your pin</span>
            </div>

            <div className="h-[380px] w-full rounded-xl overflow-hidden border border-white/10 relative">
              <MapContainer
                center={[position.lat, position.lng]}
                zoom={12}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
                />
                <LocationPickerMarker position={position} setPosition={setPosition} />
              </MapContainer>
              <div className="absolute bottom-3 left-3 z-[1000] bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs text-slate-200 font-mono shadow-lg">
                Selected: {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
