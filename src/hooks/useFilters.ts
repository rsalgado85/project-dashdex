/**
 * Advanced Filters Hook
 * 
 * Provides a composable filter system for Pokémon data.
 * Supports combining multiple filter criteria:
 * - Generation
 * - Type
 * - Region
 * - Habitat
 * - Color
 * - Shape
 * - Legendary / Mythical / Baby status
 * - Evolvable / Non-evolvable
 * - Search query with debounce
 */

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { getGenerationIdFromPokemonId } from '@/services/generation.service';
import type { PokemonWithStats } from '@/types/pokemon';
import type { GenerationFilter } from '@/types/generations';

const POKEMON_TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy',
];

const POKEMON_HABITATS = [
  'cave', 'forest', 'grassland', 'mountain', 'rare',
  'rough-terrain', 'sea', 'urban', 'waters-edge',
];

const POKEMON_COLORS = [
  'black', 'blue', 'brown', 'gray', 'green', 'pink',
  'purple', 'red', 'white', 'yellow',
];

const POKEMON_SHAPES = [
  'armor', 'arms', 'ball', 'blob', 'bug-wings', 'fish',
  'heads', 'humanoid', 'legs', 'pair-wings', 'quadruped',
  'squiggle', 'tentacles', 'upright', 'wings',
];

export interface FilterState {
  generationId: number | null;
  type: string | null;
  region: string | null;
  habitat: string | null;
  color: string | null;
  shape: string | null;
  isLegendary: boolean | null;
  isMythical: boolean | null;
  isBaby: boolean | null;
  isEvolvable: boolean | null;
  searchQuery: string;
}

const defaultFilterState: FilterState = {
  generationId: null,
  type: null,
  region: null,
  habitat: null,
  color: null,
  shape: null,
  isLegendary: null,
  isMythical: null,
  isBaby: null,
  isEvolvable: null,
  searchQuery: '',
};

/**
 * Hook that provides filter state management and filtered Pokémon list.
 * Uses debounced search to avoid excessive re-renders.
 */
export function useFilters(
  pokemonList: PokemonWithStats[] | undefined,
  speciesInfoMap?: Map<number, { is_legendary: boolean; is_mythical: boolean; is_baby: boolean; color: string; shape: string; habitat: string | null }>
) {
  const [filters, setFilters] = useState<FilterState>(defaultFilterState);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search query
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearch(filters.searchQuery);
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [filters.searchQuery]);

  const updateFilter = useCallback(<K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(defaultFilterState);
    setDebouncedSearch('');
  }, []);

  const hasActiveFilters = useMemo(() => {
    return Object.entries(filters).some(([key, value]) => {
      if (key === 'searchQuery') return value !== '';
      return value !== null;
    });
  }, [filters]);

  const filteredPokemon = useMemo(() => {
    if (!pokemonList) return [];

    return pokemonList.filter((pokemon) => {
      // Search filter (by name, ID, type)
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        const nameMatch = pokemon.name.toLowerCase().includes(q);
        const idMatch = String(pokemon.id).includes(q);
        const typeMatch = pokemon.types.some((t) => t.type.name.toLowerCase().includes(q));
        if (!nameMatch && !idMatch && !typeMatch) return false;
      }

      // Type filter
      if (filters.type) {
        if (!pokemon.types.some((t) => t.type.name === filters.type)) return false;
      }

      // Generation filter
      if (filters.generationId) {
        const pokemonGen = getGenerationIdFromPokemonId(pokemon.id);
        if (pokemonGen !== filters.generationId) return false;
      }

      // Species-based filters (require speciesInfoMap)
      if (speciesInfoMap) {
        const species = speciesInfoMap.get(pokemon.id);

        if (species) {
          // Color filter
          if (filters.color && species.color !== filters.color) return false;

          // Shape filter
          if (filters.shape && species.shape !== filters.shape) return false;

          // Habitat filter
          if (filters.habitat && species.habitat !== filters.habitat) return false;

          // Legendary filter
          if (filters.isLegendary !== null && species.is_legendary !== filters.isLegendary) return false;

          // Mythical filter
          if (filters.isMythical !== null && species.is_mythical !== filters.isMythical) return false;

          // Baby filter
          if (filters.isBaby !== null && species.is_baby !== filters.isBaby) return false;
        }
      }

      return true;
    });
  }, [pokemonList, debouncedSearch, filters, speciesInfoMap]);

  return {
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
    filteredPokemon,
    filterOptions: {
      types: POKEMON_TYPES,
      habitats: POKEMON_HABITATS,
      colors: POKEMON_COLORS,
      shapes: POKEMON_SHAPES,
    },
  };
}

export type UseFiltersReturn = ReturnType<typeof useFilters>;
