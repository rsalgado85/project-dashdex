/**
 * Pokémon Data Context Provider
 * 
 * Provides global access to Pokémon data across the application.
 * Uses TanStack Query under the hood for caching and deduplication.
 * This context is optional - components can still use hooks directly.
 * 
 * Architecture Decision:
 * - We use Context + TanStack Query (not Redux) for Pokémon data
 * - TanStack Query handles caching, refetching, and deduplication
 * - Context provides convenient access without prop drilling
 * - Zustand continues to handle UI state (favorites, theme, etc.)
 */

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useAllPokemon } from '@/hooks/usePokemon';
import { useAllGenerations } from '@/hooks/useGenerations';
import type { PokemonWithStats } from '@/types/pokemon';
import type { GenerationInfo } from '@/types/generations';

interface PokemonContextValue {
  // Pokémon data
  allPokemon: PokemonWithStats[] | undefined;
  isLoading: boolean;
  error: Error | null;
  
  // Generations
  generations: GenerationInfo[] | undefined;
  generationsLoading: boolean;
  
  // Derived data
  pokemonById: Map<number, PokemonWithStats>;
  pokemonByName: Map<string, PokemonWithStats>;
  
  // Utility
  getPokemonById: (id: number) => PokemonWithStats | undefined;
  getPokemonByName: (name: string) => PokemonWithStats | undefined;
}

const PokemonContext = createContext<PokemonContextValue | null>(null);

export function PokemonProvider({ children }: { children: ReactNode }) {
  const { data: allPokemon, isLoading, error } = useAllPokemon();
  const { data: generations, isLoading: generationsLoading } = useAllGenerations();

  const value = useMemo<PokemonContextValue>(() => {
    // Build lookup maps
    const pokemonById = new Map<number, PokemonWithStats>();
    const pokemonByName = new Map<string, PokemonWithStats>();

    if (allPokemon) {
      for (const p of allPokemon) {
        pokemonById.set(p.id, p);
        pokemonByName.set(p.name.toLowerCase(), p);
      }
    }

    return {
      allPokemon,
      isLoading,
      error: error as Error | null,
      generations,
      generationsLoading,
      pokemonById,
      pokemonByName,
      getPokemonById: (id: number) => pokemonById.get(id),
      getPokemonByName: (name: string) => pokemonByName.get(name.toLowerCase()),
    };
  }, [allPokemon, isLoading, error, generations, generationsLoading]);

  return (
    <PokemonContext.Provider value={value}>
      {children}
    </PokemonContext.Provider>
  );
}

/**
 * Hook to access Pokémon data context.
 * Falls back to direct hook usage if context is not available.
 */
export function usePokemonContext(): PokemonContextValue {
  const context = useContext(PokemonContext);
  if (!context) {
    // Fallback: use hooks directly if no provider
    const { data: allPokemon, isLoading, error } = useAllPokemon();
    const { data: generations, isLoading: generationsLoading } = useAllGenerations();

    const pokemonById = new Map<number, PokemonWithStats>();
    const pokemonByName = new Map<string, PokemonWithStats>();

    if (allPokemon) {
      for (const p of allPokemon) {
        pokemonById.set(p.id, p);
        pokemonByName.set(p.name.toLowerCase(), p);
      }
    }

    return {
      allPokemon,
      isLoading,
      error: error as Error | null,
      generations,
      generationsLoading,
      pokemonById,
      pokemonByName,
      getPokemonById: (id: number) => pokemonById.get(id),
      getPokemonByName: (name: string) => pokemonByName.get(name.toLowerCase()),
    };
  }
  return context;
}
