import { motion } from 'framer-motion';
import SeverityBadge from './SeverityBadge';
import { getSeverityInfo, disasterLabel, timeAgo, formatDistance } from '../../utils/helpers';

export default function ReportCard({ report, onClick, compact = false }) {
  const info = getSeverityInfo(report.severity);

  if (compact) {
    return (
      <motion.div
        whileHover={{ x: 4 }}
        onClick={() => onClick?.(report)}
        className="glass-card p-3 border border-white/5 cursor-pointer transition-all hover:border-white/20"
        style={{ borderLeft: `4px solid ${info.color}` }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-lg flex-shrink-0">
              {disasterLabel(report.disaster_type)}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{report.description?.slice(0, 60) || 'No description'}</p>
              <p className="text-[11px] text-slate-500">{timeAgo(report.timestamp)}</p>
            </div>
          </div>
          <SeverityBadge severity={report.severity} size="sm" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={() => onClick?.(report)}
      className="glass-card p-4 md:p-5 border border-white/5 cursor-pointer transition-all hover:border-white/20 flex flex-col md:flex-row gap-4"
      style={{ borderLeft: `4px solid ${info.color}` }}
    >
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <SeverityBadge severity={report.severity} size="sm" />
          <span className="text-xs text-slate-500 font-mono">#{report.id}</span>
        </div>
        <p className="text-sm md:text-base text-slate-200 leading-relaxed">{report.description || 'No description provided'}</p>
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <span className="font-medium text-slate-300">Type:</span> {disasterLabel(report.disaster_type)}
          </span>
          <span className="flex items-center gap-1">
            <span className="font-medium text-slate-300">Confidence:</span> {report.confidence_score ?? 0}%
          </span>
          <span className="flex items-center gap-1">
            <span className="font-medium text-slate-300">Status:</span> {report.status || 'ACTIVE'}
          </span>
        </div>
      </div>
      <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-3 md:gap-1 md:text-right flex-shrink-0">
        <div className="text-xs text-slate-500 space-y-0.5">
          <p>{timeAgo(report.timestamp)}</p>
          <p className="font-mono">{report.lat?.toFixed(4)}, {report.lng?.toFixed(4)}</p>
        </div>
      </div>
    </motion.div>
  );
}
