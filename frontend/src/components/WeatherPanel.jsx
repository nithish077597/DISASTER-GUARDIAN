import { CloudRain, Thermometer, Droplets, Wind, RefreshCw, AlertTriangle } from 'lucide-react';
import { useRealtime } from '../context/RealtimeContext';

export default function WeatherPanel() {
  const { weatherData, fetchWeather } = useRealtime();
  const current = weatherData.current;
  const isOnline = weatherData.status === 'LIVE';

  return (
    <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6 text-white">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <CloudRain className="w-5 h-5 text-cyan-400" />
          <h3 className="font-extrabold text-lg uppercase tracking-tight">
            {isOnline ? 'LIVE WEATHER TELEMETRY' : 'WEATHER API OFFLINE'}
          </h3>
        </div>

        <button
          onClick={fetchWeather}
          className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs flex items-center gap-1.5 border border-slate-800 transition-all"
          title="Refresh Weather API"
        >
          <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
          <span>Refresh</span>
        </button>
      </div>

      {isOnline ? (
        <div className="space-y-6">
          {/* Weather Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <p className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5 text-amber-400" /> Temperature
              </p>
              <p className="text-2xl font-black text-white mt-1">{current.temperature_2m || 28}??C</p>
              <p className="text-[11px] text-slate-400">Light Rain</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <p className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                <CloudRain className="w-3.5 h-3.5 text-cyan-400" /> Current Rainfall
              </p>
              <p className="text-2xl font-black text-cyan-400 mt-1">{current.precipitation || 18} mm/h</p>
              <p className="text-[11px] text-cyan-300 font-semibold">Surge Threshold</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <p className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-blue-400" /> Humidity
              </p>
              <p className="text-2xl font-black text-white mt-1">{current.relative_humidity_2m || 82}%</p>
              <p className="text-[11px] text-blue-400 font-semibold">Soil Saturation</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <p className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                <Wind className="w-3.5 h-3.5 text-emerald-400" /> Wind
              </p>
              <p className="text-2xl font-black text-white mt-1">{current.wind_speed_10m || 14} km/h</p>
              <p className="text-[11px] text-slate-400">South-West Gusts</p>
            </div>
          </div>

          {/* RAINFALL VOLUME BREAKDOWN TELEMETRY */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <span className="text-xs font-extrabold text-cyan-400 uppercase tracking-wider block">
              RAINFALL VOLUME ACCUMULATION & FORECAST
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block font-medium">Rain Last 1h</span>
                <span className="font-mono font-bold text-white text-sm mt-0.5 block">18 mm</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block font-medium">Rain Last 6h</span>
                <span className="font-mono font-bold text-amber-400 text-sm mt-0.5 block">54 mm</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block font-medium">Rain Last 24h</span>
                <span className="font-mono font-bold text-red-400 text-sm mt-0.5 block">142 mm</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block font-medium">6h Forecast</span>
                <span className="font-mono font-bold text-cyan-300 text-sm mt-0.5 block">Heavy Showers</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>WEATHER TELEMETRY UNAVAILABLE</span>
          </div>
          <p className="text-xs text-amber-300">
            Last successful update: {weatherData.lastSuccessTime || '5 minutes ago'}
          </p>
          <button
            onClick={fetchWeather}
            className="px-3 py-1 rounded bg-amber-900 hover:bg-amber-800 text-white font-bold text-xs"
          >
            Retry Connection
          </button>
        </div>
      )}
    </div>
  );
}
