import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Wifi, WifiOff, Bell, AlertTriangle, LogOut } from 'lucide-react';
import { useRealtime } from '../context/RealtimeContext';
import { authService } from '../services/authService';
import AdminAlertConfirmationModal from './AdminAlertConfirmationModal';

export default function TopBar() {
  const navigate = useNavigate();
  const {
    connectionState,
    toggleSimulatedOffline,
    clock,
    newReportsCount,
    issueEmergencyAlert,
    setCriticalModalOpen,
    populationAtRisk,
  } = useRealtime();

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const currentUser = authService.getCurrentUser() || { name: 'NDRF Command' };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <header className="hidden lg:flex items-center justify-between h-16 px-6 bg-slate-950 border-b border-slate-800 text-slate-200 shrink-0 select-none">
      <AdminAlertConfirmationModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={() => {
          issueEmergencyAlert();
          setCriticalModalOpen(true);
        }}
        recipientCount={populationAtRisk.count}
      />

      {/* Left Title */}
      <div className="flex items-center gap-3">
        <h2 className="font-extrabold text-sm text-white tracking-tight uppercase">
          Emergency Operations Center
        </h2>
      </div>

      {/* Middle Telemetry */}
      <div className="flex items-center gap-4 text-xs font-mono">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-950/60 border border-red-500/40 text-red-400 font-extrabold uppercase">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span>??? LIVE</span>
        </div>

        <div className="text-slate-300 font-medium font-sans">
          24 Aug 2026
        </div>

        <div className="flex items-center gap-1 text-slate-300">
          <MapPin className="w-3.5 h-3.5 text-red-400" />
          <span>???? Sulur, Coimbatore</span>
        </div>

        <div className="text-slate-400">
          Time: <strong className="text-white">{clock}</strong>
        </div>

        {/* Network status pill */}
        <button
          onClick={toggleSimulatedOffline}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-bold uppercase transition-all ${
            connectionState === 'LIVE'
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
              : 'bg-amber-950/60 border-amber-500/40 text-amber-300'
          }`}
          title="Toggle Network Simulation"
        >
          {connectionState === 'LIVE' ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>CONNECTED</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-amber-400" />
              <span>OFFLINE</span>
            </>
          )}
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 text-xs">
        {/* Emergency Alert Dispatch Button with Confirmation Modal */}
        <button
          onClick={() => setConfirmModalOpen(true)}
          className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-extrabold uppercase tracking-wider shadow-md shadow-red-600/30 transition-all flex items-center gap-1.5"
        >
          <AlertTriangle className="w-4 h-4 text-white" />
          <span>SEND ALERT</span>
        </button>

        {/* Notification Bell */}
        <div className="relative p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
          <Bell className="w-4 h-4 text-amber-400" />
          {newReportsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[9px] font-extrabold text-white flex items-center justify-center">
              {newReportsCount}
            </span>
          )}
        </div>

        {/* Admin Profile & Logout */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 font-medium">
          <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
            AD
          </div>
          <span className="truncate max-w-[100px]">{currentUser.name || 'NDRF Command'}</span>
          <button
            onClick={handleLogout}
            className="p-1 text-slate-400 hover:text-rose-400"
            title="Logout"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
