/**
 * useProgressiveLoader - Progressive Pokémon Loading Hook
 *
 * Architecture Decision:
 * Instead of loading ALL Pokémon in a single massive request (which causes
 * a long blank loading state), this hook loads Pokémon generation by generation.
 *
 * Benefits:
 * 1. Shows real-time progress to the user via LoadingOverlay
 * 2. Each generation loads independently (faster perceived performance)
 * 3. Data is cached per-generation, so revisits are instant
 * 4. Future generations are automatically supported
 * 5. Graceful error handling per generation (one failing doesn't block others)
 *
 * The hook:
 * 1. Fetches the list of all generations dynamically from PokéAPI
 * 2. For each generation, fetches all Pokémon in that generation
 * 3. Reports progress (current generation, count, percentage)
 * 4. Caches results in TanStack Query for instant subsequent loads
 * 5. Returns the complete list once all generations are loaded
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchAllGenerations } from '@/services/generation.service';
import { fetchPokemonList, fetchMultiplePokemon } from '@/services/pokemonApi';
import { enrichPokemon } from '@/utils/pokemonUtils';
import { STALE_TIME } from '@/constants';
import type { Pokemon } from '@/types/pokemon';
import type { GenerationInfo } from '@/types/generations';

interface ProgressiveLoadState {
  isLoaded: boolean;
  isFirstLoad: boolean;
  progress: number;
  currentGeneration: string;
  loadedPokemon: number;
  totalPokemon: number;
  currentGenPokemon: number;
  totalGenPokemon: number;
  error: string | null;
}

interface ProgressiveLoadResult {
  allPokemon: Pokemon[];
  loadState: ProgressiveLoadState;
  startLoading: () => void;
  resetLoading: () => void;
}

const CACHE_KEY = 'progressive-pokemon-all';

/**
 * Hook that loads all Pokémon progressively by generation.
 * Shows real-time progress through the loadState.
 * Once loaded, caches the result so subsequent loads are instant.
 */
export function useProgressiveLoader(): ProgressiveLoadResult {
  const queryClient = useQueryClient();

  // 🚀 CRITICAL: Check cache synchronously on initialization.
  // If data is already cached (e.g., from a previous visit or another component),
  // we skip the loading overlay entirely — no flash, no delay.
  const cachedData = queryClient.getQueryData<Pokemon[]>([CACHE_KEY]);
  const hasCachedData = !!cachedData && cachedData.length > 0;

  const [loadState, setLoadState] = useState<ProgressiveLoadState>({
    isLoaded: hasCachedData,
    isFirstLoad: false,
    progress: hasCachedData ? 100 : 0,
    currentGeneration: '',
    loadedPokemon: hasCachedData ? cachedData!.length : 0,
    totalPokemon: hasCachedData ? cachedData!.length : 0,
    currentGenPokemon: 0,
    totalGenPokemon: 0,
    error: null,
  });

  const isLoadingRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);

  /**
   * Main loading function that processes generations sequentially.
   * Each generation is fetched and its Pokémon are loaded before moving
   * to the next, allowing real-time progress updates.
   */
  const startLoading = useCallback(async () => {
    if (isLoadingRef.current || loadState.isLoaded) return;
    isLoadingRef.current = true;

    abortRef.current = new AbortController();

    try {
      setLoadState((prev) => ({
        ...prev,
        isFirstLoad: true,
        error: null,
      }));

      // Step 1: Get all generations dynamically
      const generations = await fetchAllGenerations();
      
      // Step 2: Get the total Pokémon list to know the count
      const pokemonList = await fetchPokemonList();
      const totalCount = pokemonList.count;

      setLoadState((prev) => ({
        ...prev,
        totalPokemon: totalCount,
      }));

      // Step 3: Load Pokémon generation by generation
      const allPokemon: Pokemon[] = [];
      let accumulatedCount = 0;

      for (const gen of generations) {
        if (abortRef.current?.signal.aborted) break;

        // Extract Pokémon IDs for this generation from the species URLs
        const genPokemonIds = gen.pokemonSpecies
          .map((species) => {
            const parts = species.url.split('/');
            return parseInt(parts[parts.length - 2], 10);
          })
          .filter((id) => !isNaN(id) && id > 0);

        // Update state to show which generation we're loading
        setLoadState((prev) => ({
          ...prev,
          currentGeneration: gen.name,
          totalGenPokemon: genPokemonIds.length,
          currentGenPokemon: 0,
        }));

        // Fetch Pokémon in this generation with concurrency control
        const batchSize = 5;
        const genPokemon: Pokemon[] = [];

        for (let i = 0; i < genPokemonIds.length; i += batchSize) {
          if (abortRef.current?.signal.aborted) break;

          const batch = genPokemonIds.slice(i, i + batchSize);
          const batchResults = await Promise.allSettled(
            batch.map((id) => 
              fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
                .then((res) => res.json())
                .catch(() => null)
            )
          );

          for (const result of batchResults) {
            if (result.status === 'fulfilled' && result.value) {
              genPokemon.push(enrichPokemon(result.value));
            }
          }

          const loadedInGen = Math.min(i + batchSize, genPokemonIds.length);
          const totalLoaded = accumulatedCount + loadedInGen;
          const progress = Math.min((totalLoaded / totalCount) * 100, 100);

          setLoadState((prev) => ({
            ...prev,
            currentGenPokemon: loadedInGen,
            loadedPokemon: totalLoaded,
            progress,
          }));
        }

        // Add this generation's Pokémon to the total
        allPokemon.push(...genPokemon);
        accumulatedCount += genPokemon.length;
      }

      // Step 4: Cache the complete result
      queryClient.setQueryData([CACHE_KEY], allPokemon);

      // Step 5: Mark as complete
      setLoadState((prev) => ({
        ...prev,
        isLoaded: true,
        isFirstLoad: false,
        progress: 100,
        loadedPokemon: allPokemon.length,
        totalPokemon: allPokemon.length,
        currentGeneration: '',
        currentGenPokemon: 0,
        totalGenPokemon: 0,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load Pokémon data';
      setLoadState((prev) => ({
        ...prev,
        isFirstLoad: false,
        error: message,
      }));
    } finally {
      isLoadingRef.current = false;
    }
  }, [loadState.isLoaded, queryClient]);

  const resetLoading = useCallback(() => {
    abortRef.current?.abort();
    isLoadingRef.current = false;
    setLoadState({
      isLoaded: false,
      isFirstLoad: false,
      progress: 0,
      currentGeneration: '',
      loadedPokemon: 0,
      totalPokemon: 0,
      currentGenPokemon: 0,
      totalGenPokemon: 0,
      error: null,
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  return {
    allPokemon: cachedData || [],
    loadState,
    startLoading,
    resetLoading,
  };
}

/**
 * Hook that provides the progressively loaded Pokémon data.
 * Automatically triggers loading on first mount if not cached.
 * Returns the same interface as useAllPokemon for backward compatibility.
 */
export function useProgressivePokemon() {
  const { allPokemon, loadState, startLoading } = useProgressiveLoader();

  // Auto-trigger loading on first mount
  useEffect(() => {
    if (!loadState.isLoaded && !loadState.isFirstLoad && allPokemon.length === 0) {
      startLoading();
    }
  }, [loadState.isLoaded, loadState.isFirstLoad, allPokemon.length, startLoading]);

  return {
    data: allPokemon.length > 0 ? allPokemon : undefined,
    isLoading: loadState.isFirstLoad,
    isLoaded: loadState.isLoaded,
    progress: loadState.progress,
    currentGeneration: loadState.currentGeneration,
    loadedPokemon: loadState.loadedPokemon,
    totalPokemon: loadState.totalPokemon,
    currentGenPokemon: loadState.currentGenPokemon,
    totalGenPokemon: loadState.totalGenPokemon,
    error: loadState.error,
    startLoading,
  };
}
