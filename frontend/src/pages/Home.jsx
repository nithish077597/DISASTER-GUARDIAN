import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer } from 'react-leaflet';
import { Shield, Map, Send, AlertTriangle, Navigation, ShieldCheck, CloudRain, Bell, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, StatusIndicator, GlassCard } from '../components/ui';
import { fadeUp, fadeUpStagger } from '../animations/variants';
import { useUser } from '../context/UserContext';
import { ReportMarker, ShelterMarker, DangerZoneCircle, LiveUserMarker, EvacuationRoutePolyline } from '../components/MapMarkers';

const features = [
  {
    title: 'AI Disaster Verification',
    description: 'Machine-powered confidence scoring validates citizen reports using Open-Meteo rainfall telemetry and spatial correlation.',
    icon: ShieldCheck,
    color: 'cyan',
  },
  {
    title: 'Real-Time Risk Geofencing',
    description: 'Live danger-zone calculation pinpoints hazard perimeters and tracks affected populations at risk on Leaflet maps.',
    icon: AlertTriangle,
    color: 'amber',
  },
  {
    title: 'Safe Evacuation Routing',
    description: 'Nearest verified emergency shelters ranked by distance, capacity, and risk score with instant turn-by-turn navigation.',
    icon: Navigation,
    color: 'emerald',
  },
  {
    title: 'Multi-Channel Alert Dispatch',
    description: 'Severity-triggered emergency alerts routed through mobile app, SMS, voice call, and hardware sirens.',
    icon: Bell,
    color: 'red',
  },
];

const MOCK_HERO_REPORTS = [
  { id: 101, disaster_type: 'FLOOD', lat: 28.6139, lng: 77.2090, severity: 'CRITICAL', confidence_score: 87 },
  { id: 102, disaster_type: 'LANDSLIDE', lat: 28.6450, lng: 77.1800, severity: 'HIGH_RISK', confidence_score: 68 },
  { id: 103, disaster_type: 'FIRE', lat: 28.5800, lng: 77.2400, severity: 'CONFIRMED', confidence_score: 45 },
];

const MOCK_HERO_SHELTERS = [
  { id: 's1', name: 'Central Relief Camp', lat: 28.6300, lng: 77.2300, capacity: 500, current_occupancy: 120 },
  { id: 's2', name: 'North Safe Zone', lat: 28.6600, lng: 77.1600, capacity: 300, current_occupancy: 45 },
];

const MOCK_HERO_ZONES = [
  { center: { lat: 28.6139, lng: 77.2090 }, radius_m: 2500, severity: 'CRITICAL' },
  { center: { lat: 28.6450, lng: 77.1800 }, radius_m: 1800, severity: 'HIGH_RISK' },
];

export default function Home() {
  const { user, isLoggedIn } = useUser();
  const navigate = useNavigate();

  return (
    <div className="space-y-16 py-4">
      <HeroSection user={user} isLoggedIn={isLoggedIn} navigate={navigate} />
      <FeatureSection />
      <CallToActionBanner />
    </div>
  );
}

function HeroSection({ user, isLoggedIn, navigate }) {
  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={fadeUpStagger}
      className="flex flex-col items-center text-center py-4 relative"
    >
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] -z-10" />

      {/* Top Badge */}
      <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 mb-6 shadow-lg shadow-cyan-500/10">
        <Shield className="w-4 h-4 text-cyan-400" />
        <span className="text-xs font-extrabold text-cyan-300 tracking-widest uppercase">DISASTER GUARDIAN • HACKATHON PLATFORM</span>
      </motion.div>

      {/* Main Headline */}
      <motion.h1 variants={fadeUp} className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-4 leading-tight">
        <span className="text-white">AI-Powered </span>
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-300 to-indigo-200">Disaster Guardian</span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p variants={fadeUp} className="text-lg md:text-2xl text-slate-300 max-w-3xl mb-3 font-light leading-relaxed">
        Verify disaster reports. Identify people at risk. Find safer evacuation routes. Alert communities before it's too late.
      </motion.p>

      {/* Tagline */}
      <motion.p variants={fadeUp} className="text-base md:text-lg text-cyan-400 font-semibold tracking-wider uppercase mb-8">
        "Verify. Predict. Protect."
      </motion.p>

      {/* Primary & Secondary CTAs */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
        <Link to="/report">
          <Button variant="primary" size="xl" icon={Send} className="bg-gradient-to-r from-red-500 to-rose-600 border-none shadow-xl shadow-red-500/30 text-white font-bold">
            Report an Emergency
          </Button>
        </Link>
        <Link to="/map">
          <Button variant="secondary" size="xl" icon={Map} className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10">
            View Live Disaster Map
          </Button>
        </Link>
      </motion.div>

      {/* Hero Visual: Large Leaflet Disaster Intelligence Map */}
      <motion.div variants={fadeUp} className="w-full max-w-6xl relative rounded-3xl overflow-hidden border border-white/15 shadow-2xl shadow-black/80">
        <div className="h-[460px] w-full relative z-0">
          <MapContainer center={[28.6139, 77.2090]} zoom={11} style={{ height: '100%', width: '100%' }} zoomControl={false} scrollWheelZoom={false}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>' />
            {MOCK_HERO_ZONES.map((z, idx) => (
              <DangerZoneCircle key={idx} zone={z} />
            ))}
            {MOCK_HERO_REPORTS.map((r) => (
              <ReportMarker key={r.id} report={r} />
            ))}
            {MOCK_HERO_SHELTERS.map((s) => (
              <ShelterMarker key={s.id} shelter={s} />
            ))}
            <EvacuationRoutePolyline from={{ lat: 28.6139, lng: 77.2090 }} to={{ lat: 28.6300, lng: 77.2300 }} />
          </MapContainer>
        </div>

        {/* Floating Telemetry Data Cards */}
        <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
          <div className="flex flex-wrap gap-2 pointer-events-auto">
            <FloatingBadge icon={AlertTriangle} label="12 Active Reports" color="red" />
            <FloatingBadge icon={Shield} label="3 High Risk Zones" color="amber" />
            <FloatingBadge icon={Navigation} label="8 Safe Shelters" color="emerald" />
            <FloatingBadge icon={Bell} label="1 Critical Alert" color="purple" />
          </div>
          <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10 text-xs font-semibold text-emerald-400 flex items-center gap-2">
            <StatusIndicator operational pulse size="sm" />
            <span>AI ENGINE LIVE TELEMETRY</span>
          </div>
        </div>

        {/* Map Overlay Bottom Bar */}
        <div className="absolute bottom-4 left-4 right-4 z-10 bg-slate-900/90 backdrop-blur-xl p-4 rounded-2xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
              <Map className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Disaster Intelligence Map</h4>
              <p className="text-xs text-slate-400">Live danger zone geofences, report clusters, and safe shelter routes</p>
            </div>
          </div>
          <Button variant="primary" size="sm" icon={ArrowRight} onClick={() => navigate('/map')}>
            Explore Full Map
          </Button>
        </div>
      </motion.div>
    </motion.section>
  );
}

function FloatingBadge({ icon: Icon, label, color = 'cyan' }) {
  const colors = {
    red: 'bg-red-500/20 border-red-500/40 text-red-300',
    amber: 'bg-amber-500/20 border-amber-500/40 text-amber-300',
    emerald: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
    purple: 'bg-purple-500/20 border-purple-500/40 text-purple-300',
    cyan: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300',
  };
  return (
    <div className={`px-3 py-1.5 rounded-xl border backdrop-blur-md text-xs font-bold flex items-center gap-2 shadow-lg ${colors[color]}`}>
      <Icon className="w-3.5 h-3.5" />
      <span>{label}</span>
    </div>
  );
}

function FeatureSection() {
  return (
    <motion.section initial="hidden" animate="visible" variants={containerVariants} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {features.map((f) => (
        <motion.div key={f.title} variants={fadeUp} whileHover={{ y: -8, transition: { duration: 0.2 } }}>
          <GlassCard className="p-6 h-full flex flex-col text-center group border border-white/10 relative overflow-hidden">
            <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center shadow-lg shadow-black/40">
              <f.icon className="w-7 h-7 text-cyan-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-2 group-hover:text-cyan-300 transition-colors">{f.title}</h3>
            <p className="text-xs md:text-sm text-slate-400 leading-relaxed flex-1">{f.description}</p>
          </GlassCard>
        </motion.div>
      ))}
    </motion.section>
  );
}

function CallToActionBanner() {
  return (
    <GlassCard className="p-8 md:p-10 border border-cyan-500/30 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 relative overflow-hidden">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-2xl md:text-3xl font-extrabold text-white">Need Immediate Emergency Assistance?</h3>
          <p className="text-sm md:text-base text-slate-300 max-w-xl">
            Submit a disaster report or check weather risks & safe evacuation centers in your area.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/report">
            <Button variant="primary" size="lg" icon={Send} className="bg-red-500 hover:bg-red-400 text-white border-none shadow-lg shadow-red-500/30">
              Report Emergency
            </Button>
          </Link>
          <Link to="/weather">
            <Button variant="secondary" size="lg" icon={CloudRain}>
              Weather Risks
            </Button>
          </Link>
        </div>
      </div>
    </GlassCard>
  );
}

const containerVariants = {
  hidden: { opacity: 1 },
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};
