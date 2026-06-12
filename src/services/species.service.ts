/**
 * Species Service
 * 
 * Handles all PokéAPI interactions related to Pokémon species data.
 * Provides enriched species information including habitat, color, shape,
 * legendary/mythical status, and evolution chain references.
 */

import axios from 'axios';
import { API_BASE_URL } from '@/constants';
import { cacheManager } from '@/cache/cacheManager';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export interface SpeciesInfo {
  id: number;
  name: string;
  color: string;
  shape: string;
  habitat: string | null;
  is_legendary: boolean;
  is_mythical: boolean;
  is_baby: boolean;
  gender_rate: number;
  capture_rate: number;
  base_happiness: number;
  growth_rate: string;
  egg_groups: string[];
  evolution_chain_url: string;
  evolves_from_species: string | null;
  flavor_text: string;
  genus: string;
}

const CACHE_KEYS = {
  SPECIES: (id: number) => `species_info_${id}`,
  SPECIES_BY_NAME: (name: string) => `species_name_${name}`,
};

/**
 * Fetches and enriches species data for a given Pokémon ID.
 */
export async function fetchSpeciesInfo(id: number): Promise<SpeciesInfo | null> {
  const cacheKey = CACHE_KEYS.SPECIES(id);
  const cached = cacheManager.get<SpeciesInfo>(cacheKey);
  if (cached) return cached;

  try {
    const { data } = await api.get(`/pokemon-species/${id}`);
    
    const info: SpeciesInfo = {
      id: data.id,
      name: data.name,
      color: data.color?.name || 'unknown',
      shape: data.shape?.name || 'unknown',
      habitat: data.habitat?.name || null,
      is_legendary: data.is_legendary,
      is_mythical: data.is_mythical,
      is_baby: data.is_baby,
      gender_rate: data.gender_rate,
      capture_rate: data.capture_rate,
      base_happiness: data.base_happiness,
      growth_rate: data.growth_rate?.name || 'unknown',
      egg_groups: data.egg_groups?.map((g: any) => g.name) || [],
      evolution_chain_url: data.evolution_chain?.url || '',
      evolves_from_species: data.evolves_from_species?.name || null,
      flavor_text: data.flavor_text_entries
        ?.find((e: any) => e.language.name === 'en')
        ?.flavor_text?.replace(/[\n\f]/g, ' ') || '',
      genus: data.genera
        ?.find((g: any) => g.language.name === 'en')
        ?.genus || '',
    };

    cacheManager.set(cacheKey, info);
    return info;
  } catch (error) {
    console.warn(`Failed to fetch species info for Pokémon ${id}:`, error);
    return null;
  }
}

/**
 * Fetches species info by Pokémon name.
 */
export async function fetchSpeciesInfoByName(name: string): Promise<SpeciesInfo | null> {
  const cacheKey = CACHE_KEYS.SPECIES_BY_NAME(name);
  const cached = cacheManager.get<SpeciesInfo>(cacheKey);
  if (cached) return cached;

  try {
    const { data } = await api.get(`/pokemon-species/${name.toLowerCase()}`);
    
    const info: SpeciesInfo = {
      id: data.id,
      name: data.name,
      color: data.color?.name || 'unknown',
      shape: data.shape?.name || 'unknown',
      habitat: data.habitat?.name || null,
      is_legendary: data.is_legendary,
      is_mythical: data.is_mythical,
      is_baby: data.is_baby,
      gender_rate: data.gender_rate,
      capture_rate: data.capture_rate,
      base_happiness: data.base_happiness,
      growth_rate: data.growth_rate?.name || 'unknown',
      egg_groups: data.egg_groups?.map((g: any) => g.name) || [],
      evolution_chain_url: data.evolution_chain?.url || '',
      evolves_from_species: data.evolves_from_species?.name || null,
      flavor_text: data.flavor_text_entries
        ?.find((e: any) => e.language.name === 'en')
        ?.flavor_text?.replace(/[\n\f]/g, ' ') || '',
      genus: data.genera
        ?.find((g: any) => g.language.name === 'en')
        ?.genus || '',
    };

    cacheManager.set(cacheKey, info);
    return info;
  } catch (error) {
    console.warn(`Failed to fetch species info for ${name}:`, error);
    return null;
  }
}

/**
 * Fetches species info for multiple Pokémon in batch.
 */
export async function fetchMultipleSpeciesInfo(
  ids: number[],
  concurrency: number = 5
): Promise<Map<number, SpeciesInfo>> {
  const results = new Map<number, SpeciesInfo>();
  
  for (let i = 0; i < ids.length; i += concurrency) {
    const batch = ids.slice(i, i + concurrency);
    const batchResults = await Promise.allSettled(
      batch.map((id) => fetchSpeciesInfo(id))
    );
    
    for (let j = 0; j < batchResults.length; j++) {
      const result = batchResults[j];
      if (result.status === 'fulfilled' && result.value) {
        results.set(batch[j], result.value);
      }
    }
  }

  return results;
}
