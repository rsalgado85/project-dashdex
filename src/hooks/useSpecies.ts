/**
 * Species Hook
 * 
 * Provides React hooks for fetching and managing Pokémon species data.
 * Includes habitat, color, shape, legendary/mythical status.
 */

import { useQuery } from '@tanstack/react-query';
import { fetchSpeciesInfo, fetchMultipleSpeciesInfo } from '@/services/species.service';
import { STALE_TIME } from '@/constants';
import type { SpeciesInfo } from '@/services/species.service';

/**
 * Hook to fetch species info for a given Pokémon ID.
 */
export function useSpeciesInfo(id: number) {
  return useQuery<SpeciesInfo | null>({
    queryKey: ['species-info', id],
    queryFn: () => fetchSpeciesInfo(id),
    staleTime: STALE_TIME,
    enabled: !!id && id > 0,
    retry: 2,
  });
}

/**
 * Hook to fetch species info for multiple Pokémon IDs.
 */
export function useMultipleSpeciesInfo(ids: number[]) {
  return useQuery<Map<number, SpeciesInfo>>({
    queryKey: ['multiple-species-info', ids.sort().join(',')],
    queryFn: () => fetchMultipleSpeciesInfo(ids),
    staleTime: STALE_TIME,
    enabled: ids.length > 0,
    retry: 2,
  });
}

/**
 * Hook to get available filter options from species data.
 * Returns unique habitats, colors, shapes, and other filterable attributes.
 */
export function useSpeciesFilterOptions() {
  // These are known values from PokéAPI that don't change often
  // We provide them statically to avoid excessive API calls
  const habitats = [
    'cave', 'forest', 'grassland', 'mountain', 'rare',
    'rough-terrain', 'sea', 'urban', 'waters-edge',
  ];

  const colors = [
    'black', 'blue', 'brown', 'gray', 'green', 'pink',
    'purple', 'red', 'white', 'yellow',
  ];

  const shapes = [
    'armor', 'arms', 'ball', 'blob', 'bug-wings', 'fish',
    'heads', 'humanoid', 'legs', 'pair-wings', 'quadruped',
    'squiggle', 'tentacles', 'upright', 'wings',
  ];

  return { habitats, colors, shapes };
}
