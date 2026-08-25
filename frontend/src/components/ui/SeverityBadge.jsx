import { getSeverityInfo } from '../../utils/helpers';
import { motion } from 'framer-motion';
import {
  Circle,
  CircleDot,
  AlertTriangle,
  AlertOctagon,
} from 'lucide-react';

const ICON_MAP = {
  Circle,
  CircleDot,
  AlertTriangle,
  AlertOctagon,
};

const sizes = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
  lg: 'text-base px-3 py-1.5',
};

const dotSizes = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
  lg: 'w-2.5 h-2.5',
};

export default function SeverityBadge({
  severity,
  size = 'md',
  className = '',
  dot = true,
}) {
  const info = getSeverityInfo(severity);
  const Icon = ICON_MAP[info.iconName] || Circle;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${sizes[size]} ${className}`}
      style={{
        backgroundColor: `${info.color}20`,
        color: info.color,
        border: `1px solid ${info.color}40`,
      }}
    >
      {dot && (
        <span className={`${dotSizes[size]} rounded-full flex-shrink-0 ${severity === 'CRITICAL' ? 'animate-pulse' : ''}`} style={{ backgroundColor: info.color }} />
      )}
      <Icon className={`${size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-3.5 h-3.5' : 'w-4 h-4'} flex-shrink-0`} />
      {info.short}
    </span>
  );
}
