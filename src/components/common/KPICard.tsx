import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { GenerationBadge } from '@/components/common/GenerationBadge';

interface KPICardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  onClick?: () => void;
  imageUrl?: string;
  pokemonId?: number;
}

export function KPICard({ label, value, icon: Icon, subtitle, trend, trendValue, onClick, imageUrl, pokemonId }: KPICardProps) {
  return (
    <motion.button
      onClick={onClick}
      className="kpi-card text-left w-full cursor-pointer group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      aria-label={`${label}: ${value}`}
    >
      <div className="flex items-center justify-between">
        <span className="kpi-label">{label}</span>
        <div className="p-2 rounded-lg bg-accent/10 text-accent-light group-hover:bg-accent/20 transition-colors">
          <Icon size={18} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        {imageUrl && (
          <img
            src={imageUrl}
            alt={String(value)}
            className="w-8 h-8 object-contain"
            loading="lazy"
          />
        )}
        <span className="kpi-value">{value}</span>
        {pokemonId && (
          <GenerationBadge pokemonId={pokemonId} size="sm" />
        )}
      </div>
      {subtitle && (
        <span className="text-xs text-text-secondary">{subtitle}</span>
      )}
      {trend && (
        <div className="flex items-center gap-1 mt-1">
          <span
            className={`text-xs font-medium ${
              trend === 'up' ? 'text-success' : trend === 'down' ? 'text-danger' : 'text-text-secondary'
            }`}
          >
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
          </span>
        </div>
      )}
    </motion.button>
  );
}
