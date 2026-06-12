import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Swords, X, Plus, Search } from 'lucide-react';
import { useAllPokemon } from '@/hooks/usePokemon';
import { capitalize } from '@/utils/pokemonUtils';
import { ChartSkeleton } from '@/components/common/Skeleton';
import { BaseStatsRadarChart } from '@/components/charts/BaseStatsRadarChart';
import { useAppStore } from '@/store/useAppStore';
import { t } from '@/constants/translations';
import { getTypeIcon } from '@/constants/typeIcons';
import { GenerationBadge } from '@/components/common/GenerationBadge';
import type { PokemonWithStats } from '@/types/pokemon';

const MAX_COMPARE = 4;

export function ComparePage() {
  const { data: pokemonList, isLoading } = useAllPokemon();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSelector, setShowSelector] = useState(false);
  const { language } = useAppStore();

  const selectedPokemon = useMemo(() => {
    if (!pokemonList) return [];
    return selectedIds.map((id) => pokemonList.find((p) => p.id === id)).filter(Boolean) as PokemonWithStats[];
  }, [pokemonList, selectedIds]);

  const searchResults = useMemo(() => {
    if (!pokemonList || !searchQuery) return [];
    return pokemonList
      .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .filter((p) => !selectedIds.includes(p.id))
      .slice(0, 10);
  }, [pokemonList, searchQuery, selectedIds]);

  const addPokemon = (id: number) => {
    if (selectedIds.length < MAX_COMPARE && !selectedIds.includes(id)) {
      setSelectedIds((prev) => [...prev, id]);
      setSearchQuery('');
      setShowSelector(false);
    }
  };

  const removePokemon = (id: number) => {
    setSelectedIds((prev) => prev.filter((pid) => pid !== id));
  };

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
        <div className="space-y-1 sm:space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text">{t('compare.title', language)}</h1>
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
        <h1 className="text-2xl sm:text-3xl font-bold gradient-text">{t('compare.title', language)}</h1>
        <p className="text-xs sm:text-sm text-text-secondary">
          {t('compare.subtitle', language)}
        </p>
      </motion.div>

      {/* Pokémon Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: MAX_COMPARE }).map((_, index) => {
          const pokemon = selectedPokemon[index];
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-3 sm:p-4 min-h-[120px] sm:min-h-[140px] flex flex-col items-center justify-center relative"
            >
              {pokemon ? (
                <>
                  <button
                    onClick={() => removePokemon(pokemon.id)}
                    className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 p-1 rounded-full bg-danger/20 text-danger hover:bg-danger/40 transition-colors"
                    aria-label={`${t('compare.removeAria', language)} ${pokemon.name}`}
                  >
                    <X size={12} />
                  </button>
                  <img
                    src={pokemon.imageUrl}
                    alt={pokemon.name}
                    className="w-14 h-14 sm:w-20 sm:h-20 object-contain mb-1 sm:mb-2"
                  />
                  <p className="text-[10px] sm:text-xs text-text-secondary">
                    #{String(pokemon.id).padStart(3, '0')}
                  </p>
                  <p className="text-xs sm:text-sm font-semibold text-text-primary truncate max-w-full">
                    {capitalize(pokemon.name)}
                  </p>
                  <div className="flex gap-1 mt-1 flex-wrap justify-center">
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
                  <GenerationBadge pokemonId={pokemon.id} size="sm" />
                </>
              ) : (
                <button
                  onClick={() => setShowSelector(true)}
                  className="flex flex-col items-center gap-1 sm:gap-2 text-text-secondary hover:text-accent-light transition-colors"
                >
                  <Plus size={20} className="sm:w-6 sm:h-6" />
                  <span className="text-[10px] sm:text-xs">{t('compare.addPokemon', language)}</span>
                </button>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Search Selector */}
      {showSelector && selectedIds.length < MAX_COMPARE && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-3 sm:p-4"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={14} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('compare.searchPlaceholder', language)}
              className="w-full bg-dark-hover border border-dark-border rounded-xl py-2 sm:py-2.5 pl-9 pr-4 text-xs sm:text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent transition-colors"
              autoFocus
              aria-label={t('compare.searchAria', language)}
            />
          </div>
          <div className="mt-2 sm:mt-3 space-y-1 max-h-40 sm:max-h-48 overflow-y-auto">
            {searchResults.map((pokemon) => (
              <button
                key={pokemon.id}
                onClick={() => addPokemon(pokemon.id)}
                className="w-full flex items-center gap-2 sm:gap-3 p-2 rounded-lg hover:bg-dark-hover transition-colors text-left"
              >
                <img src={pokemon.imageUrl} alt={pokemon.name} className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
                <div>
                  <p className="text-xs sm:text-sm font-medium text-text-primary">{capitalize(pokemon.name)}</p>
                  <p className="text-[10px] sm:text-xs text-text-secondary">#{String(pokemon.id).padStart(3, '0')}</p>
                </div>
              </button>
            ))}
            {searchQuery && searchResults.length === 0 && (
              <p className="text-xs sm:text-sm text-text-secondary text-center py-2 sm:py-3">{t('compare.noResults', language)}</p>
            )}
          </div>
        </motion.div>
      )}

      {/* Stats Comparison */}
      {selectedPokemon.length >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-3 sm:p-4 lg:p-6"
        >
          <h2 className="text-sm sm:text-base font-semibold text-text-primary mb-3 sm:mb-4 flex items-center gap-2">
            <Swords size={16} className="text-accent-light" />
            {t('compare.statsComparison', language)}
          </h2>

          {/* Radar Chart */}
          <div className="mb-4 sm:mb-6 lg:mb-8">
            <BaseStatsRadarChart pokemon={selectedPokemon} height={350} />
          </div>

          {/* Stats Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-dark-border">
                  <th className="text-left py-2 sm:py-3 text-text-secondary font-medium">{t('common.stat', language)}</th>
                  {selectedPokemon.map((p) => (
                    <th key={p.id} className="text-center py-2 sm:py-3 text-text-primary font-semibold">
                      {capitalize(p.name)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'].map((stat) => {
                  const statLabel = stat === 'special-attack' ? 'Sp. Atk' : stat === 'special-defense' ? 'Sp. Def' : capitalize(stat);
                  return (
                    <tr key={stat} className="border-b border-dark-border/50">
                      <td className="py-2 sm:py-3 text-text-secondary">{statLabel}</td>
                      {selectedPokemon.map((p) => {
                        const value = p.stats.find((s) => s.stat.name === stat)?.base_stat || 0;
                        const maxVal = Math.max(...selectedPokemon.map((sp) => sp.stats.find((s) => s.stat.name === stat)?.base_stat || 0));
                        const isMax = value === maxVal;
                        return (
                          <td key={p.id} className={`text-center py-2 sm:py-3 font-medium ${isMax ? 'text-accent-light font-bold' : 'text-text-primary'}`}>
                            {value}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
                <tr>
                  <td className="py-2 sm:py-3 text-text-secondary font-semibold">{t('common.total', language)}</td>
                  {selectedPokemon.map((p) => {
                    const total = p.stats.reduce((sum, s) => sum + s.base_stat, 0);
                    const maxTotal = Math.max(...selectedPokemon.map((sp) => sp.stats.reduce((sum, s) => sum + s.base_stat, 0)));
                    const isMax = total === maxTotal;
                    return (
                      <td key={p.id} className={`text-center py-2 sm:py-3 font-bold ${isMax ? 'text-accent-light' : 'text-text-primary'}`}>
                        {total}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {selectedPokemon.length < 2 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-8 sm:p-12 text-center"
        >
          <Swords size={40} className="mx-auto mb-3 sm:mb-4 text-text-secondary/30" />
          <h2 className="text-base sm:text-lg font-semibold text-text-primary mb-1 sm:mb-2">{t('compare.selectPrompt', language)}</h2>
          <p className="text-xs sm:text-sm text-text-secondary">{t('compare.selectDesc', language)}</p>
        </motion.div>
      )}
    </div>
  );
}
