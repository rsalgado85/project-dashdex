/**
 * Hero Card - Main dashboard hero section
 * 
 * Premium gaming-style hero card featuring a featured Pokémon
 * with dynamic type-based glow effects, circular power score,
 * and detailed stat display.
 * 
 * Inspired by: Valorant Tracker, Pokémon Home, Nintendo Switch UI
 */

import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { useAllPokemon } from '@/hooks/usePokemon';
import { capitalize, formatPokemonId } from '@/utils/pokemonUtils';
import { TYPE_COLORS } from '@/constants';
import { Swords, Shield, Zap, Heart, Brain, Eye } from 'lucide-react';
import { GenerationBadge } from '@/components/common/GenerationBadge';
import { useAppStore } from '@/store/useAppStore';
import { t } from '@/constants/translations';

interface HeroCardProps {
  pokemonId?: number;
}

const STAT_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  hp: Heart,
  attack: Swords,
  defense: Shield,
  'special-attack': Brain,
  'special-defense': Eye,
  speed: Zap,
};

const STAT_LABELS: Record<string, string> = {
  hp: 'HP',
  attack: 'Attack',
  defense: 'Defense',
  'special-attack': 'Sp. Atk',
  'special-defense': 'Sp. Def',
  speed: 'Speed',
};

export function HeroCard({ pokemonId }: HeroCardProps) {
  const { data: allPokemon } = useAllPokemon();
  const { theme, language } = useAppStore();
  const isDark = theme === 'dark';

  const featuredPokemon = useMemo(() => {
    if (!allPokemon || allPokemon.length === 0) return null;

    if (pokemonId) {
      // Use explicitly provided Pokémon ID
      return allPokemon.find((p) => p.id === pokemonId) || allPokemon[0];
    }

    // Dynamic selection: pick the Pokémon with the highest total stats
    // that is NOT a mythical/legendary (to keep it relatable)
    // This ensures the featured Pokémon changes as more data loads
    // and always showcases an impressive but recognizable Pokémon
    const sorted = [...allPokemon].sort((a, b) => {
      // Prefer Pokémon with higher total stats
      const statDiff = (b.totalStats || 0) - (a.totalStats || 0);
      if (statDiff !== 0) return statDiff;
      // Tiebreaker: prefer lower ID (more iconic Pokémon)
      return a.id - b.id;
    });

    // Return the top non-legendary/mythical candidate
    // Top 5 by total stats typically are: Mewtwo, Groudon, Kyogre, Rayquaza, etc.
    // We pick from the top 10 to add variety
    const topCandidates = sorted.slice(0, 10);
    // Use the current date to rotate the featured Pokémon daily
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
    );
    const selectedIndex = dayOfYear % topCandidates.length;
    return topCandidates[selectedIndex];
  }, [allPokemon, pokemonId]);

  if (!featuredPokemon) {
    return (
      <div className="hero-card-skeleton">
        <div className="skeleton h-full w-full rounded-[32px]" />
      </div>
    );
  }

  const primaryType = featuredPokemon.dominantType;
  const typeColor = TYPE_COLORS[primaryType] || '#6c5ce7';
  const totalStats = featuredPokemon.totalStats;
  const maxPossibleStats = 720; // Max possible total (Mewtwo level)
  const powerScore = Math.round((totalStats / maxPossibleStats) * 100);
  const powerScoreColor = powerScore >= 80 ? '#00b894' : powerScore >= 60 ? '#fdcb6e' : '#e17055';

  // Stats for the side panel
  const stats = featuredPokemon.stats.map((s) => ({
    name: s.stat.name,
    label: STAT_LABELS[s.stat.name] || s.stat.name,
    value: s.base_stat,
    icon: STAT_ICONS[s.stat.name] || Swords,
    maxValue: 255,
  }));

  return (
    <motion.div
      className="relative overflow-hidden rounded-[32px]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      style={{
        background: isDark
          ? `linear-gradient(135deg, ${typeColor}22 0%, rgba(15, 23, 42, 0.95) 50%, ${typeColor}11 100%)`
          : `linear-gradient(135deg, ${typeColor}15 0%, rgba(255, 255, 255, 0.95) 50%, ${typeColor}08 100%)`,
        border: `1px solid ${typeColor}33`,
        boxShadow: isDark
          ? `0 0 60px ${typeColor}22, 0 0 120px ${typeColor}11`
          : `0 4px 24px ${typeColor}15, 0 1px 4px ${typeColor}0a`,
      }}
    >
      {/* Background glow effect */}
      <div
        className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-20 blur-3xl"
        style={{ background: `radial-gradient(circle, ${typeColor}44, transparent)` }}
      />
      <div
        className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full opacity-10 blur-3xl"
        style={{ background: `radial-gradient(circle, ${typeColor}33, transparent)` }}
      />

      <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-0 min-h-[360px] lg:min-h-[420px]">
        {/* Left Section - Stats */}
        <div className="lg:col-span-5 p-4 sm:p-6 lg:p-8 flex flex-col justify-between">
          {/* Header */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3 mb-2"
            >
              <span className="text-xs font-semibold tracking-widest uppercase text-text-secondary">
                {t('dashboard.featuredPokemon', language)}
              </span>
              <GenerationBadge pokemonId={featuredPokemon.id} size="sm" />
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                style={{
                  backgroundColor: `${typeColor}33`,
                  color: typeColor,
                }}
              >
                {primaryType}
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl font-black tracking-tight mb-1"
            >
              {capitalize(featuredPokemon.name)}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
              className="text-sm text-text-secondary font-mono"
            >
              {formatPokemonId(featuredPokemon.id)}
            </motion.p>
          </div>

          {/* Power Score Circle */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 100 }}
            className="flex items-center gap-6 my-6"
          >
            <div className="relative w-24 h-24 flex-shrink-0">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}
                  strokeWidth="6"
                />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke={powerScoreColor}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${(powerScore / 100) * 264} 264`}
                  initial={{ strokeDasharray: '0 264' }}
                  animate={{ strokeDasharray: `${(powerScore / 100) * 264} 264` }}
                  transition={{ delay: 0.8, duration: 1.5, ease: 'easeOut' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className="text-2xl font-black"
                  style={{ color: powerScoreColor }}
                >
                  {powerScore}%
                </span>
                <span className="text-[9px] text-text-secondary font-semibold uppercase tracking-wider mt-[-2px]">
                  {t('dashboard.power', language)}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-secondary font-medium">{t('dashboard.totalStats', language)}</span>
                <span className="text-lg font-bold text-text-primary">{totalStats}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-secondary font-medium">{t('dashboard.height', language)}</span>
                <span className="text-sm font-semibold text-text-primary">
                  {(featuredPokemon.height / 10).toFixed(1)} {t('common.m', language)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-secondary font-medium">{t('dashboard.weight', language)}</span>
                <span className="text-sm font-semibold text-text-primary">
                  {(featuredPokemon.weight / 10).toFixed(1)} {t('common.kg', language)}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-3 gap-3"
          >
            {stats.slice(0, 6).map((stat, i) => {
              const StatIcon = stat.icon;
              const statColor = TYPE_COLORS[stat.name] || '#6c5ce7';
              return (
                <motion.div
                  key={stat.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.08 }}
                  className="rounded-2xl p-3"
                  style={{
                    backgroundColor: `${statColor}11`,
                    border: `1px solid ${statColor}22`,
                  }}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <StatIcon size={12} className="opacity-70" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider opacity-70" style={{ color: statColor }}>
                      {stat.label}
                    </span>
                  </div>
                  <span className="text-lg font-black text-text-primary">{stat.value}</span>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Right Section - Pokémon Artwork */}
        <div className="lg:col-span-7 relative flex items-center justify-center overflow-hidden min-h-[300px] lg:min-h-full">
          {/* Background decorative elements */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `radial-gradient(circle at 50% 50%, ${typeColor} 0%, transparent 70%)`,
            }}
          />

          {/* Pokémon Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.6, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, type: 'spring', stiffness: 60 }}
            className="relative z-10"
          >
            <motion.img
              src={featuredPokemon.artworkUrl}
              alt={featuredPokemon.name}
              className="w-[320px] h-[320px] md:w-[420px] md:h-[420px] object-contain drop-shadow-2xl"
              animate={{
                y: [0, -8, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              loading="eager"
            />
          </motion.div>

          {/* Type badges floating */}
          <div className="absolute bottom-6 left-6 flex gap-2">
            {featuredPokemon.types.map((t, i) => (
              <motion.span
                key={t.type.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.1 }}
                className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md"
                style={{
                  backgroundColor: `${TYPE_COLORS[t.type.name] || '#6c5ce7'}33`,
                  color: TYPE_COLORS[t.type.name] || '#6c5ce7',
                  border: `1px solid ${TYPE_COLORS[t.type.name] || '#6c5ce7'}44`,
                }}
              >
                {t.type.name}
              </motion.span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
