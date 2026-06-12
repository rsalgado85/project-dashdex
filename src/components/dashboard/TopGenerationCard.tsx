/**
 * Top Generation Card - Inspired by Top Maps from reference
 * Shows the most popular Pokémon generation with a circular popularity indicator
 */

import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { useAllGenerations } from '@/hooks/useGenerations';
import { useAllPokemon } from '@/hooks/usePokemon';
import { capitalize } from '@/utils/pokemonUtils';
import { Globe } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { t } from '@/constants/translations';

const GENERATION_COLORS: Record<string, string> = {
  'generation-i': 'linear-gradient(135deg, #667eea, #764ba2)',
  'generation-ii': 'linear-gradient(135deg, #f093fb, #f5576c)',
  'generation-iii': 'linear-gradient(135deg, #4facfe, #00f2fe)',
  'generation-iv': 'linear-gradient(135deg, #43e97b, #38f9d7)',
  'generation-v': 'linear-gradient(135deg, #fa709a, #fee140)',
  'generation-vi': 'linear-gradient(135deg, #a18cd1, #fbc2eb)',
  'generation-vii': 'linear-gradient(135deg, #fccb90, #d57eeb)',
  'generation-viii': 'linear-gradient(135deg, #e0c3fc, #8ec5fc)',
  'generation-ix': 'linear-gradient(135deg, #f5576c, #ff6f00)',
};

const GENERATION_NAMES: Record<string, string> = {
  'generation-i': 'Kanto',
  'generation-ii': 'Johto',
  'generation-iii': 'Hoenn',
  'generation-iv': 'Sinnoh',
  'generation-v': 'Unova',
  'generation-vi': 'Kalos',
  'generation-vii': 'Alola',
  'generation-viii': 'Galar',
  'generation-ix': 'Paldea',
};

const GENERATION_NUMBERS: Record<string, string> = {
  'generation-i': 'I',
  'generation-ii': 'II',
  'generation-iii': 'III',
  'generation-iv': 'IV',
  'generation-v': 'V',
  'generation-vi': 'VI',
  'generation-vii': 'VII',
  'generation-viii': 'VIII',
  'generation-ix': 'IX',
};

export function TopGenerationCard() {
  const { data: generations } = useAllGenerations();
  const { data: allPokemon } = useAllPokemon();
  const { language } = useAppStore();

  const topGeneration = useMemo(() => {
    if (!generations || !allPokemon) return null;

    // Count Pokémon per generation
    const genCounts: Record<string, number> = {};
    for (const gen of generations) {
      genCounts[gen.name] = gen.pokemonSpecies.length;
    }

    // Find the generation with the most Pokémon
    const sorted = Object.entries(genCounts).sort(([, a], [, b]) => b - a);
    if (sorted.length === 0) return null;

    const topGenName = sorted[0][0];
    const topGenCount = sorted[0][1];
    const totalPokemon = allPokemon.length;
    const popularity = Math.round((topGenCount / totalPokemon) * 100);

    return {
      name: topGenName,
      displayName: GENERATION_NAMES[topGenName] || capitalize(topGenName.replace('generation-', 'Gen ')),
      count: topGenCount,
      total: totalPokemon,
      popularity,
      gradient: GENERATION_COLORS[topGenName] || 'linear-gradient(135deg, #667eea, #764ba2)',
      genNumber: GENERATION_NUMBERS[topGenName] || '?',
    };
  }, [generations, allPokemon]);

  if (!topGeneration) {
    return (
      <div className="rounded-[32px] p-6 h-full" style={{
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(25px)',
        WebkitBackdropFilter: 'blur(25px)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div className="skeleton h-full w-full rounded-2xl" />
      </div>
    );
  }

  const popularityColor = topGeneration.popularity >= 20 ? '#6c5ce7' : topGeneration.popularity >= 10 ? '#fdcb6e' : '#e17055';

  return (
    <motion.div
      className="rounded-[32px] p-6 h-full relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
      style={{
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(25px)',
        WebkitBackdropFilter: 'blur(25px)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Background decoration */}
      <div
        className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-10 blur-3xl"
        style={{ background: 'radial-gradient(circle, #6c5ce7, transparent)' }}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(108,92,231,0.15)' }}>
            <Globe size={18} className="text-accent-light" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-primary">{t('dashboard.topGeneration', language)}</h3>
            <p className="text-[10px] text-text-secondary">{t('dashboard.mostPopulated', language)}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex items-center gap-5 relative z-10">
        {/* Generation visual - gradient with roman numeral */}
        <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 relative">
          <div
            className="absolute inset-0"
            style={{
              background: topGeneration.gradient,
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-black text-white/80 drop-shadow-lg">
              {topGeneration.genNumber}
            </span>
          </div>
          {/* Decorative dots */}
          <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-white/20" />
          <div className="absolute top-2 right-5 w-1 h-1 rounded-full bg-white/10" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className="text-lg font-black text-text-primary">{topGeneration.displayName}</h4>
          <p className="text-xs text-text-secondary mt-0.5">
            {topGeneration.count.toLocaleString()} {t('dashboard.pokemonCount', language)}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
              <motion.div
                className="h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${topGeneration.popularity}%` }}
                transition={{ delay: 0.8, duration: 1, ease: 'easeOut' }}
                style={{
                  backgroundColor: popularityColor,
                  boxShadow: `0 0 10px ${popularityColor}44`,
                }}
              />
            </div>
            <span className="text-[10px] font-bold text-text-secondary">{topGeneration.popularity}%</span>
          </div>
        </div>

        {/* Circular popularity */}
        <div className="relative w-16 h-16 flex-shrink-0">
          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50" cy="50" r="42"
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="6"
            />
            <motion.circle
              cx="50" cy="50" r="42"
              fill="none"
              stroke={popularityColor}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${(topGeneration.popularity / 100) * 264} 264`}
              initial={{ strokeDasharray: '0 264' }}
              animate={{ strokeDasharray: `${(topGeneration.popularity / 100) * 264} 264` }}
              transition={{ delay: 1, duration: 1.5, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-sm font-black" style={{ color: popularityColor }}>
              {topGeneration.popularity}%
            </span>
            <span className="text-[7px] text-text-secondary font-semibold uppercase tracking-wider mt-[-1px]">
              {t('dashboard.popularity', language)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
