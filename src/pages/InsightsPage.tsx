import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAllPokemon } from '@/hooks/usePokemon';
import { ChartSkeleton } from '@/components/common/Skeleton';
import { useAppStore } from '@/store/useAppStore';
import { t } from '@/constants/translations';
import { TYPE_COLORS } from '@/constants';
import { capitalize } from '@/utils/pokemonUtils';
import { Swords, Shield, Zap, Heart, Brain, Eye, TrendingUp, TrendingDown } from 'lucide-react';

const STAT_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  hp: Heart,
  attack: Swords,
  defense: Shield,
  'special-attack': Brain,
  'special-defense': Eye,
  speed: Zap,
};

export function InsightsPage() {
  const { data: pokemonList, isLoading } = useAllPokemon();
  const { language } = useAppStore();

  const insights = useMemo(() => {
    if (!pokemonList || pokemonList.length === 0) return null;

    // Type with most Pokémon
    const typeCount = new Map<string, number>();
    pokemonList.forEach((p) => {
      p.types.forEach((t) => {
        typeCount.set(t.type.name, (typeCount.get(t.type.name) || 0) + 1);
      });
    });
    const mostCommonType = Array.from(typeCount.entries()).sort((a, b) => b[1] - a[1])[0];

    // Type with highest average total stats
    const typeStats = new Map<string, { total: number; count: number }>();
    pokemonList.forEach((p) => {
      p.types.forEach((t) => {
        const current = typeStats.get(t.type.name) || { total: 0, count: 0 };
        current.total += p.totalStats || 0;
        current.count += 1;
        typeStats.set(t.type.name, current);
      });
    });
    const strongestType = Array.from(typeStats.entries())
      .map(([name, data]) => ({ name, avg: data.total / data.count }))
      .sort((a, b) => b.avg - a.avg)[0];

    // Fastest Pokémon
    const fastest = [...pokemonList].sort((a, b) => {
      const speedA = a.stats.find((s) => s.stat.name === 'speed')?.base_stat || 0;
      const speedB = b.stats.find((s) => s.stat.name === 'speed')?.base_stat || 0;
      return speedB - speedA;
    })[0];

    // Strongest Pokémon (highest attack)
    const strongest = [...pokemonList].sort((a, b) => {
      const atkA = a.stats.find((s) => s.stat.name === 'attack')?.base_stat || 0;
      const atkB = b.stats.find((s) => s.stat.name === 'attack')?.base_stat || 0;
      return atkB - atkA;
    })[0];

    // Toughest Pokémon (highest defense)
    const toughest = [...pokemonList].sort((a, b) => {
      const defA = a.stats.find((s) => s.stat.name === 'defense')?.base_stat || 0;
      const defB = b.stats.find((s) => s.stat.name === 'defense')?.base_stat || 0;
      return defB - defA;
    })[0];

    // Highest HP
    const highestHP = [...pokemonList].sort((a, b) => {
      const hpA = a.stats.find((s) => s.stat.name === 'hp')?.base_stat || 0;
      const hpB = b.stats.find((s) => s.stat.name === 'hp')?.base_stat || 0;
      return hpB - hpA;
    })[0];

    // Average stats across all Pokémon
    const avgStats = {
      hp: Math.round(pokemonList.reduce((sum, p) => sum + (p.stats.find((s) => s.stat.name === 'hp')?.base_stat || 0), 0) / pokemonList.length),
      attack: Math.round(pokemonList.reduce((sum, p) => sum + (p.stats.find((s) => s.stat.name === 'attack')?.base_stat || 0), 0) / pokemonList.length),
      defense: Math.round(pokemonList.reduce((sum, p) => sum + (p.stats.find((s) => s.stat.name === 'defense')?.base_stat || 0), 0) / pokemonList.length),
      speed: Math.round(pokemonList.reduce((sum, p) => sum + (p.stats.find((s) => s.stat.name === 'speed')?.base_stat || 0), 0) / pokemonList.length),
    };

    return {
      mostCommonType,
      strongestType,
      fastest,
      strongest,
      toughest,
      highestHP,
      avgStats,
      totalPokemon: pokemonList.length,
    };
  }, [pokemonList]);

  if (isLoading || !insights) {
    return (
      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
        <div className="space-y-1 sm:space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text">{t('insights.title', language)}</h1>
          <p className="text-xs sm:text-sm text-text-secondary">{t('common.loading', language)}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <ChartSkeleton key={i} height="h-28 sm:h-32" />
          ))}
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
        <h1 className="text-2xl sm:text-3xl font-bold gradient-text">{t('insights.title', language)}</h1>
        <p className="text-xs sm:text-sm text-text-secondary">
          {t('insights.subtitle', language)}
        </p>
      </motion.div>

      {/* Top Performers */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-3 sm:p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Zap size={14} className="text-yellow-400" />
            <span className="text-[10px] sm:text-xs font-semibold text-text-secondary uppercase tracking-wider">{t('rankings.fastest', language)}</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <img src={insights.fastest.imageUrl} alt={insights.fastest.name} className="w-10 h-10 sm:w-14 sm:h-14 object-contain" />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-semibold truncate">{capitalize(insights.fastest.name)}</p>
              <p className="text-[10px] sm:text-xs text-text-secondary">
                {t('rankings.topSpeed', language)}: {insights.fastest.stats.find((s) => s.stat.name === 'speed')?.base_stat || 0}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-3 sm:p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Swords size={14} className="text-danger" />
            <span className="text-[10px] sm:text-xs font-semibold text-text-secondary uppercase tracking-wider">{t('rankings.strongest', language)}</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <img src={insights.strongest.imageUrl} alt={insights.strongest.name} className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-semibold truncate">{capitalize(insights.strongest.name)}</p>
              <p className="text-[10px] sm:text-xs text-text-secondary">
                {t('rankings.topAttack', language)}: {insights.strongest.stats.find((s) => s.stat.name === 'attack')?.base_stat || 0}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-3 sm:p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Shield size={14} className="text-blue-400" />
            <span className="text-[10px] sm:text-xs font-semibold text-text-secondary uppercase tracking-wider">{t('rankings.toughest', language)}</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <img src={insights.toughest.imageUrl} alt={insights.toughest.name} className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-semibold truncate">{capitalize(insights.toughest.name)}</p>
              <p className="text-[10px] sm:text-xs text-text-secondary">
                {t('rankings.topDefense', language)}: {insights.toughest.stats.find((s) => s.stat.name === 'defense')?.base_stat || 0}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-3 sm:p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Heart size={14} className="text-success" />
            <span className="text-[10px] sm:text-xs font-semibold text-text-secondary uppercase tracking-wider">{t('insights.highestHP', language)}</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <img src={insights.highestHP.imageUrl} alt={insights.highestHP.name} className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-semibold truncate">{capitalize(insights.highestHP.name)}</p>
              <p className="text-[10px] sm:text-xs text-text-secondary">
                {t('detail.hp', language)}: {insights.highestHP.stats.find((s) => s.stat.name === 'hp')?.base_stat || 0}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-3 sm:p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={14} className="text-accent-light" />
            <span className="text-[10px] sm:text-xs font-semibold text-text-secondary uppercase tracking-wider">{t('insights.strongestType', language)}</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: TYPE_COLORS[insights.strongestType.name] || '#666' }}
            />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-semibold capitalize truncate">{insights.strongestType.name}</p>
              <p className="text-[10px] sm:text-xs text-text-secondary">
                {t('rankings.bestOverall', language)}: {Math.round(insights.strongestType.avg)}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-3 sm:p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown size={14} className="text-text-secondary" />
            <span className="text-[10px] sm:text-xs font-semibold text-text-secondary uppercase tracking-wider">{t('insights.mostCommon', language)}</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: TYPE_COLORS[insights.mostCommonType[0]] || '#666' }}
            />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-semibold capitalize truncate">{insights.mostCommonType[0]}</p>
              <p className="text-[10px] sm:text-xs text-text-secondary">
                {insights.mostCommonType[1]} {t('common.pokemon', language)} ({Math.round((insights.mostCommonType[1] / insights.totalPokemon) * 100)}%)
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Average Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-card p-4 sm:p-6"
      >
        <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">{t('insights.avgStats', language)}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {Object.entries(insights.avgStats).map(([stat, value]) => {
            const StatIcon = STAT_ICONS[stat] || Swords;
            const maxVal = 255;
            const percentage = (value / maxVal) * 100;
            return (
              <div key={stat} className="text-center">
                <StatIcon size={16} className="mx-auto mb-1 sm:mb-2 text-accent-light" />
                <p className="text-lg sm:text-2xl font-black gradient-text">{value}</p>
                <p className="text-[10px] sm:text-xs text-text-secondary capitalize">{stat}</p>
                <div className="h-1 sm:h-1.5 bg-dark-border rounded-full mt-1 sm:mt-2 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-accent to-accent-light"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
