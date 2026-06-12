import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Swords, Shield, Zap, Heart, Brain, Eye, Trophy, ChevronDown, Search } from 'lucide-react';
import { useAllPokemon } from '@/hooks/usePokemon';
import { capitalize } from '@/utils/pokemonUtils';
import { ChartSkeleton } from '@/components/common/Skeleton';
import { useAppStore } from '@/store/useAppStore';
import { t } from '@/constants/translations';
import { getTypeIcon } from '@/constants/typeIcons';
import { GenerationBadge } from '@/components/common/GenerationBadge';
import type { PokemonWithStats } from '@/types/pokemon';

type StatKey = 'hp' | 'attack' | 'defense' | 'special-attack' | 'special-defense' | 'speed';

const STAT_OPTIONS: { key: StatKey; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { key: 'hp', label: 'HP', icon: Heart },
  { key: 'attack', label: 'Attack', icon: Swords },
  { key: 'defense', label: 'Defense', icon: Shield },
  { key: 'special-attack', label: 'Sp. Atk', icon: Brain },
  { key: 'special-defense', label: 'Sp. Def', icon: Eye },
  { key: 'speed', label: 'Speed', icon: Zap },
];

const ITEMS_PER_PAGE = 20;

function RankingRow({ pokemon, rank, statKey, statLabel, language }: {
  pokemon: PokemonWithStats;
  rank: number;
  statKey: StatKey;
  statLabel: string;
  language: 'en' | 'es';
}) {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);
  const statValue = pokemon.stats.find((s) => s.stat.name === statKey)?.base_stat || 0;
  const maxStat = 255;
  const percentage = (statValue / maxStat) * 100;

  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: (rank % ITEMS_PER_PAGE) * 0.02 }}
      onClick={() => navigate(`/pokemon/${pokemon.id}`)}
      className="w-full glass-card-hover p-3 sm:p-4 text-left cursor-pointer group"
    >
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Rank */}
        <div className="flex-shrink-0 w-8 sm:w-10 text-center">
          {rank <= 3 ? (
            <Trophy size={16} className={`mx-auto ${rank === 1 ? 'text-yellow-400' : rank === 2 ? 'text-gray-300' : 'text-amber-600'}`} />
          ) : (
            <span className="text-xs sm:text-sm font-bold text-text-secondary">#{rank}</span>
          )}
        </div>

        {/* Pokémon Image with fallback */}
        {imgError ? (
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-accent/20 to-accent-light/20 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-accent-light">#{pokemon.id}</span>
          </div>
        ) : (
          <img
            src={pokemon.imageUrl}
            alt={pokemon.name}
            className="w-10 h-10 sm:w-12 sm:h-12 object-contain group-hover:scale-110 transition-transform duration-300"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-semibold text-text-primary truncate">
              {capitalize(pokemon.name)}
            </span>
            <span className="text-[10px] sm:text-xs text-text-secondary flex-shrink-0">
              #{String(pokemon.id).padStart(3, '0')}
            </span>
            <GenerationBadge pokemonId={pokemon.id} size="sm" />
          </div>
          <div className="flex gap-1 mt-0.5 sm:mt-1 flex-wrap">
            {pokemon.types.map((t) => {
              const TypeIcon = getTypeIcon(t.type.name);
              return (
                <span key={t.type.name} className={`type-badge type-${t.type.name} text-[8px] sm:text-[10px] flex items-center gap-0.5`}>
                  <TypeIcon size={7} />
                  {t.type.name}
                </span>
              );
            })}
          </div>
        </div>

        {/* Stat Value */}
        <div className="flex-shrink-0 text-right">
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-base sm:text-lg font-black gradient-text">{statValue}</span>
            <span className="text-[10px] sm:text-xs text-text-secondary">{statLabel}</span>
          </div>
          <div className="w-16 sm:w-24 h-1 sm:h-1.5 bg-dark-border rounded-full mt-1 ml-auto overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-accent to-accent-light"
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>
    </motion.button>
  );
}

export function RankingsPage() {
  const { data: pokemonList, isLoading } = useAllPokemon();
  const [selectedStat, setSelectedStat] = useState<StatKey>('attack');
  const [search, setSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const { language } = useAppStore();

  const rankedPokemon = useMemo(() => {
    if (!pokemonList) return [];

    const filtered = search
      ? pokemonList.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
      : pokemonList;

    return [...filtered].sort((a, b) => {
      const statA = a.stats.find((s) => s.stat.name === selectedStat)?.base_stat || 0;
      const statB = b.stats.find((s) => s.stat.name === selectedStat)?.base_stat || 0;
      return statB - statA;
    });
  }, [pokemonList, selectedStat, search]);

  const visiblePokemon = rankedPokemon.slice(0, visibleCount);
  const hasMore = visibleCount < rankedPokemon.length;

  const loadMore = () => setVisibleCount((prev) => prev + ITEMS_PER_PAGE);

  const selectedStatLabel = STAT_OPTIONS.find((o) => o.key === selectedStat)?.label || 'Attack';
  const SelectedIcon = STAT_OPTIONS.find((o) => o.key === selectedStat)?.icon || Swords;

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
        <div className="space-y-1 sm:space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text">{t('rankings.title', language)}</h1>
          <p className="text-xs sm:text-sm text-text-secondary">{t('common.loading', language)}</p>
        </div>
        <ChartSkeleton height="h-96" />
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
        <h1 className="text-2xl sm:text-3xl font-bold gradient-text">{t('rankings.title', language)}</h1>
        <p className="text-xs sm:text-sm text-text-secondary">
          {t('rankings.subtitle', language)}
        </p>
      </motion.div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        {/* Stat Selector */}
        <div className="relative flex-1">
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <SelectedIcon size={14} className="text-accent-light" />
          </div>
          <select
            value={selectedStat}
            onChange={(e) => { setSelectedStat(e.target.value as StatKey); setVisibleCount(ITEMS_PER_PAGE); }}
            className="w-full bg-dark-hover border border-dark-border rounded-xl py-2 sm:py-2.5 pl-9 pr-9 text-xs sm:text-sm text-text-primary focus:outline-none focus:border-accent transition-colors appearance-none"
            aria-label={t('rankings.statAria', language)}
          >
            {STAT_OPTIONS.map((opt) => (
              <option key={opt.key} value={opt.key}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
        </div>

        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={14} />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setVisibleCount(ITEMS_PER_PAGE); }}
            placeholder={t('explorer.search', language)}
            className="w-full bg-dark-hover border border-dark-border rounded-xl py-2 sm:py-2.5 pl-9 pr-4 text-xs sm:text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent transition-colors"
            aria-label={t('rankings.searchAria', language)}
          />
        </div>
      </div>

      {/* Rankings List */}
      <div className="space-y-2 sm:space-y-3">
        {visiblePokemon.map((pokemon, index) => (
          <RankingRow
            key={pokemon.id}
            pokemon={pokemon}
            rank={index + 1}
            statKey={selectedStat}
            statLabel={selectedStatLabel}
            language={language}
          />
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="text-center py-3 sm:py-4">
          <button
            onClick={loadMore}
            className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-accent/10 text-accent-light text-xs sm:text-sm font-medium hover:bg-accent/20 transition-colors"
          >
            {t('rankings.loadMore', language)} ({rankedPokemon.length - visibleCount} {t('rankings.remaining', language)})
          </button>
        </div>
      )}
    </div>
  );
}
