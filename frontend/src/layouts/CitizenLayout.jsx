import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Map, Megaphone, Activity, Bell, Shield, Navigation, Radio, Settings, Users, ShieldAlert, LogOut
} from 'lucide-react';
import { authService } from '../services/authService';

export default function CitizenLayout() {
  const location = useLocation();
  const currentUser = authService.getCurrentUser();

  const adminNav = [
    { label: 'Overview', icon: LayoutDashboard, path: '/admin' },
    { label: 'Live Incidents', icon: Map, path: '/admin/incidents' },
    { label: 'Report Verification', icon: Megaphone, path: '/admin/reports' },
    { label: 'Risk Analysis', icon: Activity, path: '/admin/risk' },
    { label: 'Alert Management', icon: Bell, path: '/admin/alerts' },
    { label: 'Shelters', icon: Shield, path: '/admin/shelters' },
    { label: 'Roads', icon: Navigation, path: '/admin/roads' },
    { label: 'People at Risk', icon: Users, path: '/admin/people' },
    { label: 'System / Gateway Status', icon: Radio, path: '/admin/gateways' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans selection:bg-red-600/30 selection:text-red-200 select-none">
      {/* Admin Desktop Left Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex-col hidden md:flex shrink-0">
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center text-white font-black shadow-lg shadow-red-600/30">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm text-white tracking-tight uppercase">AI GUARDIAN</h1>
            <p className="text-[10px] text-cyan-400 font-mono font-bold">CONTROL CENTER</p>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
          {adminNav.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="truncate">
            <span className="font-bold text-white block truncate">{currentUser?.name || 'NDRF Command'}</span>
            <span className="text-[10px] text-emerald-400 font-mono">OFFICIAL AUTHORITY</span>
          </div>
          <Link to="/login" onClick={() => authService.logout()} className="p-2 text-slate-400 hover:text-red-400" title="Logout">
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
