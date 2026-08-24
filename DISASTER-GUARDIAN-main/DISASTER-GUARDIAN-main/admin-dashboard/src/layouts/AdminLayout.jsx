import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Map, ClipboardList, ShieldCheck, Home, BellRing, Router, BarChart3, Menu,
} from 'lucide-react';
import { Button, StatusIndicator } from '../components/ui';
import { isSystemOperational } from '../api';
import { useEffect, useState } from 'react';

const nav = [
  { name: 'Overview', to: '/', icon: LayoutDashboard },
  { name: 'Live Map', to: '/map', icon: Map },
  { name: 'Live Reports', to: '/reports', icon: ClipboardList },
  { name: 'Verification', to: '/verification', icon: ShieldCheck },
  { name: 'Safe Zones', to: '/safe-zones', icon: Home },
  { name: 'Alerts', to: '/alerts', icon: BellRing },
  { name: 'Gateway', to: '/gateway', icon: Router },
  { name: 'Analytics', to: '/analytics', icon: BarChart3 },
];

export default function AdminLayout() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [operational, setOperational] = useState(true);
  useEffect(() => {
    isSystemOperational().then(setOperational).catch(() => setOperational(false));
    const id = setInterval(() => isSystemOperational().then(setOperational).catch(() => setOperational(false)), 15000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
      <motion.nav initial={{ x: -260 }} animate={{ x: 0 }} transition={{ duration: 0.5, ease: 'easeOut' }} className={`glass-sidebar flex flex-col py-5 z-40 ${collapsed ? 'w-16' : 'w-64'}`}>
        <div className="flex items-center gap-2.5 px-4 mb-6">
          <ShieldCheck className={`w-7 h-7 text-cyan-400 shrink-0`} />
          {!collapsed && <span className="font-bold text-xl text-cyan-300">Admin Panel</span>}
        </div>
        <div className="flex-1 space-y-1 px-2">
          {nav.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-300 hover:bg-white/5 hover:text-slate-100'
                } ${collapsed ? 'justify-center' : ''}`
              }
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </NavLink>
          ))}
        </div>
        <div className={`px-4 py-3 border-t border-white/10 flex items-center gap-2 ${collapsed ? 'justify-center' : ''}`}>
          <StatusIndicator operational={operational} size="sm" />
          {!collapsed && <span className="text-xs text-slate-400">System {operational ? 'Online' : 'Offline'}</span>}
        </div>
        <div className={`px-4 py-3 ${collapsed ? 'flex justify-center' : ''}`}>
          <Button variant="ghost" size="sm" icon={Menu} onClick={() => setCollapsed(!collapsed)}>
            {!collapsed && 'Collapse'}
          </Button>
        </div>
      </motion.nav>

      <main className="flex-1 overflow-y-auto pt-6 pr-6 pb-6 pl-6">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <Outlet />
        </motion.main>
      </main>
    </div>
  );
}
