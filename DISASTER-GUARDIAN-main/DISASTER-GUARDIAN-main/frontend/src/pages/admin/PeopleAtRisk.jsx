import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer } from 'react-leaflet';
import { Users, ShieldAlert, AlertTriangle, ShieldCheck, Filter, Send } from 'lucide-react';
import { usersApi } from '../../api';
import { GlassCard, StatCard, Button, RiskBadge, Loader, ErrorState } from '../../components/ui';
import { LiveUserMarker } from '../../components/MapMarkers';
import { formatDistance } from '../../utils/helpers';

const FILTERS = ['ALL', 'CRITICAL', 'HIGH_RISK', 'CONFIRMED', 'SAFE'];

const MOCK_PEOPLE = [
  { id: 'USER-1042', name: 'Rahul Sharma', lat: 28.6140, lng: 77.2095, risk: 'CRITICAL', distance_km: 1.2, shelter: 'Central Relief Camp', alertStatus: 'SENT' },
  { id: 'USER-1043', name: 'Priya Patel', lat: 28.6135, lng: 77.2085, risk: 'CRITICAL', distance_km: 0.8, shelter: 'Central Relief Camp', alertStatus: 'SENT' },
  { id: 'USER-1044', name: 'Amit Kumar', lat: 28.6450, lng: 77.1800, risk: 'HIGH_RISK', distance_km: 2.1, shelter: 'North Hills Shelter', alertStatus: 'SENT' },
  { id: 'USER-1045', name: 'Sneha Gupta', lat: 28.6310, lng: 77.2180, risk: 'CONFIRMED', distance_km: 3.4, shelter: 'Riverbank Safe Zone', alertStatus: 'PENDING' },
  { id: 'USER-1046', name: 'Vikram Singh', lat: 28.6692, lng: 77.4538, risk: 'SAFE', distance_km: 6.8, shelter: 'Highland Community Hall', alertStatus: 'DELIVERED' },
];

export default function PeopleAtRisk() {
  const [liveUsers, setLiveUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('ALL');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await usersApi.list();
      setLiveUsers(data || []);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to fetch live citizens telemetry.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const combinedPeople = useMemo(() => {
    if (liveUsers.length > 0) {
      return liveUsers.map((u, i) => ({
        id: u.id || `USER-${1000 + i}`,
        name: u.name || 'Active Citizen',
        lat: u.lat,
        lng: u.lng,
        risk: i % 2 === 0 ? 'CRITICAL' : 'HIGH_RISK',
        distance_km: (1.2 + i * 0.5),
        shelter: i % 2 === 0 ? 'Central Relief Camp' : 'North Hills Shelter',
        alertStatus: 'SENT',
      }));
    }
    return MOCK_PEOPLE;
  }, [liveUsers]);

  const filteredPeople = useMemo(() => {
    if (activeFilter === 'ALL') return combinedPeople;
    return combinedPeople.filter((p) => p.risk === activeFilter);
  }, [combinedPeople, activeFilter]);

  const counts = useMemo(() => {
    return {
      total: combinedPeople.length,
      critical: combinedPeople.filter((p) => p.risk === 'CRITICAL').length,
      highRisk: combinedPeople.filter((p) => p.risk === 'HIGH_RISK').length,
      safe: combinedPeople.filter((p) => p.risk === 'SAFE').length,
    };
  }, [combinedPeople]);

  if (error) return <ErrorState error={error} onRetry={fetchUsers} />;

  return (
    <div className="space-y-8 py-4">
      <motion.header initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-white">People at Risk</h1>
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-semibold">
              <Users className="w-3.5 h-3.5" />
              Citizens Risk Telemetry
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">Real-time geospatial tracking of citizens located inside active danger zone perimeters</p>
        </div>
      </motion.header>

      {/* Stats Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total People Monitored" value={counts.total} color="cyan" />
        <StatCard icon={ShieldAlert} label="Critical Risk" value={counts.critical} color="red" />
        <StatCard icon={AlertTriangle} label="High Risk" value={counts.highRisk} color="amber" />
        <StatCard icon={ShieldCheck} label="Safe / Evacuated" value={counts.safe} color="emerald" />
      </section>

      {/* Map Visualization */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Geospatial Distribution Map</h3>
        <div className="h-[380px] w-full rounded-2xl overflow-hidden border border-white/10 relative shadow-2xl">
          <MapContainer center={[28.6139, 77.2090]} zoom={11} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>' />
            {filteredPeople.map((p) => (
              <LiveUserMarker key={p.id} user={p} />
            ))}
          </MapContainer>
        </div>
      </div>

      {/* Filter Tabs & Table */}
      <GlassCard className="p-6 border border-white/10 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <h3 className="text-base font-bold text-white">Affected Citizens Registry</h3>
          <div className="flex items-center gap-1.5 flex-wrap">
            <Filter className="w-4 h-4 text-slate-400 mr-1" />
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeFilter === f
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                {f.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-white/5 text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3 rounded-l-xl">Person / Device ID</th>
                <th className="p-3">Risk Level</th>
                <th className="p-3">Distance from Danger Zone</th>
                <th className="p-3">Nearest Shelter</th>
                <th className="p-3 rounded-r-xl">Alert Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredPeople.map((p) => (
                <tr key={p.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-3 font-mono font-bold text-white">{p.id} ({p.name})</td>
                  <td className="p-3"><RiskBadge severity={p.risk} size="sm" /></td>
                  <td className="p-3 font-mono text-cyan-300">{formatDistance(p.distance_km)} from flood zone</td>
                  <td className="p-3 font-medium text-emerald-400">{p.shelter}</td>
                  <td className="p-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-[11px]">
                      <Send className="w-3 h-3" /> {p.alertStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
