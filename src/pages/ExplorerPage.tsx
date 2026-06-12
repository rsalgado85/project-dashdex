import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, X } from 'lucide-react';
import { useAllPokemon } from '@/hooks/usePokemon';
import { capitalize } from '@/utils/pokemonUtils';
import { ChartSkeleton } from '@/components/common/Skeleton';
import { useAppStore } from '@/store/useAppStore';
import { t } from '@/constants/translations';
import { getTypeIcon } from '@/constants/typeIcons';
import { GenerationBadge } from '@/components/common/GenerationBadge';
import type { PokemonWithStats } from '@/types/pokemon';

const ITEMS_PER_PAGE = 20;

const POKEMON_TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy',
];

const GENERATIONS = [
  { id: 0, label: 'All Generations' },
  { id: 1, label: 'Gen I - Kanto' },
  { id: 2, label: 'Gen II - Johto' },
  { id: 3, label: 'Gen III - Hoenn' },
  { id: 4, label: 'Gen IV - Sinnoh' },
  { id: 5, label: 'Gen V - Unova' },
  { id: 6, label: 'Gen VI - Kalos' },
  { id: 7, label: 'Gen VII - Alola' },
  { id: 8, label: 'Gen VIII - Galar' },
  { id: 9, label: 'Gen IX - Paldea' },
];

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

export function ExplorerPage() {
  const navigate = useNavigate();
  const { data: pokemonList, isLoading } = useAllPokemon();
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedGen, setSelectedGen] = useState<number>(0);
  const [weightRange, setWeightRange] = useState<string>('');
  const [heightRange, setHeightRange] = useState<string>('');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const { language } = useAppStore();

  const filteredPokemon = useMemo(() => {
    if (!pokemonList) return [];

    return pokemonList.filter((pokemon) => {
      const nameMatch = pokemon.name.toLowerCase().includes(search.toLowerCase());
      const typeMatch = !selectedType || pokemon.types.some((t) => t.type.name === selectedType);
      const genMatch = selectedGen === 0 || getGenerationId(pokemon.id) === selectedGen;
      
      const weight = pokemon.weight / 10;
      const weightMatch = !weightRange || (() => {
        const [min, max] = weightRange.split('-').map(Number);
        return weight >= min && (max ? weight <= max : true);
      })();

      const height = pokemon.height / 10;
      const heightMatch = !heightRange || (() => {
        const [min, max] = heightRange.split('-').map(Number);
        return height >= min && (max ? height <= max : true);
      })();

      return nameMatch && typeMatch && genMatch && weightMatch && heightMatch;
    });
  }, [pokemonList, search, selectedType, selectedGen, weightRange, heightRange]);

  const visiblePokemon = useMemo(
    () => filteredPokemon.slice(0, visibleCount),
    [filteredPokemon, visibleCount]
  );

  const hasMore = visibleCount < filteredPokemon.length;

  // Infinite scroll
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [hasMore]);

  const clearFilters = useCallback(() => {
    setSearch('');
    setSelectedType('');
    setSelectedGen(0);
    setWeightRange('');
    setHeightRange('');
    setVisibleCount(ITEMS_PER_PAGE);
  }, []);

  const hasFilters = search || selectedType || selectedGen > 0 || weightRange || heightRange;

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
        <div className="space-y-1 sm:space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text">{t('explorer.title', language)}</h1>
          <p className="text-xs sm:text-sm text-text-secondary">{t('common.loading', language)}</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
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
        <h1 className="text-2xl sm:text-3xl font-bold gradient-text">{t('explorer.title', language)}</h1>
        <p className="text-xs sm:text-sm text-text-secondary">
          {t('explorer.subtitle', language)}
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-3 sm:p-4 space-y-3 sm:space-y-4"
      >
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-text-secondary" />
          <span className="text-xs sm:text-sm font-medium text-text-primary">{t('common.filters', language)}</span>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="ml-auto flex items-center gap-1 text-[10px] sm:text-xs text-accent-light hover:text-accent transition-colors"
            >
              <X size={12} />
              {t('common.clearAll', language)}
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-4">
          {/* Search */}
          <div className="relative col-span-2 sm:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={14} />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setVisibleCount(ITEMS_PER_PAGE); }}
              placeholder={t('explorer.search', language)}
              className="w-full bg-dark-hover border border-dark-border rounded-xl py-2 pl-9 pr-3 text-xs sm:text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent transition-colors"
              aria-label={t('explorer.searchAria', language)}
            />
          </div>

          {/* Generation filter */}
          <select
            value={selectedGen}
            onChange={(e) => { setSelectedGen(Number(e.target.value)); setVisibleCount(ITEMS_PER_PAGE); }}
            className="bg-dark-hover border border-dark-border rounded-xl py-2 px-3 text-xs sm:text-sm text-text-primary focus:outline-none focus:border-accent transition-colors"
            aria-label="Filter by generation"
          >
            {GENERATIONS.map((gen) => (
              <option key={gen.id} value={gen.id}>{gen.label}</option>
            ))}
          </select>

          {/* Type filter */}
          <select
            value={selectedType}
            onChange={(e) => { setSelectedType(e.target.value); setVisibleCount(ITEMS_PER_PAGE); }}
            className="bg-dark-hover border border-dark-border rounded-xl py-2 px-3 text-xs sm:text-sm text-text-primary focus:outline-none focus:border-accent transition-colors"
            aria-label={t('explorer.filterType', language)}
          >
            <option value="">{t('explorer.allTypes', language)}</option>
            {POKEMON_TYPES.map((type) => (
              <option key={type} value={type}>
                {capitalize(type)}
              </option>
            ))}
          </select>

          {/* Weight filter */}
          <select
            value={weightRange}
            onChange={(e) => { setWeightRange(e.target.value); setVisibleCount(ITEMS_PER_PAGE); }}
            className="bg-dark-hover border border-dark-border rounded-xl py-2 px-3 text-xs sm:text-sm text-text-primary focus:outline-none focus:border-accent transition-colors"
            aria-label={t('explorer.filterWeight', language)}
          >
            <option value="">{t('explorer.allWeights', language)}</option>
            <option value="0-50">0 - 50 kg</option>
            <option value="50-100">50 - 100 kg</option>
            <option value="100-200">100 - 200 kg</option>
            <option value="200-500">200 - 500 kg</option>
            <option value="500-1000">500 - 1000 kg</option>
            <option value="1000-9999">1000+ kg</option>
          </select>

          {/* Height filter */}
          <select
            value={heightRange}
            onChange={(e) => { setHeightRange(e.target.value); setVisibleCount(ITEMS_PER_PAGE); }}
            className="bg-dark-hover border border-dark-border rounded-xl py-2 px-3 text-xs sm:text-sm text-text-primary focus:outline-none focus:border-accent transition-colors"
            aria-label={t('explorer.filterHeight', language)}
          >
            <option value="">{t('explorer.allHeights', language)}</option>
            <option value="0-5">0 - 5 m</option>
            <option value="5-10">5 - 10 m</option>
            <option value="10-15">10 - 15 m</option>
            <option value="15-20">15 - 20 m</option>
            <option value="20-25">20 - 25 m</option>
            <option value="25-999">25+ m</option>
          </select>
        </div>

        <p className="text-[10px] sm:text-xs text-text-secondary">
          {t('explorer.showing', language)} {visiblePokemon.length} {t('explorer.of', language)} {filteredPokemon.length} {t('common.pokemon', language)}
        </p>
      </motion.div>

      {/* Pokémon Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {visiblePokemon.map((pokemon, index) => (
          <PokemonCard
            key={pokemon.id}
            pokemon={pokemon}
            index={index}
            onClick={() => navigate(`/pokemon/${pokemon.id}`)}
            language={language}
          />
        ))}
      </div>

      {/* Load more trigger */}
      <div ref={loadMoreRef} className="h-8 sm:h-10" />

      {!hasMore && visiblePokemon.length > 0 && (
        <p className="text-center text-text-secondary text-xs sm:text-sm py-3 sm:py-4">
          {t('explorer.loaded', language)}
        </p>
      )}
    </div>
  );
}

function PokemonCard({ pokemon, index, onClick, language }: {
  pokemon: PokemonWithStats;
  index: number;
  onClick: () => void;
  language: 'en' | 'es';
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (index % ITEMS_PER_PAGE) * 0.03 }}
      whileHover={{ scale: 1.03, y: -4 }}
      className="glass-card-hover p-3 sm:p-4 text-left w-full cursor-pointer group relative"
    >
      {/* Generation Badge - top right */}
      <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2">
        <GenerationBadge pokemonId={pokemon.id} size="sm" />
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {imgError ? (
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-accent/20 to-accent-light/20 flex items-center justify-center flex-shrink-0">
            <span className="text-lg font-bold text-accent-light">#{pokemon.id}</span>
          </div>
        ) : (
          <img
            src={pokemon.imageUrl}
            alt={pokemon.name}
            className="w-12 h-12 sm:w-16 sm:h-16 object-contain group-hover:scale-110 transition-transform duration-300"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        )}
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
  );
}
