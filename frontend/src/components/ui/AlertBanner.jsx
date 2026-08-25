import { motion } from 'framer-motion';
import SeverityBadge from './SeverityBadge';
import { getSeverityInfo } from '../../utils/helpers';

const typeStyles = {
  info: { iconBg: 'bg-cyan-500/15', iconColor: 'text-cyan-400', borderColor: 'border-cyan-500/30', titleColor: 'text-cyan-300', msgColor: 'text-cyan-200/80' },
  success: { iconBg: 'bg-emerald-500/15', iconColor: 'text-emerald-400', borderColor: 'border-emerald-500/30', titleColor: 'text-emerald-300', msgColor: 'text-emerald-200/80' },
  warning: { iconBg: 'bg-amber-500/15', iconColor: 'text-amber-400', borderColor: 'border-amber-500/30', titleColor: 'text-amber-300', msgColor: 'text-amber-200/80' },
  critical: { iconBg: 'bg-red-500/15', iconColor: 'text-red-400', borderColor: 'border-red-500/30', titleColor: 'text-red-300', msgColor: 'text-red-200/80' },
};

export default function AlertBanner({ type = 'info', title, message, onClose, action }) {
  const styles = typeStyles[type] || typeStyles.info;
  const iconMap = {
    info: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    success: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    warning: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>,
    critical: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  };

  if (type === 'critical' && onClose) {
    onClose = undefined;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      role="alert"
      aria-live="polite"
      className={`p-4 rounded-xl border ${styles.iconBg} ${styles.borderColor} ${type === 'critical' ? 'border-l-4' : ''}`}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 flex-shrink-0 ${styles.iconColor}`}>
          {iconMap[type] || iconMap.info}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-semibold ${styles.titleColor}`}>{title}</p>
          {message && <p className={`text-sm mt-0.5 ${styles.msgColor}`}>{message}</p>}
          {action && <div className="mt-2">{action}</div>}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Dismiss alert"
            className="p-1 rounded-lg hover:bg-white/5 text-slate-400 hover:text-slate-200 flex-shrink-0 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        )}
      </div>
    </motion.div>
  );
}
