import { motion } from 'framer-motion';
import { Shield, Map, Send, AlertTriangle, Navigation, ShieldCheck, LogIn, Users, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button, StatusIndicator, GlassCard } from '../components/ui';
import { fadeUp, fadeUpStagger } from '../animations/variants';
import { useUser } from '../context/UserContext';

const features = [
  {
    title: 'AI Disaster Verification',
    description: 'Machine-powered confidence scoring validates citizen reports using weather satellite telemetry and spatial correlation.',
    icon: ShieldCheck,
    color: 'cyan',
  },
  {
    title: 'Real-Time Risk Geofencing',
    description: 'Live danger-zone calculation pinpoints hazard perimeters and tracks live active citizens at risk in real time.',
    icon: AlertTriangle,
    color: 'amber',
  },
  {
    title: 'Safe Evacuation & Shelters',
    description: 'Verified emergency shelters ranked by distance, capacity, and threat severity with instant turn-by-turn navigation.',
    icon: Navigation,
    color: 'emerald',
  },
  {
    title: 'Multi-Channel Alert Dispatch',
    description: 'Threat severity triggers automatic multi-channel alerts across mobile app, SMS, voice broadcast, and hardware sirens.',
    icon: AlertTriangle,
    color: 'red',
  },
];

const colorMap = {
  cyan: 'from-cyan-500 to-blue-500',
  amber: 'from-amber-400 to-orange-500',
  emerald: 'from-emerald-400 to-green-500',
  red: 'from-red-500 to-rose-500',
};

export default function Home() {
  const { user, isLoggedIn } = useUser();

  return (
    <div className="space-y-16 py-4">
      <HeroSection user={user} isLoggedIn={isLoggedIn} />
      <FeatureSection />
    </div>
  );
}

function HeroSection({ user, isLoggedIn }) {
  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={fadeUpStagger}
      className="flex flex-col items-center text-center py-6 relative"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -z-10" />

      <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 mb-6 shadow-lg shadow-cyan-500/5">
        <Shield className="w-4 h-4 text-cyan-400" />
        <span className="text-xs font-semibold text-cyan-300 tracking-wider uppercase">REAL-TIME DISASTER INTELLIGENCE</span>
      </motion.div>

      <motion.h1 variants={fadeUp} className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-4 leading-tight">
        <span className="text-white">AI-Powered </span>
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-300 to-slate-100">Disaster Guardian</span>
      </motion.h1>

      <motion.p variants={fadeUp} className="text-xl md:text-2xl text-slate-300 max-w-2xl mb-4 font-light">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-slate-100 font-semibold">Verify. Predict. Protect.</span>
      </motion.p>

      <motion.p variants={fadeUp} className="text-slate-400 max-w-2xl mb-10 text-sm md:text-base leading-relaxed">
        Disaster Guardian leverages artificial intelligence to verify citizen hazard reports, calculate real-time danger zones using meteorology data, provide personalized evacuation routes, and track live citizen safety.
      </motion.p>

      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
        {!isLoggedIn ? (
          <Link to="/login">
            <Button variant="primary" size="xl" icon={LogIn} className="shadow-lg shadow-cyan-500/25">
              Citizen Login / Location
            </Button>
          </Link>
        ) : (
          <Link to="/login">
            <Button variant="secondary" size="xl" icon={Users}>
              Profile: {user.name}
            </Button>
          </Link>
        )}
        <Link to="/report">
          <Button variant="primary" size="xl" icon={Send} className="bg-gradient-to-r from-red-500 to-rose-600 border-none shadow-lg shadow-red-500/20">
            Report Emergency
          </Button>
        </Link>
        <Link to="/map">
          <Button variant="secondary" size="xl" icon={Map}>
            View Live Map
          </Button>
        </Link>
      </motion.div>

      <motion.div
        variants={fadeUp}
        className="flex items-center justify-center gap-4 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-xl"
      >
        <div className="flex items-center gap-2">
          <StatusIndicator operational pulse />
          <span className="text-emerald-400 font-semibold text-xs tracking-wide">SYSTEM OPERATIONAL</span>
        </div>
        <span className="text-slate-600">•</span>
        <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
          <Users className="w-3.5 h-3.5 text-cyan-400" />
          <span>{isLoggedIn ? `Active as ${user.name}` : 'Live Real-Time Users Active'}</span>
        </div>
      </motion.div>
    </motion.section>
  );
}

function FeatureSection() {
  return (
    <motion.section initial="hidden" animate="visible" variants={containerVariants} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {features.map((f, i) => (
        <motion.div key={f.title} variants={fadeUp} whileHover={{ y: -8, transition: { duration: 0.2 } }}>
          <GlassCard className="p-6 h-full flex flex-col text-center group border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl group-hover:bg-cyan-500/15 transition-all" />
            <motion.div
              className={`w-14 h-14 mx-auto mb-5 rounded-2xl bg-gradient-to-br ${colorMap[f.color]} flex items-center justify-center shadow-lg shadow-black/40`}
              whileHover={{ rotate: 6, scale: 1.1 }}
            >
              <f.icon className="w-7 h-7 text-white" />
            </motion.div>
            <h3 className="text-lg font-bold text-slate-100 mb-2 group-hover:text-cyan-300 transition-colors">{f.title}</h3>
            <p className="text-xs md:text-sm text-slate-400 leading-relaxed flex-1">{f.description}</p>
          </GlassCard>
        </motion.div>
      ))}
    </motion.section>
  );
}

const containerVariants = {
  hidden: { opacity: 1 },
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};
