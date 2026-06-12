import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Search, X } from 'lucide-react';
import { useAllPokemon } from '@/hooks/usePokemon';
import { capitalize } from '@/utils/pokemonUtils';
import { ChartSkeleton } from '@/components/common/Skeleton';
import { useAppStore } from '@/store/useAppStore';
import { t } from '@/constants/translations';
import { getTypeIcon } from '@/constants/typeIcons';
import { GenerationBadge } from '@/components/common/GenerationBadge';

const ITEMS_PER_PAGE = 20;

export function FavoritesPage() {
  const navigate = useNavigate();
  const { data: pokemonList, isLoading } = useAllPokemon();
  const [search, setSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const { language, favorites, removeFavorite } = useAppStore();

  const favoritePokemon = useMemo(() => {
    if (!pokemonList) return [];
    return pokemonList
      .filter((p) => favorites.includes(p.id))
      .filter((p) => !search || p.name.toLowerCase().includes(search.toLowerCase()));
  }, [pokemonList, favorites, search]);

  const visiblePokemon = favoritePokemon.slice(0, visibleCount);
  const hasMore = visibleCount < favoritePokemon.length;

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
        <div className="space-y-1 sm:space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text">{t('favorites.title', language)}</h1>
          <p className="text-xs sm:text-sm text-text-secondary">{t('common.loading', language)}</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ChartSkeleton key={i} height="h-36 sm:h-48" />
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
        <div className="flex items-center gap-2 sm:gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text">{t('favorites.title', language)}</h1>
          <span className="px-2 py-0.5 rounded-full bg-accent/20 text-accent-light text-[10px] sm:text-xs font-bold">
            {favoritePokemon.length}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-text-secondary">
          {t('favorites.subtitle', language)}
        </p>
      </motion.div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={14} />
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setVisibleCount(ITEMS_PER_PAGE); }}
          placeholder={t('explorer.search', language)}
          className="w-full bg-dark-hover border border-dark-border rounded-xl py-2 sm:py-2.5 pl-9 pr-4 text-xs sm:text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent transition-colors"
          aria-label={t('favorites.searchAria', language)}
        />
      </div>

      {favoritePokemon.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 sm:p-12 text-center"
        >
          <Heart size={40} className="mx-auto mb-3 sm:mb-4 text-text-secondary/30" />
          <h2 className="text-base sm:text-lg font-semibold text-text-primary mb-1 sm:mb-2">{t('favorites.empty', language)}</h2>
          <p className="text-xs sm:text-sm text-text-secondary mb-4 sm:mb-6">{t('favorites.emptyDesc', language)}</p>
          <button
            onClick={() => navigate('/explorer')}
            className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-accent text-white text-xs sm:text-sm font-semibold hover:bg-accent-light transition-colors"
          >
            {t('favorites.explore', language)}
          </button>
        </motion.div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {visiblePokemon.map((pokemon, index) => (
              <motion.button
                key={pokemon.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (index % ITEMS_PER_PAGE) * 0.03 }}
                onClick={() => navigate(`/pokemon/${pokemon.id}`)}
                className="glass-card-hover p-3 sm:p-4 text-left w-full cursor-pointer group relative"
              >
                {/* Generation Badge */}
                <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2">
                  <GenerationBadge pokemonId={pokemon.id} size="sm" />
                </div>

                {/* Remove favorite button */}
                <button
                  onClick={(e) => { e.stopPropagation(); removeFavorite(pokemon.id); }}
                  className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 p-1 rounded-full bg-danger/20 text-danger opacity-0 group-hover:opacity-100 transition-opacity hover:bg-danger/40"
                  aria-label={`${t('favorites.removeAria', language)} ${pokemon.name}`}
                >
                  <X size={12} />
                </button>

                <div className="flex items-center gap-3 sm:gap-4">
                  <img
                    src={pokemon.imageUrl}
                    alt={pokemon.name}
                    className="w-12 h-12 sm:w-16 sm:h-16 object-contain group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] sm:text-xs text-text-secondary">
                      #{String(pokemon.id).padStart(3, '0')}
                    </p>
                    <p className="text-xs sm:text-sm font-semibold text-text-primary truncate">
                      {capitalize(pokemon.name)}
                    </p>
                    <div className="flex gap-1 mt-1 flex-wrap">
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
                  <div className="text-right">
                    <p className="text-base sm:text-lg font-bold gradient-text">{pokemon.totalStats}</p>
                    <p className="text-[8px] sm:text-[10px] text-text-secondary">{t('common.total', language)}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {hasMore && (
            <div className="text-center py-3 sm:py-4">
              <button
                onClick={() => setVisibleCount((prev) => prev + ITEMS_PER_PAGE)}
                className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-accent/10 text-accent-light text-xs sm:text-sm font-medium hover:bg-accent/20 transition-colors"
              >
                {t('favorites.loadMore', language)} ({favoritePokemon.length - visibleCount} {t('favorites.remaining', language)})
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
