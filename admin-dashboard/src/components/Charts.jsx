import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid } from 'recharts';
import { Skeleton } from '../components/ui';

const palette = ['#38bdf8', '#f59e0b', '#ef4444', '#8b5cf6', '#22c55e', '#f97316'];

export function ReportsBarChart({ data, loading }) {
  if (loading) return <div className="h-64"><Skeleton className="h-full w-full" /></div>;
  if (!data || data.length === 0) return <EmptyBar />;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 0, left: -15, bottom: 0 }}>
          <XAxis dataKey="type" axisLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <YAxis hide />
          <Tooltip content={<ChartTooltip />} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="#06b6d4">
            {data.map((_, i) => <Cell key={`c-${i}`} fill={palette[i % palette.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

export function RiskPieChart({ data, loading }) {
  if (loading) return <div className="h-56"><Skeleton className="h-full w-full rounded-full" /></div>;
  const total = (data || []).reduce((s, d) => s + d.value, 0);
  if (!data || data.length === 0 || total === 0) return <EmptyPie />;
  const cells = data.map((_, i) => <Cell key={`cell-${i}`} fill={palette[i % palette.length]} />);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" cx="50%" cy="48%" innerRadius={55} outerRadius={85} paddingAngle={2} />
          {cells}
          <Legend iconSize={10} layout="horizontal" verticalAlign="bottom" wrapperStyle={{ fontSize: 11, color: '#cbd5e1' }} />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

export function AlertsLineChart({ data, loading }) {
  if (loading) return <div className="h-56"><Skeleton className="h-full w-full" /></div>;
  if (!data || data.length === 0) return <EmptyBar />;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 0, left: -15, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="day" axisLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <YAxis axisLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <Tooltip content={<ChartTooltip />} />
          <Line type="monotone" dataKey="alerts" stroke="#06b6d4" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

function EmptyBar() {
  return <div className="h-64 flex items-center justify-center text-slate-500 text-sm">No data to display</div>;
}
function EmptyPie() {
  return <div className="h-56 flex items-center justify-center text-slate-500 text-sm">No data to display</div>;
}
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-white/20 rounded-lg px-3 py-2 shadow-lg">
      <p className="text-xs text-slate-300">{label}</p>
      <p className="text-sm font-medium text-white">{payload[0].value}</p>
    </div>
  );
}
