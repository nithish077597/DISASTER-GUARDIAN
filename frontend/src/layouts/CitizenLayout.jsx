import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Map, Send, Shield, Bell, LogIn, Menu, X, Navigation, User, AlertTriangle, LogOut, CheckCircle2,
} from 'lucide-react';
import { useSystemStatus } from '../hooks';
import { useUser } from '../context/UserContext';
import { StatusIndicator, Button } from '../components/ui';

const navItems = [
  { name: 'Home', to: '/', icon: Home },
  { name: 'Dashboard', to: '/dashboard', icon: Shield },
  { name: 'Live Map', to: '/map', icon: Map },
  { name: 'Report Emergency', to: '/report', icon: Send },
  { name: 'Evacuation', to: '/evacuation', icon: Navigation },
  { name: 'Alerts', to: '/alerts', icon: Bell },
];

export default function CitizenLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      <Header navigate={navigate} />
      <motion.main
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="max-w-7xl w-full mx-auto pt-28 pb-16 px-4 md:px-6 flex-1"
      >
        <Outlet />
      </motion.main>
      <Footer />
    </div>
  );
}

function Header({ navigate }) {
  const { data: status, loading } = useSystemStatus();
  const { user, isLoggedIn, logoutUser } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const operational = status?.status === 'ok';

  return (
    <motion.header
      initial={{ y: -60 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="fixed top-3 inset-x-0 z-50 px-4"
    >
      <div className="max-w-7xl mx-auto glass-card flex items-center justify-between px-4 py-2.5 md:px-6 border border-white/10 bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-black/40">
        {/* Brand Logo */}
        <div
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-cyan-300">
              Disaster Guardian
            </span>
            <span className="text-[10px] text-cyan-400 font-semibold tracking-wider uppercase -mt-1">
              AI Emergency Network
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 text-sm">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `px-3 py-2 rounded-xl transition-all flex items-center gap-2 font-medium ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-inner'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Right side user status & actions */}
        <div className="flex items-center gap-3">
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300">
            <StatusIndicator operational={!loading && operational} />
            <span>{loading ? 'Connecting...' : operational ? 'AI Engine Online' : 'Offline'}</span>
          </div>

          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 transition-all text-cyan-300 text-xs font-semibold"
                title="View/Edit Live Profile"
              >
                <div className="relative">
                  <User className="w-4 h-4 text-cyan-400" />
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full" />
                </div>
                <span className="max-w-[100px] truncate">{user.name}</span>
              </button>
            </div>
          ) : (
            <Button
              variant="primary"
              size="sm"
              icon={LogIn}
              onClick={() => navigate('/login')}
              className="shadow-lg shadow-cyan-500/20"
            >
              Citizen Login
            </Button>
          )}

          {/* Mobile menu toggle button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden mt-2 p-4 glass-card bg-slate-900/95 border border-white/10 rounded-2xl shadow-2xl space-y-2 backdrop-blur-2xl"
          >
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                <item.icon className="w-5 h-5 text-cyan-400" />
                <span>{item.name}</span>
              </NavLink>
            ))}

            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              {isLoggedIn ? (
                <button
                  onClick={() => {
                    logoutUser();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 text-xs font-semibold text-rose-400 hover:text-rose-300 p-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout ({user.name})</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    navigate('/login');
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 p-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login / Profile</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5 py-8 text-center text-slate-500 text-xs space-y-2 bg-slate-950/80">
      <div className="flex items-center justify-center gap-2 text-slate-400 font-medium">
        <Shield className="w-4 h-4 text-cyan-400" />
        <span>Disaster Guardian Platform</span>
      </div>
      <p>AI-Powered Emergency Response, Danger Geofencing & Shelter Dispatch</p>
    </footer>
  );
}
