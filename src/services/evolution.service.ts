/**
 * Evolution Service
 * 
 * Handles all PokéAPI interactions related to evolution chains.
 * Supports complex evolution trees including:
 * - Linear evolutions (Bulbasaur -> Ivysaur -> Venusaur)
 * - Branching evolutions (Eevee -> multiple forms)
 * - Regional evolutions
 * - Mega Evolutions
 * - Special forms
 */

import axios from 'axios';
import { API_BASE_URL } from '@/constants';
import { cacheManager } from '@/cache/cacheManager';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export interface EvolutionDetail {
  item: string | null;
  trigger: string;
  gender: number | null;
  held_item: string | null;
  known_move: string | null;
  known_move_type: string | null;
  location: string | null;
  min_level: number | null;
  min_happiness: number | null;
  min_beauty: number | null;
  min_affection: number | null;
  needs_overworld_rain: boolean;
  party_species: string | null;
  party_type: string | null;
  relative_physical_stats: number | null;
  time_of_day: string;
  trade_species: string | null;
  turn_upside_down: boolean;
}

export interface EvolutionNode {
  species_name: string;
  species_id: number;
  min_level: number | null;
  trigger: string;
  item: string | null;
  details: EvolutionDetail | null;
  children: EvolutionNode[];
}

export interface EvolutionChainData {
  id: number;
  chain: EvolutionNode;
  all_species: string[];
}

const CACHE_KEYS = {
  EVOLUTION_CHAIN: (id: number) => `evolution_chain_${id}`,
};

/**
 * Recursively parses the raw evolution chain from PokéAPI into our typed structure.
 */
function parseEvolutionNode(
  rawNode: any,
  parentDetails: any = null
): EvolutionNode {
  const speciesUrl = rawNode.species?.url || '';
  const speciesId = parseInt(speciesUrl.split('/').filter(Boolean).pop() || '0', 10);
  
  // Get evolution details from the first evolution detail entry
  const rawDetail = rawNode.evolution_details?.[0] || parentDetails || {};
  
  const detail: EvolutionDetail = {
    item: rawDetail.item?.name || null,
    trigger: rawDetail.trigger?.name || 'unknown',
    gender: rawDetail.gender ?? null,
    held_item: rawDetail.held_item?.name || null,
    known_move: rawDetail.known_move?.name || null,
    known_move_type: rawDetail.known_move_type?.name || null,
    location: rawDetail.location?.name || null,
    min_level: rawDetail.min_level ?? null,
    min_happiness: rawDetail.min_happiness ?? null,
    min_beauty: rawDetail.min_beauty ?? null,
    min_affection: rawDetail.min_affection ?? null,
    needs_overworld_rain: rawDetail.needs_overworld_rain || false,
    party_species: rawDetail.party_species?.name || null,
    party_type: rawDetail.party_type?.name || null,
    relative_physical_stats: rawDetail.relative_physical_stats ?? null,
    time_of_day: rawDetail.time_of_day || '',
    trade_species: rawDetail.trade_species?.name || null,
    turn_upside_down: rawDetail.turn_upside_down || false,
  };

  const node: EvolutionNode = {
    species_name: rawNode.species?.name || 'unknown',
    species_id: speciesId,
    min_level: detail.min_level,
    trigger: detail.trigger,
    item: detail.item,
    details: detail,
    children: [],
  };

  // Recursively parse children
  if (rawNode.evolves_to && rawNode.evolves_to.length > 0) {
    node.children = rawNode.evolves_to.map((child: any) =>
      parseEvolutionNode(child, rawDetail)
    );
  }

  return node;
}

/**
 * Recursively collects all species names from an evolution tree.
 */
function collectAllSpecies(node: EvolutionNode): string[] {
  const names = [node.species_name];
  for (const child of node.children) {
    names.push(...collectAllSpecies(child));
  }
  return names;
}

/**
 * Fetches an evolution chain by ID.
 */
export async function fetchEvolutionChain(id: number): Promise<EvolutionChainData | null> {
  const cacheKey = CACHE_KEYS.EVOLUTION_CHAIN(id);
  const cached = cacheManager.get<EvolutionChainData>(cacheKey);
  if (cached) return cached;

  try {
    const { data } = await api.get(`/evolution-chain/${id}`);
    
    const chain = parseEvolutionNode(data.chain);
    const allSpecies = collectAllSpecies(chain);
    
    const result: EvolutionChainData = {
      id: data.id,
      chain,
      all_species: [...new Set(allSpecies)], // Deduplicate
    };

    cacheManager.set(cacheKey, result);
    return result;
  } catch (error) {
    console.warn(`Failed to fetch evolution chain ${id}:`, error);
    return null;
  }
}

/**
 * Fetches evolution chain by species ID.
 * First gets the species data to find the evolution chain URL, then fetches it.
 */
export async function fetchEvolutionChainBySpeciesId(
  speciesId: number
): Promise<EvolutionChainData | null> {
  try {
    const { data: speciesData } = await api.get(`/pokemon-species/${speciesId}`);
    if (!speciesData.evolution_chain?.url) return null;
    
    const parts = speciesData.evolution_chain.url.split('/');
    const chainId = parseInt(parts[parts.length - 2], 10);
    
    return fetchEvolutionChain(chainId);
  } catch (error) {
    console.warn(`Failed to fetch evolution chain for species ${speciesId}:`, error);
    return null;
  }
}

/**
 * Flattens an evolution chain into a linear array of species names in order.
 * For branching evolutions, returns the main path first, then branches.
 */
export function flattenEvolutionChain(node: EvolutionNode): string[] {
  const names: string[] = [node.species_name];
  for (const child of node.children) {
    names.push(...flattenEvolutionChain(child));
  }
  return names;
}

/**
 * Gets the evolution stage of a species within its chain.
 * 1 = basic, 2 = stage 1, 3 = stage 2, etc.
 */
export function getEvolutionStage(
  speciesName: string,
  chain: EvolutionNode,
  depth: number = 1
): number {
  if (chain.species_name === speciesName) return depth;
  for (const child of chain.children) {
    const stage = getEvolutionStage(speciesName, child, depth + 1);
    if (stage > 0) return stage;
  }
  return -1;
}

/**
 * Checks if a Pokémon can still evolve (has further evolutions).
 */
export function canEvolveFurther(
  speciesName: string,
  chain: EvolutionNode
): boolean {
  if (chain.species_name === speciesName) {
    return chain.children.length > 0;
  }
  for (const child of chain.children) {
    if (canEvolveFurther(speciesName, child)) return true;
  }
  return false;
}
