/**
 * Generations Hook
 * 
 * Provides React hooks for fetching and managing Pokémon generation data.
 * Uses TanStack Query for caching, deduplication, and background refetching.
 * All generations are loaded dynamically from PokéAPI - no hardcoded lists.
 */

import { useQuery } from '@tanstack/react-query';
import { fetchAllGenerations, fetchGeneration, fetchGenerationsList, getGenerationIdFromPokemonId, getGenerationDisplayName } from '@/services/generation.service';
import { STALE_TIME } from '@/constants';
import type { GenerationInfo, Generation } from '@/types/generations';

/**
 * Hook to fetch all generations with their details.
 * This is the main hook for generation data across the app.
 */
export function useAllGenerations() {
  return useQuery<GenerationInfo[]>({
    queryKey: ['all-generations'],
    queryFn: fetchAllGenerations,
    staleTime: STALE_TIME,
    retry: 3,
  });
}

/**
 * Hook to fetch a specific generation by ID.
 */
export function useGeneration(id: number) {
  return useQuery<Generation>({
    queryKey: ['generation', id],
    queryFn: () => fetchGeneration(id),
    staleTime: STALE_TIME,
    enabled: !!id && id > 0,
    retry: 2,
  });
}

/**
 * Hook to get the generation ID for a given Pokémon ID.
 * This is a synchronous computation, no API call needed.
 */
export function usePokemonGeneration(pokemonId: number) {
  const generationId = getGenerationIdFromPokemonId(pokemonId);
  const displayName = getGenerationDisplayName(generationId);
  
  return {
    generationId,
    displayName,
  };
}

/**
 * Hook to get all available generation names for filter dropdowns.
 */
export function useGenerationOptions() {
  const { data: generations, isLoading, error } = useAllGenerations();

  const options = generations
    ? generations.map((gen) => ({
        id: gen.id,
        name: gen.name,
        displayName: gen.displayName,
        region: gen.region,
        pokemonCount: gen.pokemonCount,
      }))
    : [];

  return { options, isLoading, error };
}

/**
 * Hook to get the list of generations list (basic, without details).
 */
export function useGenerationsList() {
  return useQuery({
    queryKey: ['generations-list'],
    queryFn: fetchGenerationsList,
    staleTime: STALE_TIME,
  });
}
