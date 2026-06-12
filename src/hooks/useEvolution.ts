/**
 * Evolution Hook
 * 
 * Provides React hooks for fetching and managing Pokémon evolution data.
 * Supports complex evolution trees with caching via TanStack Query.
 */

import { useQuery } from '@tanstack/react-query';
import { fetchEvolutionChain, fetchEvolutionChainBySpeciesId, flattenEvolutionChain, canEvolveFurther, getEvolutionStage } from '@/services/evolution.service';
import { STALE_TIME } from '@/constants';
import type { EvolutionChainData, EvolutionNode } from '@/services/evolution.service';

/**
 * Hook to fetch an evolution chain by its ID.
 */
export function useEvolutionChain(chainId: number) {
  return useQuery<EvolutionChainData | null>({
    queryKey: ['evolution-chain', chainId],
    queryFn: () => fetchEvolutionChain(chainId),
    staleTime: STALE_TIME,
    enabled: !!chainId && chainId > 0,
    retry: 2,
  });
}

/**
 * Hook to fetch an evolution chain by a Pokémon's species ID.
 */
export function useEvolutionChainBySpecies(speciesId: number) {
  return useQuery<EvolutionChainData | null>({
    queryKey: ['evolution-chain-by-species', speciesId],
    queryFn: () => fetchEvolutionChainBySpeciesId(speciesId),
    staleTime: STALE_TIME,
    enabled: !!speciesId && speciesId > 0,
    retry: 2,
  });
}

/**
 * Hook to get the flattened evolution list for a Pokémon.
 * Returns an ordered array of species names in the evolution chain.
 */
export function useEvolutionList(speciesId: number) {
  const { data: chain, isLoading, error } = useEvolutionChainBySpecies(speciesId);

  const evolutionList = chain
    ? flattenEvolutionChain(chain.chain)
    : [];

  return {
    evolutionList,
    chain,
    isLoading,
    error,
  };
}

/**
 * Hook to check if a Pokémon can evolve further.
 */
export function useCanEvolve(speciesName: string, speciesId: number) {
  const { data: chain } = useEvolutionChainBySpecies(speciesId);

  if (!chain) return { canEvolve: false, isLoading: true };

  return {
    canEvolve: canEvolveFurther(speciesName, chain.chain),
    evolutionStage: getEvolutionStage(speciesName, chain.chain),
    isLoading: false,
  };
}

/**
 * Hook to get evolution chain data enriched with Pokémon images.
 * Returns evolution nodes with image URLs for rendering evolution trees.
 */
export function useEvolutionWithImages(
  speciesId: number,
  pokemonImageMap: Map<string, { id: number; imageUrl: string; artworkUrl: string; types: { type: { name: string } }[] }>
) {
  const { data: chain, isLoading, error } = useEvolutionChainBySpecies(speciesId);

  if (!chain || !pokemonImageMap) {
    return { evolutionData: null, isLoading, error };
  }

  const evolutionData = chain.all_species
    .map((name) => {
      const p = pokemonImageMap.get(name.toLowerCase());
      return {
        name,
        id: p?.id ?? 0,
        imageUrl: p?.artworkUrl ?? '',
        types: p?.types ?? [],
      };
    })
    .filter((e) => e.id > 0);

  return { evolutionData, chain, isLoading, error };
}
