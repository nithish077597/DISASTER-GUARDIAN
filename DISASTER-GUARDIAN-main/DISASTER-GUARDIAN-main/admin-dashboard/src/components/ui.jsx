import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { getSeverityInfo } from '../utils/helpers';

export const GlassCard = ({ children, className = '', animate = true, ...props }) =>
  animate ? (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: 'easeOut' }} className={`glass-card bg-gradient-to-b from-white/[0.06] to-white/[0.02] ${className}`} {...props}>
      {children}
    </motion.div>
  ) : (
    <div className={`glass-card bg-gradient-to-b from-white/[0.06] to-white/[0.02] ${className}`} {...props}>{children}</div>
  );

export const Button = ({ children, onClick, variant = 'primary', size = 'md', icon: Icon, disabled, loading, className = '', ...props }) => {
  const base = 'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/40 focus:ring-cyan-400',
    secondary: 'bg-white/10 hover:bg-white/15 text-slate-100 border border-white/20 focus:ring-white/30',
    danger: 'bg-red-500 hover:bg-red-400 text-white shadow-lg shadow-red-500/30 hover:shadow-red-500/40 focus:ring-red-400',
    ghost: 'hover:bg-white/5 text-slate-300 hover:text-white focus:ring-white/20',
    success: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 focus:ring-emerald-400',
  };
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' };
  return (
    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onClick} disabled={disabled || loading} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {loading ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : Icon ? <Icon className="w-4 h-4" /> : null}
      {children}
    </motion.button>
  );
};

export const RiskBadge = ({ severity, dot = true, size = 'md' }) => {
  const info = getSeverityInfo(severity);
  const sizes = { sm: 'px-1.5 py-0.5 text-xs', md: 'px-2.5 py-0.75 text-xs', lg: 'px-3 py-1 text-sm' };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizes[size]} text-white`} style={{ backgroundColor: `${info.color}20`, color: info.color }}>
      {dot && <span className={`w-2 h-2 rounded-full ${severity === 'CRITICAL' ? 'pulse-marker' : ''}`} style={{ backgroundColor: info.color }} />}
      {info.label}
    </span>
  );
};

export const StatusIndicator = ({ operational, size = 'md' }) => {
  const sizes = { sm: 'w-2.5 h-2.5', md: 'w-3.5 h-3.5', lg: 'w-5 h-5' };
  return (
    <div className={`relative flex items-center justify-center rounded-full ${sizes[size]}`}>
      <span className={`absolute inline-flex rounded-full animate-ping ${sizes[size]}`} style={{ backgroundColor: operational ? '#22c55e' : '#ef4444', opacity: 0.6 }} />
      <span className={`relative block rounded-full ${sizes[size]}`} style={{ backgroundColor: operational ? '#22c55e' : '#ef4444' }} />
    </div>
  );
};

export const AnimatedCounter = ({ value, duration = 1.5, suffix = '', prefix = '', className = '' }) => {
  return (
    <motion.span className={`inline-block ${className}`} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      {prefix}
      <motion.span key={value} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration }}>
        {value}
      </motion.span>
      {suffix}
    </motion.span>
  );
};

export const Loader = ({ text = 'Loading data…' }) => (
  <div className="flex flex-col items-center justify-center gap-4 py-12 text-slate-400">
    <div className="relative">
      <motion.div className="w-10 h-10 border-3 border-cyan-500/30 border-t-cyan-400 rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }} />
      <div className="absolute inset-0 w-10 h-10 border-3 border-blue-500/20 border-b-blue-400 rounded-full animate-ping" />
    </div>
    <p className="text-sm">{text}</p>
  </div>
);

export const EmptyState = ({ icon: Icon, title, description }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-14 text-center text-slate-400">
    {Icon && <Icon className="w-12 h-12 opacity-50" />}
    <h3 className="text-lg font-medium text-slate-300">{title}</h3>
    {description && <p className="text-sm max-w-md">{description}</p>}
  </div>
);

export const ErrorState = ({ error, onRetry }) => (
  <div className="flex flex-col items-center justify-center gap-4 py-14 text-center">
    <div className="p-4 bg-red-500/10 rounded-full border border-red-500/30">
      <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M9 5a9 9 0 11-6.36 2.64A9 9 0 0112 5z" /></svg>
    </div>
    <div>
      <h3 className="text-lg font-medium text-slate-200">Connection Issue</h3>
      <p className="mt-1 text-sm text-slate-400 max-w-md">Unable to connect to the Guardian server. {error || 'The server may be offline.'}</p>
      {onRetry && <Button variant="secondary" size="sm" onClick={onRetry} className="mt-4">Retry</Button>}
    </div>
  </div>
);

export const StatCard = ({ icon: Icon, label, value, trend, color = 'cyan', loading }) => {
  const colorMap = { cyan: 'text-cyan-400', emerald: 'text-emerald-400', amber: 'text-amber-400', red: 'text-red-400', purple: 'text-purple-400', blue: 'text-blue-400' };
  return (
    <GlassCard className="p-5 border border-white/5">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-lg bg-white/5">{Icon && <Icon className={`w-5 h-5 ${colorMap[color]}`} />}</div>
        <span className="text-xs text-slate-400 uppercase tracking-wider">{label}</span>
      </div>
      {loading ? <div className="h-8 w-20 bg-white/5 rounded animate-pulse" /> : <AnimatedCounter value={value} className={`text-3xl font-bold ${colorMap[color]}`} />}
      {trend && <p className={`text-xs ${trend > 0 ? 'text-emerald-400' : 'text-red-400'} mt-1`}>{trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%</p>}
    </GlassCard>
  );
};

export const Modal = ({ isOpen, onClose, title, children, size = 'lg', dark = true }) => {
  if (!isOpen) return null;
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div className="absolute inset-0 bg-black/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div layoutId="modal" className={`relative ${sizes[size]} w-full z-10`} initial={{ opacity: 0, scale: 0.92, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 12 }} transition={{ duration: 0.25, ease: 'easeOut' }}>
        <div className="glass-card bg-slate-900 border border-white/10 rounded-xl">
          <div className="flex items-center justify-between p-5 border-b border-white/10">
            <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-slate-200"><X className="w-4 h-4" /></button>
          </div>
          <div className="p-5 max-h-[70vh] overflow-y-auto">{children}</div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export const Skeleton = ({ className = '' }) => <div className={`relative overflow-hidden bg-white/5 rounded-xl ${className}`}><div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent animate-[shimmer_1.5s_infinite]" /></div>;
