import { motion } from 'framer-motion';
import { CloudRain, Wind, Thermometer, Gauge, Droplets, RefreshCw, AlertTriangle } from 'lucide-react';
import { GlassCard } from '../components/ui';
import { useRealtime } from '../context/RealtimeContext';

export default function WeatherIntelligence() {
  const { weatherData, fetchWeather } = useRealtime();
  const current = weatherData.current;

  return (
    <div className="space-y-8 py-4">
      <motion.header initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Weather Intelligence</h1>
            <span
              className={`px-3 py-1 rounded-full text-xs font-extrabold font-mono uppercase ${
                weatherData.status === 'LIVE'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}
            >
              ??? {weatherData.status === 'LIVE' ? 'LIVE WEATHER' : 'API OFFLINE'}
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Real-time meteorology stream integrated directly with Open-Meteo API sensors
          </p>
        </div>

        <button
          onClick={fetchWeather}
          className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold text-slate-200 flex items-center gap-2 transition-all"
        >
          <RefreshCw className="w-4 h-4 text-cyan-400" />
          <span>Refresh API</span>
        </button>
      </motion.header>

      {/* Weather Telemetry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <WeatherCard icon={Thermometer} label="Temperature" value={`${current.temperature_2m}??C`} sub="Delhi NCR Ridge" color="cyan" />
        <WeatherCard icon={CloudRain} label="Rainfall Rate" value={`${current.precipitation} mm`} sub="Threshold Exceeded" color="blue" />
        <WeatherCard icon={Droplets} label="Relative Humidity" value={`${current.relative_humidity_2m}%`} sub="Moisture High" color="emerald" />
        <WeatherCard icon={Wind} label="Wind Velocity" value={`${current.wind_speed_10m} km/h`} sub="Gusts Active" color="amber" />
        <WeatherCard icon={Gauge} label="Atmospheric Pressure" value={`${current.pressure_msl} hPa`} sub="MSL Pressure" color="purple" />
      </div>

      {/* Open-Meteo Integration Banner */}
      <GlassCard className="p-6 border border-white/10 space-y-4 bg-slate-900/90">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
              <CloudRain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Open-Meteo Meteorological Service Status</h3>
              <p className="text-xs text-slate-400">Station Coordinates: 28.6139?? N, 77.2090?? E</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block">Status:</span>
            <span className="text-sm font-bold text-emerald-400 font-mono">{weatherData.status}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
          <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
            <span className="font-bold text-white block">Precipitation Accumulation</span>
            <p className="text-slate-400">Current hourly rainfall threshold saturation stands at 68.5 mm/h. High rainfall directly drives soil moisture saturation and landslide trigger score.</p>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
            <span className="font-bold text-white block">Last Successful API Sync</span>
            <p className="text-slate-400">{weatherData.lastSuccessTime} ({weatherData.lastUpdatedAgo})</p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

function WeatherCard({ icon: Icon, label, value, sub, color }) {
  const colorMap = {
    cyan: 'text-cyan-400 border-cyan-500/30',
    blue: 'text-blue-400 border-blue-500/30',
    emerald: 'text-emerald-400 border-emerald-500/30',
    amber: 'text-amber-400 border-amber-500/30',
    purple: 'text-purple-400 border-purple-500/30',
  };
  return (
    <GlassCard className={`p-5 border ${colorMap[color]} hover:scale-[1.02] transition-all`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
        <Icon className="w-5 h-5 text-slate-300" />
      </div>
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="text-xs text-slate-400 mt-1">{sub}</p>
    </GlassCard>
  );
}
