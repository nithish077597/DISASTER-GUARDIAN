import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Map, ClipboardList, ShieldCheck, MapPin, Bell, Wifi, BarChart3, ChevronLeft, ChevronRight, Shield
} from 'lucide-react';
import { isSystemOperational } from '../api';

const navItems = [
  { name: 'Overview', to: '/admin', icon: LayoutDashboard },
  { name: 'Live Map', to: '/admin/map', icon: Map },
  { name: 'Live Reports', to: '/admin/reports', icon: ClipboardList },
  { name: 'Verification', to: '/admin/verification', icon: ShieldCheck },
  { name: 'Safe Zones', to: '/admin/safe-zones', icon: MapPin },
  { name: 'Alerts', to: '/admin/alerts', icon: Bell },
  { name: 'Gateway', to: '/admin/gateway', icon: Wifi },
  { name: 'Analytics', to: '/admin/analytics', icon: BarChart3 },
];

export default function AdminLayout() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [operational, setOperational] = useState(true);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    isSystemOperational().then(setOperational).catch(() => setOperational(false));
    const interval = setInterval(() => {
      isSystemOperational().then(setOperational).catch(() => setOperational(false));
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
        ' | ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      setCurrentTime(formatted);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#050b18] text-slate-100 font-sans antialiased selection:bg-cyan-500 selection:text-black">
      {/* Left Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 80 : 256 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed top-0 bottom-0 left-0 z-40 bg-[#040914] border-r border-slate-800/80 flex flex-col justify-between"
      >
        <div>
          {/* Logo Brand */}
          <div className="h-20 flex items-center px-5 border-b border-slate-800/50 gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-teal-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
              <Shield className="w-6 h-6 text-slate-950 font-bold" />
            </div>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-extrabold text-lg text-white tracking-wide">
                Admin Panel
              </motion.span>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5 mt-2">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.to}
                end={item.to === '/admin'}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#0d2338] text-cyan-300 border-l-4 border-cyan-400 font-semibold shadow-lg shadow-cyan-500/10'
                      : 'text-slate-400 hover:bg-slate-900/80 hover:text-slate-200'
                  } ${collapsed ? 'justify-center' : ''}`
                }
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-800/50 space-y-3">
          <div className={`flex items-center gap-2.5 px-2 ${collapsed ? 'justify-center' : ''}`}>
            <span className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${operational ? 'bg-emerald-400' : 'bg-rose-400'}`} />
              <span className={`relative inline-flex rounded-full h-3 w-3 ${operational ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            </span>
            {!collapsed && (
              <span className="text-xs font-semibold text-slate-300">
                System {operational ? 'Online' : 'Offline'}
              </span>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition-colors justify-center"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /> Collapse</>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 ${collapsed ? 'ml-[80px]' : 'ml-[256px]'}`}>
        {/* Top Header Bar */}
        <header className="h-20 px-8 flex items-center justify-between border-b border-slate-800/50 bg-[#050b18]/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-500/20 to-cyan-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-lg shadow-rose-500/10">
              <Shield className="w-6 h-6 text-rose-400" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">Command Overview</h1>
              <p className="text-xs text-slate-400">Real-time situational summary across all monitored zones</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Live Data
            </div>

            <div className="text-xs font-mono text-slate-300 font-semibold bg-slate-900/90 px-3.5 py-2 rounded-xl border border-slate-800">
              {currentTime || 'Aug 24, 2026 | 10:24 PM'}
            </div>

            <button className="relative p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
            </button>

            <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                alt="Admin Avatar"
                className="w-9 h-9 rounded-full object-cover border-2 border-cyan-400/50 shadow-lg shadow-cyan-500/20"
              />
            </div>
          </div>
        </header>

        {/* Page View */}
        <main className="p-8">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
