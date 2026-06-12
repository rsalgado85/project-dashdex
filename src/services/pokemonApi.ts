/**
 * Pokémon API Service
 * 
 * Architecture Decision:
 * We use Axios with a singleton instance for consistent request handling.
 * The service layer abstracts all PokéAPI interactions, providing typed methods
 * that the hooks layer consumes. This separation of concerns allows us to:
 * 1. Easily swap API clients if needed
 * 2. Add interceptors for caching, logging, error handling
 * 3. Keep components clean from data-fetching logic
 */

import axios from 'axios';
import { API_BASE_URL, POKEMON_LIMIT } from '@/constants';
import { cacheManager } from '@/cache/cacheManager';
import type {
  Pokemon,
  PokemonListResponse,
  PokemonSpecies,
  EvolutionChain,
  TypeResponse,
  Ability,
} from '@/types/pokemon';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Cache keys
const CACHE_KEYS = {
  POKEMON_LIST: 'pokemon_list',
  POKEMON: (id: number | string) => `pokemon_${id}`,
  SPECIES: (id: number) => `species_${id}`,
  EVOLUTION: (id: number) => `evolution_${id}`,
  TYPE: (name: string) => `type_${name}`,
  ABILITY: (name: string) => `ability_${name}`,
};

/**
 * Fetches the list of all Pokémon with caching.
 * Checks LocalStorage cache first before making API call.
 * 
 * Uses a generous limit (POKEMON_LIMIT = 2000) to ensure ALL Pokémon
 * including future generations are loaded in a single request.
 * The PokéAPI returns the actual count in the response, which we use
 * downstream to determine how many Pokémon to fetch individually.
 * 
 * This single-request approach is faster than a two-step approach
 * (count + full list) since the API returns the count in every response.
 */
export async function fetchPokemonList(): Promise<PokemonListResponse> {
  const cacheKey = CACHE_KEYS.POKEMON_LIST;
  const cached = cacheManager.get<PokemonListResponse>(cacheKey);
  if (cached) return cached;

  const { data } = await api.get<PokemonListResponse>(`/pokemon?limit=${POKEMON_LIMIT}`);
  cacheManager.set(cacheKey, data);
  return data;
}

/**
 * Fetches a single Pokémon by ID or name with caching.
 * Only caches lightweight data in localStorage; full Pokémon data
 * (with sprites) is cached in-memory by TanStack Query.
 */
export async function fetchPokemon(id: number | string): Promise<Pokemon> {
  const cacheKey = CACHE_KEYS.POKEMON(id);
  const cached = cacheManager.get<Pokemon>(cacheKey);
  if (cached) return cached;

  const { data } = await api.get<Pokemon>(`/pokemon/${id}`);
  // Cache individual Pokémon data (lightweight entries only)
  // The enriched blob cache in useAllPokemon handles the full dataset
  const size = JSON.stringify(data).length;
  if (size < 50000) { // ~50KB limit for individual entries
    cacheManager.set(cacheKey, data);
  }
  return data;
}

/**
 * Fetches Pokémon species data for flavor text and evolution info.
 */
export async function fetchPokemonSpecies(id: number): Promise<PokemonSpecies> {
  const cacheKey = CACHE_KEYS.SPECIES(id);
  const cached = cacheManager.get<PokemonSpecies>(cacheKey);
  if (cached) return cached;

  const { data } = await api.get<PokemonSpecies>(`/pokemon-species/${id}`);
  cacheManager.set(cacheKey, data);
  return data;
}

/**
 * Fetches evolution chain data.
 */
export async function fetchEvolutionChain(id: number): Promise<EvolutionChain> {
  const cacheKey = CACHE_KEYS.EVOLUTION(id);
  const cached = cacheManager.get<EvolutionChain>(cacheKey);
  if (cached) return cached;

  const { data } = await api.get<EvolutionChain>(`/evolution-chain/${id}`);
  cacheManager.set(cacheKey, data);
  return data;
}

/**
 * Fetches all Pokémon of a specific type.
 */
export async function fetchPokemonByType(typeName: string): Promise<TypeResponse> {
  const cacheKey = CACHE_KEYS.TYPE(typeName);
  const cached = cacheManager.get<TypeResponse>(cacheKey);
  if (cached) return cached;

  const { data } = await api.get<TypeResponse>(`/type/${typeName}`);
  cacheManager.set(cacheKey, data);
  return data;
}

/**
 * Fetches ability details.
 */
export async function fetchAbility(abilityName: string): Promise<Ability> {
  const cacheKey = CACHE_KEYS.ABILITY(abilityName);
  const cached = cacheManager.get<Ability>(cacheKey);
  if (cached) return cached;

  const { data } = await api.get<Ability>(`/ability/${abilityName}`);
  cacheManager.set(cacheKey, data);
  return data;
}

/**
 * Fetches multiple Pokémon in parallel with concurrency control.
 * Used for batch loading dashboard data.
 * Handles individual fetch failures gracefully by skipping failed entries.
 */
export async function fetchMultiplePokemon(
  ids: number[],
  concurrency: number = 5
): Promise<Pokemon[]> {
  const results: Pokemon[] = [];
  
  for (let i = 0; i < ids.length; i += concurrency) {
    const batch = ids.slice(i, i + concurrency);
    const batchResults = await Promise.allSettled(
      batch.map((id) => fetchPokemon(id))
    );
    for (const result of batchResults) {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        console.warn(`Failed to fetch Pokémon, skipping:`, result.reason);
      }
    }
  }

  return results;
}
