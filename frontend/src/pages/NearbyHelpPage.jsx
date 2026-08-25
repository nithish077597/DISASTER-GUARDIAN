import { useState } from 'react';
import { Shield, Navigation, Phone, MapPin, Building2, Flame, HeartPulse, Radio } from 'lucide-react';
import { safeRouteService } from '../services/safeRouteService';

const NEARBY_FACILITIES = [
  { id: 'h1', type: 'HOSPITAL', name: 'Coimbatore District General Hospital', distance: '1.8 km', phone: '0422-2300000', status: 'OPEN', lat: 28.625, lng: 77.215, icon: HeartPulse, color: 'text-red-400' },
  { id: 'h2', type: 'HOSPITAL', name: 'Sulur Apex Trauma Center', distance: '3.2 km', phone: '0422-2400000', status: 'OPEN', lat: 28.630, lng: 77.220, icon: HeartPulse, color: 'text-red-400' },
  { id: 'f1', type: 'FIRE', name: 'Central Fire Station Sector 4', distance: '2.1 km', phone: '101', status: 'ACTIVE', lat: 28.628, lng: 77.218, icon: Flame, color: 'text-rose-400' },
  { id: 'p1', type: 'POLICE', name: 'Sulur Police Station', distance: '1.4 km', phone: '100', status: 'ACTIVE', lat: 28.619, lng: 77.210, icon: Building2, color: 'text-blue-400' },
  { id: 's1', type: 'SHELTER', name: 'Central Relief Camp', distance: '2.4 km', phone: '1078', status: 'OPEN', capacity: '120/500', lat: 28.630, lng: 77.230, icon: Shield, color: 'text-emerald-400' },
];

export default function NearbyHelpPage() {
  const [filter, setFilter] = useState('ALL');
  const items = filter === 'ALL' ? NEARBY_FACILITIES : NEARBY_FACILITIES.filter((f) => f.type === filter);

  const handleGetRoute = (lat, lng) => {
    safeRouteService.openSafeNavigation(28.618, 77.208, lat, lng);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-white select-none py-4 font-sans pb-24 md:pb-8 px-4">
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div>
          <h1 className="text-xl font-extrabold text-white uppercase tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-cyan-400" />
            <span>NEARBY EMERGENCY SERVICES & HELP DIRECTORY</span>
          </h1>
          <p className="text-xs text-slate-400">Verified local hospitals, fire stations, police stations, and relief camps</p>
        </div>
        <span className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-300 font-mono font-bold text-xs">
          ???? 5 STATIONS NEARBY
        </span>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {['ALL', 'HOSPITAL', 'FIRE', 'POLICE', 'SHELTER'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
              filter === cat
                ? 'bg-cyan-600 text-white shadow-lg'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Facilities Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.id} className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 shadow-xl flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className={`flex items-center gap-1.5 text-xs font-extrabold uppercase ${item.color}`}>
                    <Icon className="w-4 h-4" />
                    <span>{item.type}</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-600 text-[10px] font-mono font-bold">
                    {item.status}
                  </span>
                </div>
                <h3 className="font-extrabold text-base text-white">{item.name}</h3>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Distance: <strong className="text-slate-200">{item.distance}</strong></span>
                  {item.capacity && <span>??? Capacity: <strong className="text-emerald-400">{item.capacity}</strong></span>}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                <a
                  href={`tel:${item.phone}`}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase border border-slate-700 flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-cyan-400" />
                  <span>CALL {item.phone}</span>
                </a>
                <button
                  onClick={() => handleGetRoute(item.lat, item.lng)}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>GET DIRECTIONS</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
