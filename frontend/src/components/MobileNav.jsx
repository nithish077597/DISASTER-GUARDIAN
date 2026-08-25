import { Home, Map, Megaphone, Bell, ShieldAlert } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function MobileNav({ onOpenReport, onOpenSos }) {
  const location = useLocation();

  const navItems = [
    { label: 'HOME', path: '/citizen', icon: Home },
    { label: 'MAP', path: '/map', icon: Map },
    { label: 'REPORT', path: '/report', icon: Megaphone, isAction: true },
    { label: 'ALERTS', path: '/alerts', icon: Bell },
    { label: 'EMERGENCY', path: '/emergency', icon: ShieldAlert, isSos: true },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[9990] bg-slate-950/95 border-t border-slate-800 p-2 backdrop-blur-md">
      <div className="max-w-md mx-auto grid grid-cols-5 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          if (item.isSos) {
            return (
              <button
                key={item.label}
                onClick={onOpenSos}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-red-600 hover:bg-red-500 text-white shadow-lg animate-pulse"
              >
                <Icon className="w-5 h-5" />
                <span className="text-[9px] font-black tracking-wider uppercase mt-0.5">{item.label}</span>
              </button>
            );
          }

          if (item.isAction) {
            return (
              <button
                key={item.label}
                onClick={onOpenReport}
                className="flex flex-col items-center justify-center p-2 rounded-xl text-slate-400 hover:text-white transition-all"
              >
                <Icon className="w-5 h-5 text-cyan-400" />
                <span className="text-[9px] font-bold tracking-wider uppercase mt-0.5">{item.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
                isActive ? 'bg-slate-900 text-red-400 font-extrabold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[9px] font-bold tracking-wider uppercase mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
