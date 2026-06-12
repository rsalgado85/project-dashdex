/**
 * Generation types from PokéAPI
 * These types support dynamic generation loading - no hardcoded lists needed.
 */

export interface GenerationResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: { name: string; url: string }[];
}

export interface Generation {
  id: number;
  name: string;
  abilities: { name: string; url: string }[];
  main_region: { name: string; url: string };
  moves: { name: string; url: string }[];
  names: {
    name: string;
    language: { name: string; url: string };
  }[];
  pokemon_species: { name: string; url: string }[];
  types: { name: string; url: string }[];
  version_groups: { name: string; url: string }[];
}

export interface GenerationInfo {
  id: number;
  name: string;
  displayName: string;
  region: string;
  pokemonCount: number;
  pokemonSpecies: { name: string; url: string }[];
}

export interface GenerationFilter {
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
