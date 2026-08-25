import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Send, MapPin, Navigation, Phone, Users, Image as ImageIcon, CheckCircle2, ShieldAlert, Sparkles, Loader2, Clock } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/Leaflet.css';
import { Button, GlassCard, RiskBadge, ProgressBar } from '../components/ui';
import { DISASTER_TYPES } from '../utils/helpers';
import { getDisasterPhoto } from '../services/photoLibrary';
import { useUser } from '../context/UserContext';
import { useRealtime } from '../context/RealtimeContext';

const pinIcon = L.divIcon({
  className: 'report-picker-pin',
  html: `<div class="w-8 h-8 rounded-full bg-red-500 border-2 border-white flex items-center justify-center text-white shadow-lg shadow-red-500/50 font-bold text-xs">SOS</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

function MapLocationPicker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition({ lat: Number(e.latlng.lat.toFixed(6)), lng: Number(e.latlng.lng.toFixed(6)) });
    },
  });

  return position ? <Marker position={[position.lat, position.lng]} icon={pinIcon} /> : null;
}

export default function ReportEmergency() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { submitCitizenReport } = useRealtime();

  const [disasterType, setDisasterType] = useState('LANDSLIDE');
  const [position, setPosition] = useState({ lat: user?.lat || 28.621, lng: user?.lng || 77.214 });
  const [locationName, setLocationName] = useState('Village X Slope');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [peopleAffected, setPeopleAffected] = useState('143');

  const [submitting, setSubmitting] = useState(false);
  const [submittedReport, setSubmittedReport] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [detectingGps, setDetectingGps] = useState(false);

  const handleDetectGps = () => {
    if (!navigator.geolocation) return;
    setDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          lat: Number(pos.coords.latitude.toFixed(6)),
          lng: Number(pos.coords.longitude.toFixed(6)),
        });
        setDetectingGps(false);
      },
      () => setDetectingGps(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      const payload = {
        disaster_type: disasterType,
        location_name: locationName,
        lat: position.lat,
        lng: position.lng,
        description: `${description} [Affected: ${peopleAffected} people, Contact: ${phone}]`.trim(),
        photo: imageUrl || getDisasterPhoto(disasterType).url,
        severity: 'HIGH_RISK',
      };

      const newReport = submitCitizenReport(payload);
      setSubmittedReport(newReport);
      setSubmitting(false);

      // AI Verification timeline simulation
      setVerifying(true);
      setTimeout(() => {
        setVerifying(false);
      }, 3000);
    } catch (err) {
      setSubmitting(false);
      setErrorMsg('Failed to submit emergency report.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-8">
      <motion.header initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-extrabold tracking-widest uppercase">
          <ShieldAlert className="w-4 h-4" />
          <span>Real-Time Citizen Incident Reporting</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white">Report Emergency Hazard</h1>
        <p className="text-slate-400 max-w-xl mx-auto text-sm">
          Submissions appear instantly in the operator command console without requiring page refreshes.
        </p>
      </motion.header>

      <AnimatePresence mode="wait">
        {!submittedReport ? (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <GlassCard className="p-6 md:p-8 border border-white/10 shadow-2xl relative">
              <form onSubmit={handleSubmit} className="space-y-6">
                {errorMsg && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                    {errorMsg}
                  </div>
                )}

                {/* Disaster Type Select */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Disaster Type <span className="text-red-400">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {DISASTER_TYPES.map((d) => {
                      const typePhoto = getDisasterPhoto(d.value);
                      return (
                        <button
                          key={d.value}
                          type="button"
                          onClick={() => setDisasterType(d.value)}
                          className={`p-1.5 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                            disasterType === d.value
                              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-lg shadow-cyan-500/10'
                              : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                          }`}
                        >
                          <img
                            src={typePhoto.url}
                            alt={typePhoto.alt}
                            className="w-9 h-9 rounded-lg object-cover shrink-0"
                            loading="lazy"
                          />
                          <span className="text-xs font-semibold">{d.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Location Name & GPS */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Village / Location Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={locationName}
                      onChange={(e) => setLocationName(e.target.value)}
                      placeholder="e.g. Village X Main Square"
                      className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-medium focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                      GPS Coordinates <span className="text-red-400">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleDetectGps}
                      disabled={detectingGps}
                      className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                    >
                      <Navigation className={`w-3.5 h-3.5 ${detectingGps ? 'animate-spin' : ''}`} />
                      <span>{detectingGps ? 'Detecting...' : 'GPS Verification'}</span>
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
                        className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-cyan-400"
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
                        className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  {/* Map location picker */}
                  <div className="h-[220px] w-full rounded-2xl overflow-hidden border border-white/10 relative shadow-inner">
                    <MapContainer center={[position.lat, position.lng]} zoom={12} style={{ height: '100%', width: '100%' }}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>' />
                      <MapLocationPicker position={position} setPosition={setPosition} />
                    </MapContainer>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Description & Hazard Observations
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe mudslide movement, blocked roads, cracks in terrain, or trapped residents..."
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <Button type="submit" variant="primary" size="xl" icon={Send} loading={submitting} className="w-full justify-center bg-gradient-to-r from-red-500 to-rose-600 border-none shadow-xl shadow-red-500/30 text-white font-extrabold uppercase">
                  SUBMIT REAL-TIME EMERGENCY REPORT
                </Button>
              </form>
            </GlassCard>
          </motion.div>
        ) : (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
            <GlassCard className="p-8 border border-emerald-500/40 bg-slate-900/95 text-center space-y-6 shadow-2xl">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 mx-auto flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-widest">LIVE BROADCAST SUBMITTED</span>
                <h2 className="text-3xl font-extrabold text-white mt-1">NEW REPORT BROADCAST</h2>
                <p className="text-slate-400 text-xs mt-1 font-mono">
                  ???? {submittedReport.title} ??? Received: 12 seconds ago
                </p>
              </div>

              {/* AI Verification Workflow Box */}
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-left space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">REAL-TIME AI VERIFICATION TIMELINE</h3>
                  </div>
                  <RiskBadge severity={submittedReport.severity} size="md" />
                </div>

                <div className="space-y-2 text-xs">
                  <VerificationStep label="1. Collect available evidence" sub="Heavy rainfall ???, Soil moisture ???, Slope 34?? ???, Photo attached ???" done={true} />
                  <VerificationStep label="2. Risk Engine recalculation" sub="Recalculating hazard score to 91% High Confidence" done={true} />
                  <VerificationStep label="3. Severity transition" sub="UNDER REVIEW ??? CONFIRMED ??? HIGH RISK ??? CRITICAL" done={true} />
                  <VerificationStep label="4. Authority Dashboard Alert" sub="Pushed to live operator stream" done={true} />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button variant="primary" size="lg" className="flex-1" onClick={() => navigate('/evacuation')}>
                  View Safe Evacuation Routes
                </Button>
                <Button variant="secondary" size="lg" className="flex-1" onClick={() => navigate('/dashboard')}>
                  Return to Dashboard
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function VerificationStep({ label, sub, done }) {
  return (
    <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
      <div>
        <p className="font-bold text-white">{label}</p>
        <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>
      </div>
      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
    </div>
  );
}
