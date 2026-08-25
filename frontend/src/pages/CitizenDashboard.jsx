import { useState, useEffect } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import {
  ShieldAlert, MapPin, Navigation, Volume2, VolumeX, RefreshCw, Shield, Megaphone, Map, CheckCircle2,
  AlertTriangle, Bell, ArrowUpRight, CloudRain, Home, User, Globe, HelpCircle, Activity, Satellite, Layers
} from 'lucide-react';
import { useRealtime } from '../context/RealtimeContext';
import { geoService } from '../services/geoService';
import { safeRouteService } from '../services/safeRouteService';
import { authService } from '../services/authService';
import { i18nAlerts } from '../services/i18nAlerts';
import { floodRiskEngine } from '../services/floodRiskEngine';
import { dataFreshnessService } from '../services/dataFreshnessService';
import SosConfirmModal from '../components/SosConfirmModal';
import QuickReportModal from '../components/QuickReportModal';
import VoiceAssistantModal from '../components/VoiceAssistantModal';
import EmergencyGuidanceModal from '../components/EmergencyGuidanceModal';
import EmergencyTickerBanner from '../components/EmergencyTickerBanner';
import LiveNewsFeed from '../components/LiveNewsFeed';
import MobileNav from '../components/MobileNav';
import DemoBar from '../components/DemoBar';
import { ShelterMarker, DangerZoneCircle, HighRiskZoneCircle, MediumRiskZoneCircle, LowRiskZoneCircle, EvacuationRoutePolyline, UserMarker } from '../components/MapMarkers';
import { Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ta', label: '???????????????' },
  { code: 'hi', label: '??????????????????' },
  { code: 'te', label: '??????????????????' },
  { code: 'kn', label: '<ctrl42>???????????????' },
  { code: 'ml', label: '??????????????????' },
];

export default function CitizenDashboard() {
  const {
    riskEngine,
    shelters,
    weatherData,
    voiceLanguage,
    playVoiceAlert,
    submitCitizenReport,
    eventStream,
  } = useRealtime();

  const [locationName, setLocationName] = useState('Sulur, Tamil Nadu');
  const [coords, setCoords] = useState(null);
  const [locLoading, setLocLoading] = useState(false);
  const [forceEmergencyState, setForceEmergencyState] = useState(false);
  const [selectedLang, setSelectedLang] = useState('en');
  const [audioMuted, setAudioMuted] = useState(false);
  const currentUser = authService.getCurrentUser();
  const freshnessData = dataFreshnessService.getFreshnessData();

  // Layer Toggles
  const [showWeatherOverlay, setShowWeatherOverlay] = useState(true);
  const [showRiskZones, setShowRiskZones] = useState(true);
  const [showShelters, setShowShelters] = useState(true);

  // Modals
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [guidanceModalOpen, setGuidanceModalOpen] = useState(false);

  const fetchGpsLocation = async () => {
    setLocLoading(true);
    try {
      const pos = await geoService.requestPosition();
      setCoords({ lat: pos.lat, lng: pos.lng });
      const name = await geoService.reverseGeocode(pos.lat, pos.lng);
      setLocationName(name || 'Sulur, Tamil Nadu');
    } catch {
      setLocationName('Sulur, Tamil Nadu');
    } finally {
      setLocLoading(false);
    }
  };

  useEffect(() => {
    fetchGpsLocation();
  }, []);

  const t = i18nAlerts[selectedLang] || i18nAlerts.en;
  const floodModel = floodRiskEngine.calculateFloodRisk({
    precipitation: weatherData.current.precipitation || 34,
    rainIntensity: 82,
    accumulation3h: 148,
    waterLevel: 'MEDIUM',
    slope: 38,
  });

  const safeShelter = safeRouteService.getRecommendedShelter(shelters);
  const isEmergency = forceEmergencyState || riskEngine.score >= 80;

  const handleStartSafeRoute = () => {
    safeRouteService.openSafeNavigation(28.618, 77.208, safeShelter.lat, safeShelter.lng);
  };

  const center = [28.621, 77.214];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-red-600/30 selection:text-red-200 select-none pb-24 md:pb-8">
      {/* TOP-OF-PAGE EMERGENCY MESSAGES (NORMAL / HIGH / RISK / CRITICAL) */}
      <EmergencyTickerBanner />

      <SosConfirmModal
        isOpen={sosModalOpen}
        onClose={() => setSosModalOpen(false)}
        userLocation={locationName}
      />

      <QuickReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        onSubmitReport={submitCitizenReport}
        locationName={locationName}
      />

      <VoiceAssistantModal
        isOpen={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
        locationName={locationName}
      />

      <EmergencyGuidanceModal
        isOpen={guidanceModalOpen}
        onClose={() => setGuidanceModalOpen(false)}
        disasterType="FLOOD"
        lang={selectedLang}
      />

      {/* TOP HEADER */}
      <header className="h-16 px-4 md:px-8 bg-slate-900 border-b border-slate-800 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center text-white font-black shadow-lg shadow-red-600/30">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <span className="font-black text-sm md:text-base text-white tracking-tight uppercase block">
              DISASTER MANAGEMENT
            </span>
            <span className="text-[10px] text-slate-400 font-mono hidden sm:block">
              Know the danger. Find safety. Get help.
            </span>
          </div>
        </div>

        {/* Location, Language & Profile */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-red-400" />
            <span>???? <strong>{locationName}</strong></span>
            <button onClick={fetchGpsLocation} className="hover:text-cyan-400" title="Update Location">
              <RefreshCw className={`w-3.5 h-3.5 ${locLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* 6 Regional Languages Selector */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl px-2 py-1 text-xs">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="bg-transparent text-white font-bold focus:outline-none text-xs cursor-pointer"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code} className="bg-slate-900 text-white">
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          <Link to="/alerts" className="relative p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white" title="Alerts">
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
          </Link>
        </div>
      </header>

      {/* MAIN LAYOUT WRAPPER */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* DESKTOP LEFT SIDEBAR */}
        <aside className="lg:col-span-3 hidden lg:flex flex-col gap-2 bg-slate-900 border border-slate-800 rounded-3xl p-4 h-fit sticky top-20 shadow-xl">
          <h2 className="text-xs font-mono font-bold text-slate-400 uppercase px-3 py-1 border-b border-slate-800">
            NAVIGATION
          </h2>
          <Link to="/citizen" className="flex items-center gap-3 px-3.5 py-3 rounded-2xl bg-red-600 text-white font-extrabold text-xs uppercase shadow-md">
            <Home className="w-4 h-4" />
            <span>HOME</span>
          </Link>
          <Link to="/map" className="flex items-center gap-3 px-3.5 py-3 rounded-2xl text-slate-400 hover:text-white hover:bg-slate-800 font-bold text-xs uppercase transition-all">
            <Map className="w-4 h-4" />
            <span>LIVE MAP</span>
          </Link>
          <button onClick={() => setReportModalOpen(true)} className="flex items-center gap-3 px-3.5 py-3 rounded-2xl text-slate-400 hover:text-white hover:bg-slate-800 font-bold text-xs uppercase transition-all text-left">
            <Megaphone className="w-4 h-4 text-cyan-400" />
            <span>REPORT DISASTER</span>
          </button>
          <Link to="/alerts" className="flex items-center gap-3 px-3.5 py-3 rounded-2xl text-slate-400 hover:text-white hover:bg-slate-800 font-bold text-xs uppercase transition-all">
            <Bell className="w-4 h-4" />
            <span>ALERTS</span>
          </Link>
          <button onClick={() => setSosModalOpen(true)} className="flex items-center gap-3 px-3.5 py-3 rounded-2xl bg-red-950/60 border border-red-600/60 text-red-300 hover:bg-red-600 hover:text-white font-black text-xs uppercase transition-all shadow-md">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span>EMERGENCY SOS</span>
          </button>

          {/* User profile in sidebar */}
          <div className="mt-4 p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-400 space-y-1">
            <span className="flex items-center gap-1.5 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>REGISTERED CITIZEN</span>
            </span>
            <p className="text-white font-sans text-xs font-bold">{currentUser?.name || 'Citizen'}</p>
            <p className="text-slate-400">{currentUser?.mobile || '9876543210'}</p>
            {currentUser?.location && (
              <p className="text-slate-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-red-400" />
                {currentUser.location}
              </p>
            )}
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="lg:col-span-9 space-y-6">
          {/* SIMULATOR BAR */}
          <DemoBar />

          {/* LIVE NEWS BASED ON CITIZEN LOCATION */}
          <LiveNewsFeed locationName={locationName} coords={coords} />

          {/* DYNAMIC SAFETY STATUS CARD WITH REGIONAL TRANSLATION */}
          {isEmergency ? (
            <div className="p-6 md:p-8 rounded-3xl bg-slate-900 border-2 border-red-600 space-y-4 shadow-2xl animate-pulse">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-black text-red-500 uppercase tracking-wider">{t.criticalWarning}</span>
                <span className="px-2.5 py-0.5 rounded bg-red-950 text-red-400 font-mono font-bold text-xs">CRITICAL 91/100</span>
              </div>
              <div className="space-y-1.5">
                <h2 className="text-3xl font-black text-red-500 uppercase tracking-tight">{t.criticalWarning}</h2>
                <p className="text-sm md:text-base text-slate-100 font-medium">{t.criticalMsg}</p>
                <div className="p-4 rounded-2xl bg-red-950/60 border border-red-600/60 text-xs md:text-sm text-red-300 mt-2 space-y-1">
                  <span className="font-extrabold block text-white uppercase">ACTION REQUIRED:</span>
                  <p>{t.takeActionNow}</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button onClick={handleStartSafeRoute} className="flex-1 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs md:text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2">
                  <Navigation className="w-5 h-5" />
                  <span>[ ??????? GUIDE ME TO SAFETY ]</span>
                </button>
                <button onClick={() => setGuidanceModalOpen(true)} className="py-3.5 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-extrabold text-xs uppercase border border-slate-700 flex items-center justify-center gap-2">
                  <HelpCircle className="w-4 h-4 text-cyan-400" />
                  <span>WHAT SHOULD I DO?</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 md:p-8 rounded-3xl bg-slate-900 border-2 border-emerald-500/60 space-y-2 shadow-xl text-center">
              <span className="w-4 h-4 rounded-full bg-emerald-500 inline-block animate-pulse mb-1" />
              <h2 className="text-3xl md:text-4xl font-black text-emerald-400 uppercase tracking-tight">{t.safeStatus}</h2>
              <p className="text-sm md:text-base text-slate-200">{t.safeMsg}</p>
              <span className="text-xs text-slate-500 font-mono block">Updated 2 minutes ago</span>
            </div>
          )}

          {/* BIG SOS EMERGENCY CENTER BUTTON */}
          <button
            onClick={() => setSosModalOpen(true)}
            className="w-full py-5 rounded-3xl bg-red-600 hover:bg-red-500 text-white font-black text-base md:text-lg uppercase tracking-wider shadow-2xl shadow-red-600/40 flex items-center justify-center gap-3 animate-pulse border-2 border-white/20"
          >
            <ShieldAlert className="w-7 h-7" />
            <span>???? EMERGENCY SOS</span>
          </button>

          {/* LIVE DISASTER INTELLIGENCE MAP WITH WEATHER OVERLAY & ALERT LIGHT ZONES */}
          <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Map className="w-5 h-5 text-cyan-400" />
                <h3 className="font-extrabold text-sm md:text-base text-white uppercase tracking-tight">LIVE DISASTER INTELLIGENCE MAP</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowRiskZones(!showRiskZones)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold border transition-all ${
                    showRiskZones ? 'bg-red-950 border-red-500 text-red-300' : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  ???? ALERT LIGHT ZONES
                </button>
                <Link to="/map" className="text-xs text-cyan-400 font-bold hover:underline flex items-center gap-1">
                  <span>Full Map</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* MAP CONTAINER & OVERLAYS */}
            <div className="h-[420px] md:h-[460px] w-full rounded-2xl overflow-hidden border border-slate-800 relative z-10">
              {/* FLOATING WEATHER MAP OVERLAY */}
              {showWeatherOverlay && (
                <div className="absolute top-3 left-3 z-[1000] p-3.5 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-slate-800 text-white font-mono text-xs space-y-1 shadow-2xl max-w-[240px]">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                    <span className="font-bold text-cyan-400 uppercase text-[11px]">???? SULUR WEATHER</span>
                    <span className="text-[10px] text-emerald-400 font-bold">???? LIVE</span>
                  </div>
                  <div className="space-y-0.5 text-[11px] font-sans">
                    <p className="text-lg font-black text-white">??????? 28??C <span className="text-xs text-cyan-400 font-normal">??????? Heavy Rain</span></p>
                    <p className="text-slate-300 text-[10px]">???? Humidity: <strong>84%</strong> ??? ???? Wind: <strong>18 km/h</strong></p>
                    <p className="text-amber-400 font-bold text-[10px] uppercase">?????? FLOOD RISK: HIGH (78/100)</p>
                  </div>
                </div>
              )}

              {/* MAP LEGEND OVERLAY */}
              <div className="absolute bottom-3 left-3 z-[1000] p-2.5 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-slate-800 text-white font-mono text-[10px] space-y-1 shadow-2xl">
                <span className="font-bold text-slate-400 block text-[9px]">ALERT LIGHT LEGEND</span>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>???? SAFE</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span>???? MEDIUM</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                  <span>???? CRITICAL</span>
                </div>
              </div>

              <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }} zoomControl={false} scrollWheelZoom={false}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>' />
                
                {/* ALERT LIGHT RISK ZONES */}
                {showRiskZones && (
                  <>
                    <DangerZoneCircle center={{ lat: 28.621, lng: 77.214 }} radius_m={2500} />
                    <HighRiskZoneCircle center={{ lat: 28.625, lng: 77.220 }} radius_m={1800} />
                    <MediumRiskZoneCircle center={{ lat: 28.612, lng: 77.200 }} radius_m={1500} />
                    <LowRiskZoneCircle center={{ lat: 28.600, lng: 77.190 }} radius_m={1200} />
                  </>
                )}

                <UserMarker position={[28.618, 77.208]} />
                {showShelters && shelters.map((s) => (
                  <ShelterMarker key={s.id} shelter={s} />
                ))}
                <EvacuationRoutePolyline from={{ lat: 28.618, lng: 77.208 }} to={{ lat: 28.625, lng: 77.215 }} />
              </MapContainer>
            </div>
          </div>

          {/* RAINFALL INTELLIGENCE & AI FLOOD RISK ENGINE PANEL */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <CloudRain className="w-5 h-5 text-cyan-400" />
                <h3 className="font-extrabold text-base text-white uppercase tracking-tight">
                  AI FLOOD RISK PREDICTION ENGINE
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-cyan-950 border border-cyan-500/50 text-cyan-300 font-mono font-bold text-xs">
                {floodModel.modelStatus}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Rain Intensity Metrics */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs">
                <span className="text-slate-400 font-bold uppercase block text-[11px]">??????? RAINFALL MONITORING PANEL</span>
                <div className="grid grid-cols-2 gap-2 text-white">
                  <div>Intensity: <strong className="text-cyan-400 text-sm">82 mm/hr</strong></div>
                  <div>1-Hour: <strong className="text-white text-sm">65 mm</strong></div>
                  <div>3-Hour: <strong className="text-amber-400 text-sm">148 mm</strong></div>
                  <div>24-Hour: <strong className="text-red-400 text-sm">230 mm</strong></div>
                </div>
                <div className="pt-1 flex items-center justify-between">
                  <span className="text-slate-400">Rainfall Status:</span>
                  <span className="px-2 py-0.5 rounded bg-red-950 text-red-400 font-bold">???? EXTREME</span>
                </div>
              </div>

              {/* Flood Risk Score */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-bold uppercase text-[11px]">???? FLOOD RISK SCORE</span>
                  <span className="text-cyan-300 font-bold">{floodModel.confidenceScore}% Confidence</span>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-black text-amber-400">{floodModel.score}</span>
                  <span className="text-xs text-slate-400">/ 100 ({floodModel.riskLevel})</span>
                </div>
                <p className="text-[11px] text-slate-300">Expected Risk Window: <strong className="text-white">{floodModel.expectedWindow}</strong></p>
              </div>
            </div>

            {/* EXPLAINABLE AI PANEL */}
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-2 text-xs">
              <h4 className="font-extrabold text-amber-400 uppercase flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4" />
                <span>{t.whyRiskHigh}</span>
              </h4>
              <ul className="space-y-1 text-slate-300 font-sans">
                <li className="flex items-start gap-1.5">??? <span>{t.rainfallIntensity}</span></li>
                <li className="flex items-start gap-1.5">??? <span>{t.rainfallAccumulation}</span></li>
                <li className="flex items-start gap-1.5">??? <span>{t.waterLevelRising}</span></li>
                <li className="flex items-start gap-1.5">??? <span>{t.historicalFlood}</span></li>
                <li className="flex items-start gap-1.5">??? <span>{t.forecastRain}</span></li>
              </ul>
            </div>
          </div>
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION */}
      <MobileNav
        onOpenReport={() => setReportModalOpen(true)}
        onOpenSos={() => setSosModalOpen(true)}
      />
    </div>
  );
}
