import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap,
  Swords,
  Shield,
  Hash,
  Shapes,
  Brain,
} from 'lucide-react';
import { KPICard } from '@/components/common/KPICard';
import { KPISkeleton } from '@/components/common/Skeleton';
import { HeroCard } from '@/components/dashboard/HeroCard';
import { TopMovesCard } from '@/components/dashboard/TopMovesCard';
import { RecentPokemonCard } from '@/components/dashboard/RecentPokemonCard';
import { TopGenerationCard } from '@/components/dashboard/TopGenerationCard';
import { useDashboardKPIs, useAllPokemon } from '@/hooks/usePokemon';
import { capitalize } from '@/utils/pokemonUtils';
import { useAppStore } from '@/store/useAppStore';
import { t } from '@/constants/translations';
import { useMemo } from 'react';

export function DashboardPage() {
  const navigate = useNavigate();
  const { kpis, isLoading } = useDashboardKPIs();
  const { data: allPokemon } = useAllPokemon();
  const { language } = useAppStore();

  // Create a map of pokemon id to image URL
  const pokemonImageMap = useMemo(() => {
    if (!allPokemon) return new Map<number, string>();
    const map = new Map<number, string>();
    allPokemon.forEach((p) => {
      map.set(p.id, p.artworkUrl);
    });
    return map;
  }, [allPokemon]);

  // Calculate featured Pokémon ID (same logic as HeroCard)
  const featuredPokemonId = useMemo(() => {
    if (!allPokemon || allPokemon.length === 0) return undefined;
    const sorted = [...allPokemon].sort((a, b) => {
      const statDiff = (b.totalStats || 0) - (a.totalStats || 0);
      if (statDiff !== 0) return statDiff;
      return a.id - b.id;
    });
    const topCandidates = sorted.slice(0, 10);
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
    );
    const selectedIndex = dayOfYear % topCandidates.length;
    return topCandidates[selectedIndex]?.id;
  }, [allPokemon]);

  if (isLoading || !kpis) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold gradient-text">{t('dashboard.title', language)}</h1>
          <p className="text-text-secondary">{t('common.loading', language)}</p>
        </div>
        <KPISkeleton />
      </div>
    );
  }

  const kpiCards = [
    {
      label: t('dashboard.totalPokemon', language),
      value: kpis.totalPokemon,
      icon: Hash,
      subtitle: t('dashboard.subtitleKanto', language),
    },
    {
      label: t('dashboard.totalTypes', language),
      value: kpis.totalTypes,
      icon: Shapes,
      subtitle: t('dashboard.subtitleTypes', language),
    },
    {
      label: t('dashboard.totalAbilities', language),
      value: kpis.totalAbilities,
      icon: Brain,
      subtitle: t('dashboard.subtitleAbilities', language),
    },
    {
      label: t('dashboard.fastest', language),
      value: capitalize(kpis.fastest?.name ?? ''),
      icon: Zap,
      subtitle: `${t('rankings.topSpeed', language)}: ${kpis.fastest?.value}`,
      onClick: () => navigate(`/pokemon/${kpis.fastest?.id}`),
      imageUrl: kpis.fastest?.id ? pokemonImageMap.get(kpis.fastest.id) : undefined,
      pokemonId: kpis.fastest?.id,
    },
    {
      label: t('dashboard.strongest', language),
      value: capitalize(kpis.strongest?.name ?? ''),
      icon: Swords,
      subtitle: `${t('rankings.topAttack', language)}: ${kpis.strongest?.value}`,
      onClick: () => navigate(`/pokemon/${kpis.strongest?.id}`),
      imageUrl: kpis.strongest?.id ? pokemonImageMap.get(kpis.strongest.id) : undefined,
      pokemonId: kpis.strongest?.id,
    },
    {
      label: t('dashboard.toughest', language),
      value: capitalize(kpis.toughest?.name ?? ''),
      icon: Shield,
      subtitle: `${t('rankings.topDefense', language)}: ${kpis.toughest?.value}`,
      onClick: () => navigate(`/pokemon/${kpis.toughest?.id}`),
      imageUrl: kpis.toughest?.id ? pokemonImageMap.get(kpis.toughest.id) : undefined,
      pokemonId: kpis.toughest?.id,
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1 sm:space-y-2"
      >
        <h1 className="text-2xl sm:text-3xl font-bold gradient-text">{t('dashboard.title', language)}</h1>
        <p className="text-xs sm:text-sm text-text-secondary">
          {t('dashboard.subtitle', language)}
        </p>
      </motion.div>

      {/* Hero Section - Premium Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Hero Card - Takes 2/3 of the width */}
        <div className="lg:col-span-2">
          <HeroCard pokemonId={featuredPokemonId} />
        </div>

        {/* Top Moves Card - Takes 1/3 - Shows moves of the featured Pokémon */}
        <div className="lg:col-span-1">
          <TopMovesCard pokemonId={featuredPokemonId} />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {kpiCards.map((kpi, index) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <KPICard {...kpi} />
          </motion.div>
        ))}
      </div>

      {/* Bottom Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Recent Pokémon Viewed - Takes 2/3 */}
        <div className="lg:col-span-2">
          <RecentPokemonCard />
        </div>

        {/* Top Generation - Takes 1/3 */}
        <div className="lg:col-span-1">
          <TopGenerationCard />
        </div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="rounded-2xl sm:rounded-[32px] p-4 sm:p-6"
        style={{
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(25px)',
          WebkitBackdropFilter: 'blur(25px)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">{t('dashboard.quickActions', language)}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <motion.button
            onClick={() => navigate('/statistics')}
            className="rounded-xl sm:rounded-2xl p-3 sm:p-4 text-left transition-all duration-200 hover:translate-y-[-4px]"
            style={{
              backgroundColor: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.04)',
            }}
            whileHover={{ scale: 1.02 }}
          >
            <span className="text-xs sm:text-sm font-medium text-text-primary">{t('dashboard.viewStats', language)}</span>
            <p className="text-[10px] sm:text-xs text-text-secondary mt-1">{t('dashboard.viewStatsDesc', language)}</p>
          </motion.button>
          <motion.button
            onClick={() => navigate('/compare')}
            className="rounded-xl sm:rounded-2xl p-3 sm:p-4 text-left transition-all duration-200 hover:translate-y-[-4px]"
            style={{
              backgroundColor: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.04)',
            }}
            whileHover={{ scale: 1.02 }}
          >
            <span className="text-xs sm:text-sm font-medium text-text-primary">{t('dashboard.compare', language)}</span>
            <p className="text-[10px] sm:text-xs text-text-secondary mt-1">{t('dashboard.compareDesc', language)}</p>
          </motion.button>
          <motion.button
            onClick={() => navigate('/rankings')}
            className="rounded-xl sm:rounded-2xl p-3 sm:p-4 text-left transition-all duration-200 hover:translate-y-[-4px]"
            style={{
              backgroundColor: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.04)',
            }}
            whileHover={{ scale: 1.02 }}
          >
            <span className="text-xs sm:text-sm font-medium text-text-primary">{t('dashboard.rankings', language)}</span>
            <p className="text-[10px] sm:text-xs text-text-secondary mt-1">{t('dashboard.rankingsDesc', language)}</p>
          </motion.button>
          <motion.button
            onClick={() => navigate('/insights')}
            className="rounded-xl sm:rounded-2xl p-3 sm:p-4 text-left transition-all duration-200 hover:translate-y-[-4px]"
            style={{
              backgroundColor: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.04)',
            }}
            whileHover={{ scale: 1.02 }}
          >
            <span className="text-xs sm:text-sm font-medium text-text-primary">{t('dashboard.insights', language)}</span>
            <p className="text-[10px] sm:text-xs text-text-secondary mt-1">{t('dashboard.insightsDesc', language)}</p>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
