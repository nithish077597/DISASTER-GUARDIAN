import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle, Locate } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/Leaflet.css';
import { reportsApi, verificationApi } from '../api';
import { Button, GlassCard, Loader, RiskBadge, AlertBanner } from '../components/ui';
import { useGeolocation } from '../hooks';
import { DISASTER_TYPES, getSeverityInfo } from '../utils/helpers';
import { useNavigate } from 'react-router-dom';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const DEFAULT_POS = [28.6139, 77.209];

export default function ReportEmergency() {
  const navigate = useNavigate();
  const geo = useGeolocation();

  const [form, setForm] = useState({
    disaster_type: 'FLOOD',
    description: '',
    lat: 28.6139,
    lng: 77.2090,
  });
  const [stage, setStage] = useState('form'); // form | submitting | success | verifying
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const reporterIdRef = useRef('citizen_' + Math.floor(Math.random() * 9000 + 1000));

  useEffect(() => {
    if (geo.supported && !geo.position && !geo.loading && !geo.error) geo.request();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geo.supported, geo.position, geo.loading, geo.error]);

  useEffect(() => {
    if (geo.position) {
      setForm((f) => ({ ...f, lat: geo.position.lat, lng: geo.position.lng }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geo.position]);

  const updateCoords = (pos) => {
    setForm((f) => ({ ...f, lat: pos[0], lng: pos[1] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!form.description || !form.disaster_type || form.lat == null || form.lng == null) {
      setError('Please fill in all required fields and confirm the location.');
      return;
    }
    setStage('submitting');
    setError(null);
    try {
      const report = await reportsApi.create({
        disaster_type: form.disaster_type,
        lat: form.lat,
        lng: form.lng,
        description: form.description,
        reporter_id: reporterIdRef.current,
        photo_url: '',
      });
      setResult(report);
      setStage('verifying');
      const scored = await verificationApi.score(report.id);
      setResult({ ...report, scored });
      setStage('success');
    } catch (err) {
      setError(err.message);
      setStage('form');
    }
  };

  const reset = () => {
    setForm({ disaster_type: 'FLOOD', description: '', lat: 28.6139, lng: 77.209 });
    setStage('form');
    setResult(null);
    setError(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <motion.header initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white">Report an Emergency</h1>
        <p className="text-slate-400 mt-1">Submit a disaster report for AI verification. We locate you automatically.</p>
      </motion.header>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div key="error" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <AlertBanner type="critical" title="Could not submit report" message={error} onClose={() => setError(null)} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          {stage === 'form' && (
            <GlassCard className="p-6 border border-white/10">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="flex items-center gap-2 text-sm text-slate-300 mb-1.5">Disaster Type</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {DISASTER_TYPES.map((d) => (
                      <button
                        key={d.value}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, disaster_type: d.value }))}
                        className={`p-3 rounded-xl flex flex-col items-center gap-1.5 transition-all ${
                          form.disaster_type === d.value
                            ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/50 text-white'
                            : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        <span className="text-xl">{d.icon}</span>
                        <span className="text-xs font-medium">{d.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm text-slate-300 mb-1.5">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Describe what's happening…"
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-slate-100 placeholder-slate-500 resize-none focus:border-cyan-500/50 focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm text-slate-300 mb-1.5">Latitude</label>
                    <input
                      type="number"
                      step="6"
                      value={form.lat}
                      onChange={(e) => setForm((f) => ({ ...f, lat: parseFloat(e.target.value) }))}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/20 text-slate-100 focus:border-cyan-500/50 focus:outline-none"
                      readOnly={geo.position != null}
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm text-slate-300 mb-1.5">Longitude</label>
                    <input
                      type="number"
                      step="6"
                      value={form.lng}
                      onChange={(e) => setForm((f) => ({ ...f, lng: parseFloat(e.target.value) }))}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/20 text-slate-100 focus:border-cyan-500/50 focus:outline-none"
                      readOnly={geo.position != null}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <Locate className="w-4 h-4" />
                    <button type="button" onClick={geo.request} disabled={geo.loading} className="text-cyan-400 hover:text-cyan-300 disabled:opacity-50">
                      {geo.loading ? 'Detecting…' : 'Use My Location'}
                    </button>
                  </div>
                  <span>{geo.accuracy && `Accuracy: ±${Math.round(geo.accuracy)} m`}</span>
                </div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <button
                    type="submit"
                    disabled={stage === 'submitting' || stage === 'verifying'}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white font-bold text-lg shadow-lg shadow-red-500/30 hover:shadow-red-500/40 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 focus:ring-red-400 disabled:opacity-60"
                  >
                    {stage === 'submitting' ? 'Submitting report…' : '🚨 SUBMIT EMERGENCY REPORT'}
                  </button>
                </motion.div>
              </form>
            </GlassCard>
          )}

          {stage === 'submitting' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
              <Loader text="Submitting your emergency report to the Guardian network…" />
            </motion.div>
          )}

          {stage === 'verifying' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 space-y-4">
              <Loader text="AI verification engine analyzing your report…" />
              <p className="text-slate-400 text-sm">Checking weather, nearby reports, and reporter reliability.</p>
            </motion.div>
          )}

          {stage === 'success' && result && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-emerald-300">Report submitted successfully</p>
                  <p className="text-sm text-slate-300">Your report is now being verified by the AI engine.</p>
                </div>
              </div>
              <GlassCard className="p-6 border border-white/10">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-slate-200">Report Details</h3>
                  <RiskBadge severity={result.scored?.severity} dot />
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <p><span className="text-slate-400">Report ID:</span> <span className="text-slate-100 font-medium">{result.scored?.id ?? result.id}</span></p>
                  <p><span className="text-slate-400">Disaster Type:</span> <span className="text-slate-100">{form.disaster_type}</span></p>
                  <p><span className="text-slate-400">Confidence:</span> <span className="text-slate-100 font-medium">{result.scored?.confidence_score ?? 0}%</span></p>
                  <p><span className="text-slate-400">Verification:</span> <span className="text-slate-100">{result.scored?.status || 'PENDING'}</span></p>
                  <p><span className="text-slate-400">Rainfall (24h):</span> <span className="text-slate-100">{result.scored?.weather?.precipitation_mm ?? 0} mm</span></p>
                  <p className="col-span-2"><span className="text-slate-400">Location:</span> <span className="text-slate-100">{result.lat.toFixed(4)}, {result.lng.toFixed(4)}</span></p>
                </div>
                <div className="flex gap-3 mt-5">
                  <Button variant="primary" size="sm" icon={Send} onClick={() => navigate(`/report/${result.scored?.id ?? result.id}/verification`)}>View Verification Result</Button>
                  <Button variant="secondary" size="sm" onClick={reset}>Submit Another</Button>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="h-[60vh] rounded-2xl overflow-hidden border border-white/10">
          <MapContainer center={[form.lat, form.lng]} zoom={13} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[form.lat, form.lng]} />
            <MapClickHandler onSet={updateCoords} />
            <MapRecenter lat={form.lat} lng={form.lng} />
          </MapContainer>
        </motion.div>
      </div>
    </div>
  );
}

function MapClickHandler({ onSet }) {
  useMapEvents({
    click: (e) => onSet([e.latlng.lat, e.latlng.lng]),
  });
  return null;
}

function MapRecenter({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 13, { animate: true });
  }, [lat, lng, map]);
  return null;
}

