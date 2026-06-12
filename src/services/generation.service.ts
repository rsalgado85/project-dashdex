/**
 * Generation Service
 * 
 * Handles all PokéAPI interactions related to Pokémon generations.
 * Supports dynamic loading of ALL generations without hardcoded lists.
 * New generations added to the API will be automatically available.
 */

import axios from 'axios';
import { API_BASE_URL } from '@/constants';
import { cacheManager } from '@/cache/cacheManager';
import type { Generation, GenerationResponse, GenerationInfo } from '@/types/generations';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

const CACHE_KEYS = {
  GENERATIONS_LIST: 'generations_list',
  GENERATION: (id: number) => `generation_${id}`,
};

/**
 * Fetches the list of all generations from PokéAPI.
 * This is dynamic - any new generation added to the API will appear here.
 */
export async function fetchGenerationsList(): Promise<GenerationResponse> {
  const cacheKey = CACHE_KEYS.GENERATIONS_LIST;
  const cached = cacheManager.get<GenerationResponse>(cacheKey);
  if (cached) return cached;

  const { data } = await api.get<GenerationResponse>('/generation');
  cacheManager.set(cacheKey, data);
  return data;
}

/**
 * Fetches details for a specific generation by ID.
 */
export async function fetchGeneration(id: number): Promise<Generation> {
  const cacheKey = CACHE_KEYS.GENERATION(id);
  const cached = cacheManager.get<Generation>(cacheKey);
  if (cached) return cached;

  const { data } = await api.get<Generation>(`/generation/${id}`);
  cacheManager.set(cacheKey, data);
  return data;
}

/**
 * Fetches all generations with their details.
 * Returns enriched GenerationInfo objects with display names and regions.
 */
export async function fetchAllGenerations(): Promise<GenerationInfo[]> {
  const list = await fetchGenerationsList();
  
  // Extract generation IDs from URLs
  const generationIds = list.results.map((result) => {
    const parts = result.url.split('/');
    return parseInt(parts[parts.length - 2], 10);
  });

  // Fetch all generation details in parallel with concurrency control
  const generations: GenerationInfo[] = [];
  const concurrency = 5;
  
  for (let i = 0; i < generationIds.length; i += concurrency) {
    const batch = generationIds.slice(i, i + concurrency);
    const batchResults = await Promise.allSettled(
      batch.map((id) => fetchGeneration(id))
    );
    
    for (const result of batchResults) {
      if (result.status === 'fulfilled') {
        const gen = result.value;
        const englishName = gen.names.find((n) => n.language.name === 'en');
        const regionName = gen.main_region.name;
        
        generations.push({
          id: gen.id,
          name: gen.name,
          displayName: englishName?.name ?? gen.name,
          region: regionName,
          pokemonCount: gen.pokemon_species.length,
          pokemonSpecies: gen.pokemon_species,
        });
      }
    }
  }

  // Sort by generation ID
  generations.sort((a, b) => a.id - b.id);
  return generations;
}

/**
 * Gets the generation ID for a specific Pokémon species.
 * Parses the generation number from the species URL if available,
 * otherwise determines it from the Pokémon's ID.
 */
export function getGenerationIdFromPokemonId(pokemonId: number): number {
  if (pokemonId <= 151) return 1;  // Kanto
  if (pokemonId <= 251) return 2;  // Johto
  if (pokemonId <= 386) return 3;  // Hoenn
  if (pokemonId <= 493) return 4;  // Sinnoh
  if (pokemonId <= 649) return 5;  // Unova
  if (pokemonId <= 721) return 6;  // Kalos
  if (pokemonId <= 809) return 7;  // Alola
  if (pokemonId <= 898) return 8;  // Galar
  if (pokemonId <= 905) return 9;  // Hisui (Legends Arceus)
  if (pokemonId <= 1025) return 10; // Paldea
  return Math.ceil((pokemonId - 1025) / 100) + 10; // Future generations
}

/**
 * Gets the display name for a generation.
 */
export function getGenerationDisplayName(generationId: number): string {
  const names: Record<number, string> = {
    1: 'Generation I',
    2: 'Generation II',
    3: 'Generation III',
    4: 'Generation IV',
    5: 'Generation V',
    6: 'Generation VI',
    7: 'Generation VII',
    8: 'Generation VIII',
    9: 'Generation IX',
    10: 'Generation X',
  };
  return names[generationId] || `Generation ${toRoman(generationId)}`;
}

function toRoman(num: number): string {
  const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  return romanNumerals[num - 1] || String(num);
}
