import { useState } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';

const DISASTER_COLORS = {
  Landslide: '#ef4444', // Red
  Flood: '#38bdf8',     // Cyan/Blue
  Earthquake: '#f59e0b',// Amber/Orange
  'Heavy Rain': '#a855f7', // Purple
  Other: '#10b981',    // Emerald
};

const DEFAULT_PIE_DATA = [
  { name: 'Landslide', value: 5, percentage: '40%' },
  { name: 'Flood', value: 3, percentage: '25%' },
  { name: 'Earthquake', value: 2, percentage: '20%' },
  { name: 'Heavy Rain', value: 2, percentage: '15%' },
];

const TREND_HOURLY = [
  { time: '9:00', count: 4 },
  { time: '9:10', count: 12 },
  { time: '9:20', count: 14 },
  { time: '9:30', count: 18 },
  { time: '9:40', count: 14 },
  { time: '9:50', count: 32 },
  { time: '10:00', count: 24 },
  { time: '10:10', count: 20 },
  { time: '10:20', count: 28 },
];

const TREND_DAILY = [
  { time: 'Aug 16', count: 3 },
  { time: 'Aug 17', count: 4 },
  { time: 'Aug 18', count: 6 },
  { time: 'Aug 19', count: 5 },
  { time: 'Aug 20', count: 7 },
  { time: 'Aug 21', count: 4 },
  { time: 'Aug 22', count: 6 },
];

const TREND_WEEKLY = [
  { time: 'Week 1', count: 18 },
  { time: 'Week 2', count: 24 },
  { time: 'Week 3', count: 38 },
  { time: 'Week 4', count: 29 },
];

export function DisasterDonutChart({ data }) {
  const chartData = data && data.length > 0 ? data : DEFAULT_PIE_DATA;
  const totalReports = chartData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-6 h-full py-2">
      {/* Donut Chart Container with Center Label */}
      <div className="relative w-48 h-48 shrink-0 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={82}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={DISASTER_COLORS[entry.name] || '#3b82f6'}
                  style={{ filter: 'drop-shadow(0px 0px 6px ' + (DISASTER_COLORS[entry.name] || '#3b82f6') + '80)' }}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Inner Text Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-black text-white tracking-tight">{totalReports}</span>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Reports</span>
        </div>
      </div>

      {/* Legend Item List */}
      <div className="flex-1 space-y-3 w-full">
        {chartData.map((entry) => {
          const color = DISASTER_COLORS[entry.name] || '#3b82f6';
          const pct = entry.percentage || Math.round((entry.value / Math.max(totalReports, 1)) * 100) + '%';
          return (
            <div key={entry.name} className="flex items-center justify-between text-xs font-medium bg-slate-900/60 px-3 py-2 rounded-xl border border-slate-800/60">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-md shrink-0" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }} />
                <span className="text-slate-200">{entry.name}</span>
              </div>
              <span className="text-slate-300 font-semibold">{pct} ({entry.value})</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function TrendAreaChart() {
  const [filter, setFilter] = useState('Hour');

  const activeData = filter === 'Hour' ? TREND_HOURLY : filter === 'Day' ? TREND_DAILY : TREND_WEEKLY;

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Time Filter Tabs */}
      <div className="flex justify-end gap-1">
        {['Hour', 'Day', 'Week'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              filter === tab
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Area Line Chart */}
      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={activeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="cyanGradientFrontend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#3b82f6"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#cyanGradientFrontend)"
              dot={{ r: 4, fill: '#3b82f6', stroke: '#ffffff', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: '#609dfa', stroke: '#ffffff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0a1124] border border-cyan-500/40 rounded-xl px-3 py-2 shadow-2xl backdrop-blur-md">
      <p className="text-xs font-mono text-cyan-400 font-semibold">{label}</p>
      <p className="text-sm font-bold text-white">{payload[0].value} Incident Reports</p>
    </div>
  );
}
