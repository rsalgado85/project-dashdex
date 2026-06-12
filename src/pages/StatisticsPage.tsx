import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAllPokemon } from '@/hooks/usePokemon';
import { ChartSkeleton } from '@/components/common/Skeleton';
import { TypeDistributionChart } from '@/components/charts/TypeDistributionChart';
import { GenerationDistributionChart } from '@/components/charts/GenerationDistributionChart';
import { useAppStore } from '@/store/useAppStore';
import { t } from '@/constants/translations';
import { TYPE_COLORS } from '@/constants';
import type { TypeDistribution } from '@/types/pokemon';

function getGenerationId(pokemonId: number): number {
  if (pokemonId <= 151) return 1;
  if (pokemonId <= 251) return 2;
  if (pokemonId <= 386) return 3;
  if (pokemonId <= 493) return 4;
  if (pokemonId <= 649) return 5;
  if (pokemonId <= 721) return 6;
  if (pokemonId <= 809) return 7;
  if (pokemonId <= 898) return 8;
  if (pokemonId <= 1010) return 9;
  return 10;
}

export function StatisticsPage() {
  const { data: pokemonList, isLoading } = useAllPokemon();
  const { language } = useAppStore();

  const typeDistribution: TypeDistribution[] = useMemo(() => {
    if (!pokemonList) return [];
    const typeCount = new Map<string, number>();
    pokemonList.forEach((p) => {
      p.types.forEach((t) => {
        typeCount.set(t.type.name, (typeCount.get(t.type.name) || 0) + 1);
      });
    });
    return Array.from(typeCount.entries())
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / pokemonList.length) * 100),
        color: TYPE_COLORS[name] || '#666',
      }))
      .sort((a, b) => b.count - a.count);
  }, [pokemonList]);

  const generationDistribution = useMemo(() => {
    if (!pokemonList) return [];
    const genCount = new Map<number, number>();
    pokemonList.forEach((p) => {
      const gen = getGenerationId(p.id);
      genCount.set(gen, (genCount.get(gen) || 0) + 1);
    });
    return Array.from(genCount.entries())
      .map(([generationId, count]) => ({ generationId, count }))
      .sort((a, b) => a.generationId - b.generationId);
  }, [pokemonList]);

  const totalPokemon = pokemonList?.length || 0;
  const totalTypes = typeDistribution.length;
  const avgStats = useMemo(() => {
    if (!pokemonList || pokemonList.length === 0) return 0;
    const total = pokemonList.reduce((sum, p) => sum + (p.totalStats || 0), 0);
    return Math.round(total / pokemonList.length);
  }, [pokemonList]);

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
        <div className="space-y-1 sm:space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text">{t('stats.title', language)}</h1>
          <p className="text-xs sm:text-sm text-text-secondary">{t('common.loading', language)}</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <ChartSkeleton height="h-72 sm:h-96" />
          <ChartSkeleton height="h-72 sm:h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1 sm:space-y-2"
      >
        <h1 className="text-2xl sm:text-3xl font-bold gradient-text">{t('stats.title', language)}</h1>
        <p className="text-xs sm:text-sm text-text-secondary">
          {t('stats.subtitle', language)}
        </p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-3 sm:p-4 text-center"
        >
          <p className="text-xl sm:text-3xl font-black gradient-text">{totalPokemon}</p>
          <p className="text-[10px] sm:text-xs text-text-secondary mt-0.5 sm:mt-1">{t('common.pokemon', language)}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-3 sm:p-4 text-center"
        >
          <p className="text-xl sm:text-3xl font-black gradient-text">{totalTypes}</p>
          <p className="text-[10px] sm:text-xs text-text-secondary mt-0.5 sm:mt-1">{t('common.types', language)}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-3 sm:p-4 text-center"
        >
          <p className="text-xl sm:text-3xl font-black gradient-text">{avgStats}</p>
          <p className="text-[10px] sm:text-xs text-text-secondary mt-0.5 sm:mt-1">{t('rankings.bestOverall', language)}</p>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 sm:p-6"
        >
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">{t('stats.typeDistribution', language)}</h2>
          <div className="h-[300px] sm:h-[400px]">
            <TypeDistributionChart data={typeDistribution} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-4 sm:p-6"
        >
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">{t('stats.generationDistribution', language)}</h2>
          <div className="h-[300px] sm:h-[400px]">
            <GenerationDistributionChart data={generationDistribution} />
          </div>
        </motion.div>
      </div>

      {/* Type Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-4 sm:p-6"
      >
        <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">{t('stats.typeBreakdown', language)}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
          {typeDistribution.map((type) => (
            <div
              key={type.name}
              className="rounded-xl p-2 sm:p-3"
              style={{
                backgroundColor: `${type.color}20`,
                border: `1px solid ${type.color}30`,
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] sm:text-xs font-semibold capitalize">{type.name}</span>
                <span className="text-[10px] sm:text-xs font-bold">{type.count}</span>
              </div>
              <div className="h-1.5 sm:h-2 bg-dark-border rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${type.percentage}%`,
                    backgroundColor: type.color,
                  }}
                />
              </div>
              <p className="text-[9px] sm:text-[10px] text-text-secondary mt-0.5 sm:mt-1">{type.percentage}%</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
