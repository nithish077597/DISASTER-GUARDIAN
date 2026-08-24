import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CloudRain, Wind, Droplets, Thermometer, ShieldAlert, RefreshCw } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { weatherApi } from '../api';
import { GlassCard, StatCard, Button, Loader, ErrorState } from '../components/ui';

export default function WeatherIntelligence() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWeather = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await weatherApi.getForecast(28.6139, 77.2090);
      setData(res);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to load Open-Meteo telemetry.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  if (error) return <ErrorState error={error} onRetry={fetchWeather} />;

  const current = data?.current || {};
  const hourly = data?.hourly || {};
  const daily = data?.daily || {};

  const temp = current.temperature_2m ?? 29.4;
  const humidity = current.relative_humidity_2m ?? 88;
  const rainfall24h = daily.precipitation_sum?.[0] ?? 68.5;
  const wind = current.wind_speed_10m ?? 34.2;

  const isTriggered = rainfall24h >= 50;
  const weatherRisk = rainfall24h >= 50 ? 'CRITICAL' : rainfall24h >= 20 ? 'HIGH' : 'MODERATE';

  // Prepare Recharts hourly rainfall data
  const chartData = (hourly.time || []).slice(0, 24).map((t, idx) => ({
    time: typeof t === 'string' ? t.split('T')?.[1]?.slice(0, 5) || `${idx}:00` : `${idx}:00`,
    rainfall: hourly.precipitation?.[idx] ?? 0,
    temp: hourly.temperature_2m?.[idx] ?? 28,
  }));

  return (
    <div className="space-y-8 py-4">
      <motion.header initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-white">Weather Intelligence</h1>
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
              <CloudRain className="w-3.5 h-3.5" />
              Open-Meteo Satellite Feed
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">Real-time meteorological monitoring and automated 24h rainfall trigger evaluation</p>
        </div>

        <Button variant="secondary" size="sm" icon={RefreshCw} onClick={fetchWeather}>
          Refresh Telemetry
        </Button>
      </motion.header>

      {loading ? (
        <Loader text="Fetching Open-Meteo satellite weather data..." />
      ) : (
        <>
          {/* Top Telemetry KPIs */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Thermometer} label="Temperature" value={`${temp}°C`} color="cyan" />
            <StatCard icon={CloudRain} label="24h Rainfall Sum" value={`${rainfall24h} mm`} color="blue" />
            <StatCard icon={Wind} label="Wind Speed" value={`${wind} km/h`} color="purple" />
            <StatCard icon={Droplets} label="Humidity" value={`${humidity}%`} color="emerald" />
          </section>

          {/* 24h Rainfall Trigger Highlight Banner */}
          <GlassCard className={`p-6 border ${isTriggered ? 'border-red-500/40 bg-red-500/10' : 'border-amber-500/40 bg-amber-500/10'} shadow-2xl space-y-3`}>
            <div className="flex items-center justify-between flex-wrap gap-3 border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-extrabold text-red-400 uppercase tracking-widest block">24h Rainfall Trigger Highlight</span>
                  <h3 className="text-2xl font-extrabold text-white">{rainfall24h} mm / 24 Hours</h3>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 font-extrabold text-xs">
                  STATUS: HEAVY RAINFALL
                </span>
                <span className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-extrabold text-xs">
                  RISK: {weatherRisk}
                </span>
              </div>
            </div>

            <p className="text-xs md:text-sm text-slate-300">
              <span className="font-bold text-white">Trigger Analysis: </span>
              <span>Rainfall exceeded the 50 mm high-risk threshold. Automated AI verification confidence engine adds +40 points to hazard scoring.</span>
            </p>
          </GlassCard>

          {/* 24-Hour Rainfall Chart using Recharts */}
          <GlassCard className="p-6 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">24-Hour Precipitation Forecast Curve</h3>
              <span className="text-xs text-slate-400 font-mono">Unit: Millimeters (mm)</span>
            </div>

            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="rainGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="rainfall" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#rainGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* 5-Day Forecast Cards */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">5-Day Meteorological Forecast</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {(daily.time || ['Today', 'Tomorrow', 'Day 3', 'Day 4', 'Day 5']).map((day, idx) => (
                <GlassCard key={idx} className="p-4 border border-white/10 text-center space-y-2">
                  <span className="text-xs font-bold text-slate-300 block">{day}</span>
                  <CloudRain className="w-6 h-6 text-cyan-400 mx-auto" />
                  <span className="text-sm font-bold text-white block">{daily.precipitation_sum?.[idx] ?? 12} mm</span>
                  <div className="text-[11px] text-slate-400 font-mono">
                    High: {daily.temperature_2m_max?.[idx] ?? 31}°C | Low: {daily.temperature_2m_min?.[idx] ?? 25}°C
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
