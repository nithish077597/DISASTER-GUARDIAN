import { NavLink } from 'react-router-dom';
import {
  ShieldAlert, LayoutDashboard, Map, Activity, ClipboardList, Navigation, Bell, Radio, Home, Settings
} from 'lucide-react';
import { useRealtime } from '../context/RealtimeContext';
import { authService } from '../services/authService';

const adminMenuItems = [
  { name: 'Overview', to: '/admin', icon: LayoutDashboard },
  { name: 'Live Map', to: '/map', icon: Map },
  { name: 'Risk Monitoring', to: '/risk', icon: Activity },
  { name: 'Citizen Reports', to: '/reports', icon: ClipboardList },
  { name: 'Alerts', to: '/alerts', icon: Bell },
  { name: 'Shelters', to: '/shelters', icon: Home },
  { name: 'Road Status', to: '/roads', icon: Navigation },
  { name: 'Emergency Gateway', to: '/gateway', icon: Radio },
  { name: 'Settings', to: '/settings', icon: Settings },
];

export default function Sidebar() {
  const { connectionState, newReportsCount } = useRealtime();
  const currentUser = authService.getCurrentUser();

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-slate-950 border-r border-slate-800 text-slate-200 shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-600/30">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-black text-sm text-white tracking-tight leading-none uppercase">
              DISASTER MANAGEMENT AI
            </h1>
            <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest mt-1">
              Emergency Operations Center
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {adminMenuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.to}
            end={item.to === '/admin' || item.to === '/'}
            className={({ isActive }) =>
              `flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all ${
                isActive
                  ? 'bg-red-600 text-white font-bold shadow-md shadow-red-600/20'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </div>
            {item.name === 'Citizen Reports' && newReportsCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-red-500 text-[10px] font-extrabold text-white">
                {newReportsCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer System Status */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/60 space-y-2">
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
          <span className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${connectionState === 'LIVE' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="font-bold text-slate-200">
              {connectionState === 'LIVE' ? '??? All systems operational' : '??? Limited Offline Mode'}
            </span>
          </span>
        </div>
      </div>
    </aside>
  );
}
