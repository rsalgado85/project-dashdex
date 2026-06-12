// Core Pokémon types from PokéAPI

export interface PokemonListItem {
  name: string;
  url: string;
}

export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonListItem[];
}

export interface PokemonType {
  slot: number;
  type: {
    name: string;
    url: string;
  };
}

export interface PokemonStat {
  base_stat: number;
  effort: number;
  stat: {
    name: string;
    url: string;
  };
}

export interface PokemonAbility {
  ability: {
    name: string;
    url: string;
  };
  is_hidden: boolean;
  slot: number;
}

export interface PokemonSprites {
  front_default: string;
  front_shiny: string;
  other: {
    'official-artwork': {
      front_default: string;
      front_shiny: string;
    };
    showdown: {
      front_default: string;
    };
  };
}

export interface PokemonMove {
  move: {
    name: string;
    url: string;
  };
  version_group_details: {
    level_learned_at: number;
    move_learn_method: {
      name: string;
      url: string;
    };
    version_group: {
      name: string;
      url: string;
    };
  }[];
}

export interface Pokemon {
  id: number;
  name: string;
  base_experience: number;
  height: number;
  weight: number;
  types: PokemonType[];
  stats: PokemonStat[];
  abilities: PokemonAbility[];
  sprites: PokemonSprites;
  species: {
    name: string;
    url: string;
  };
  moves?: PokemonMove[];
}

export interface PokemonSpecies {
  flavor_text_entries: {
    flavor_text: string;
    language: {
      name: string;
    };
  }[];
  evolution_chain: {
    url: string;
  };
  genera: {
    genus: string;
    language: {
      name: string;
    };
  }[];
}

export interface EvolutionChain {
  chain: EvolutionNode;
}

export interface EvolutionNode {
  species: {
    name: string;
    url: string;
  };
  evolves_to: EvolutionNode[];
}

export interface TypeResponse {
  name: string;
  pokemon: {
    pokemon: PokemonListItem;
    slot: number;
  }[];
}

export interface Ability {
  name: string;
  effect_entries: {
    effect: string;
    language: {
      name: string;
    };
  }[];
}

// Derived types for the dashboard
export interface PokemonStats {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
}

export interface PokemonWithStats extends Pokemon {
  computedStats: PokemonStats;
  totalStats: number;
  dominantType: string;
  imageUrl: string;
  artworkUrl: string;
}

export interface TypeDistribution {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

export interface StatDistribution {
  range: string;
  count: number;
}

export interface PokemonRanking {
  id: number;
  name: string;
  imageUrl: string;
  stat: number;
  statName: string;
  types: string[];
}

export interface ComparisonData {
  pokemon1: PokemonWithStats | null;
  pokemon2: PokemonWithStats | null;
  differences: StatDifference[];
}

export interface StatDifference {
  stat: string;
  value1: number;
  value2: number;
  difference: number;
  percentageDiff: number;
  winner: 1 | 2 | 0;
}

export interface TypeAverage {
  type: string;
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
  count: number;
}

export interface Insight {
  title: string;
  description: string;
  value: string;
  icon: string;
  type: 'positive' | 'neutral' | 'negative';
}
