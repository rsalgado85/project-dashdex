/**
 * Pokémon Utility Functions
 * 
 * Pure functions for transforming and computing Pokémon data.
 * These are kept separate from components for testability and reusability.
 */

import type {
  Pokemon,
  PokemonWithStats,
  PokemonStats,
  TypeDistribution,
  StatDistribution,
  PokemonRanking,
  StatDifference,
  TypeAverage,
  Insight,
} from '@/types/pokemon';
import { TYPE_COLORS, STAT_NAMES } from '@/constants';

/**
 * Computes derived stats from raw Pokémon data.
 * Maps API stat names to our internal format.
 */
export function computePokemonStats(pokemon: Pokemon): PokemonStats {
  const statMap: Record<string, keyof PokemonStats> = {
    hp: 'hp',
    attack: 'attack',
    defense: 'defense',
    'special-attack': 'specialAttack',
    'special-defense': 'specialDefense',
    speed: 'speed',
  };

  const stats: PokemonStats = {
    hp: 0,
    attack: 0,
    defense: 0,
    specialAttack: 0,
    specialDefense: 0,
    speed: 0,
  };

  for (const stat of pokemon.stats) {
    const key = statMap[stat.stat.name];
    if (key) {
      stats[key] = stat.base_stat;
    }
  }

  return stats;
}

/**
 * Transforms a raw Pokemon into our enriched PokemonWithStats type.
 * Handles missing/undefined sprites gracefully to prevent runtime errors.
 */
export function enrichPokemon(pokemon: Pokemon): PokemonWithStats {
  const computedStats = computePokemonStats(pokemon);
  const totalStats = Object.values(computedStats).reduce((a, b) => a + b, 0);
  const dominantType = pokemon.types[0]?.type.name ?? 'normal';

  // Safely access sprites with fallbacks
  const showdownSprite = pokemon.sprites?.other?.showdown?.front_default;
  const frontSprite = pokemon.sprites?.front_default;
  const artworkSprite = pokemon.sprites?.other?.['official-artwork']?.front_default;

  return {
    ...pokemon,
    computedStats,
    totalStats,
    dominantType,
    imageUrl: showdownSprite || frontSprite || '',
    artworkUrl: artworkSprite || frontSprite || '',
  };
}

/**
 * Computes type distribution from a list of Pokémon.
 */
export function computeTypeDistribution(pokemonList: Pokemon[]): TypeDistribution[] {
  const typeCount: Record<string, number> = {};
  let total = 0;

  for (const pokemon of pokemonList) {
    for (const type of pokemon.types) {
      typeCount[type.type.name] = (typeCount[type.type.name] || 0) + 1;
      total++;
    }
  }

  return Object.entries(typeCount)
    .map(([name, count]) => ({
      name,
      count,
      percentage: (count / total) * 100,
      color: TYPE_COLORS[name] || '#666',
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Computes height distribution for histogram.
 */
export function computeHeightDistribution(pokemonList: Pokemon[]): StatDistribution[] {
  const ranges = ['0-5', '5-10', '10-15', '15-20', '20-25', '25+'];
  const counts = new Array(ranges.length).fill(0);

  for (const pokemon of pokemonList) {
    if (!pokemon || typeof pokemon.height !== 'number') continue;
    const height = pokemon.height / 10; // Convert to meters
    if (height <= 5) counts[0]++;
    else if (height <= 10) counts[1]++;
    else if (height <= 15) counts[2]++;
    else if (height <= 20) counts[3]++;
    else if (height <= 25) counts[4]++;
    else counts[5]++;
  }

  return ranges.map((range, i) => ({
    range,
    count: counts[i],
  }));
}

/**
 * Computes weight distribution for histogram.
 */
export function computeWeightDistribution(pokemonList: Pokemon[]): StatDistribution[] {
  const ranges = ['0-50', '50-100', '100-200', '200-500', '500-1000', '1000+'];
  const counts = new Array(ranges.length).fill(0);

  for (const pokemon of pokemonList) {
    const weight = pokemon.weight / 10; // Convert to kg
    if (weight <= 50) counts[0]++;
    else if (weight <= 100) counts[1]++;
    else if (weight <= 200) counts[2]++;
    else if (weight <= 500) counts[3]++;
    else if (weight <= 1000) counts[4]++;
    else counts[5]++;
  }

  return ranges.map((range, i) => ({
    range,
    count: counts[i],
  }));
}

/**
 * Computes base experience distribution.
 */
export function computeExperienceDistribution(pokemonList: Pokemon[]): { name: string; value: number }[] {
  const ranges = ['0-50', '50-100', '100-150', '150-200', '200-250', '250+'];
  const counts = new Array(ranges.length).fill(0);

  for (const pokemon of pokemonList) {
    const exp = pokemon.base_experience;
    if (exp <= 50) counts[0]++;
    else if (exp <= 100) counts[1]++;
    else if (exp <= 150) counts[2]++;
    else if (exp <= 200) counts[3]++;
    else if (exp <= 250) counts[4]++;
    else counts[5]++;
  }

  return ranges.map((range, i) => ({
    name: range,
    value: counts[i],
  }));
}

/**
 * Gets top N Pokémon by a specific stat.
 */
export function getTopPokemonByStat(
  pokemonList: PokemonWithStats[],
  statName: keyof PokemonStats,
  limit: number = 20
): PokemonRanking[] {
  return [...pokemonList]
    .sort((a, b) => b.computedStats[statName] - a.computedStats[statName])
    .slice(0, limit)
    .map((p) => ({
      id: p.id,
      name: p.name,
      imageUrl: p.imageUrl,
      stat: p.computedStats[statName],
      statName: STAT_NAMES[statName] || statName,
      types: p.types.map((t) => t.type.name),
    }));
}

/**
 * Computes percentage differences between two Pokémon for comparison.
 */
export function computeComparisonDifferences(
  pokemon1: PokemonWithStats,
  pokemon2: PokemonWithStats
): StatDifference[] {
  const stats: { label: string; value1: number; value2: number }[] = [
    { label: 'HP', value1: pokemon1.computedStats.hp, value2: pokemon2.computedStats.hp },
    { label: 'Attack', value1: pokemon1.computedStats.attack, value2: pokemon2.computedStats.attack },
    { label: 'Defense', value1: pokemon1.computedStats.defense, value2: pokemon2.computedStats.defense },
    { label: 'Sp. Attack', value1: pokemon1.computedStats.specialAttack, value2: pokemon2.computedStats.specialAttack },
    { label: 'Sp. Defense', value1: pokemon1.computedStats.specialDefense, value2: pokemon2.computedStats.specialDefense },
    { label: 'Speed', value1: pokemon1.computedStats.speed, value2: pokemon2.computedStats.speed },
    { label: 'Weight', value1: pokemon1.weight, value2: pokemon2.weight },
    { label: 'Height', value1: pokemon1.height, value2: pokemon2.height },
  ];

  return stats.map((s) => {
    const diff = s.value2 - s.value1;
    const percentageDiff = s.value1 !== 0 ? ((diff / s.value1) * 100) : 0;
    const winner: 1 | 2 | 0 = diff > 0 ? 2 : diff < 0 ? 1 : 0;

    return {
      stat: s.label,
      value1: s.value1,
      value2: s.value2,
      difference: Math.abs(diff),
      percentageDiff: Math.abs(percentageDiff),
      winner,
    };
  });
}

/**
 * Computes average stats by Pokémon type.
 */
export function computeTypeAverages(pokemonList: Pokemon[]): TypeAverage[] {
  const typeData: Record<string, { stats: PokemonStats; count: number }> = {};

  for (const pokemon of pokemonList) {
    const stats = computePokemonStats(pokemon);
    for (const type of pokemon.types) {
      if (!typeData[type.type.name]) {
        typeData[type.type.name] = {
          stats: { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 },
          count: 0,
        };
      }
      typeData[type.type.name].stats.hp += stats.hp;
      typeData[type.type.name].stats.attack += stats.attack;
      typeData[type.type.name].stats.defense += stats.defense;
      typeData[type.type.name].stats.specialAttack += stats.specialAttack;
      typeData[type.type.name].stats.specialDefense += stats.specialDefense;
      typeData[type.type.name].stats.speed += stats.speed;
      typeData[type.type.name].count++;
    }
  }

  return Object.entries(typeData).map(([type, data]) => ({
    type,
    hp: Math.round(data.stats.hp / data.count),
    attack: Math.round(data.stats.attack / data.count),
    defense: Math.round(data.stats.defense / data.count),
    specialAttack: Math.round(data.stats.specialAttack / data.count),
    specialDefense: Math.round(data.stats.specialDefense / data.count),
    speed: Math.round(data.stats.speed / data.count),
    count: data.count,
  }));
}

/**
 * Generates insights from Pokémon data.
 */
export function generateInsights(pokemonList: PokemonWithStats[]): Insight[] {
  const typeAverages = computeTypeAverages(pokemonList);
  const insights: Insight[] = [];

  // Most balanced Pokémon
  const balanced = [...pokemonList]
    .map((p) => ({
      ...p,
      variance: calculateVariance(p.computedStats),
    }))
    .sort((a, b) => a.variance - b.variance)[0];

  if (balanced) {
    insights.push({
      title: 'Most Balanced Pokémon',
      description: `${capitalize(balanced.name)} has the most evenly distributed stats`,
      value: capitalize(balanced.name),
      icon: 'Balance',
      type: 'positive',
    });
  }

  // Most specialized Pokémon
  const specialized = [...pokemonList]
    .map((p) => ({
      ...p,
      maxStat: Math.max(...Object.values(p.computedStats)),
      avgStat: Object.values(p.computedStats).reduce((a, b) => a + b, 0) / 6,
    }))
    .sort((a, b) => b.maxStat - b.avgStat - (a.maxStat - a.avgStat))[0];

  if (specialized) {
    insights.push({
      title: 'Most Specialized Pokémon',
      description: `${capitalize(specialized.name)} excels in one stat area`,
      value: capitalize(specialized.name),
      icon: 'Target',
      type: 'neutral',
    });
  }

  // Type with highest average HP
  const highestHp = [...typeAverages].sort((a, b) => b.hp - a.hp)[0];
  if (highestHp) {
    insights.push({
      title: 'Highest Average HP',
      description: `${capitalize(highestHp.type)}-type Pokémon have the highest HP`,
      value: `${highestHp.hp} avg`,
      icon: 'Heart',
      type: 'positive',
    });
  }

  // Type with highest average Speed
  const highestSpeed = [...typeAverages].sort((a, b) => b.speed - a.speed)[0];
  if (highestSpeed) {
    insights.push({
      title: 'Fastest Type',
      description: `${capitalize(highestSpeed.type)}-type Pokémon are the fastest`,
      value: `${highestSpeed.speed} avg`,
      icon: 'Zap',
      type: 'positive',
    });
  }

  // Type with highest average Attack
  const highestAttack = [...typeAverages].sort((a, b) => b.attack - a.attack)[0];
  if (highestAttack) {
    insights.push({
      title: 'Strongest Type',
      description: `${capitalize(highestAttack.type)}-type Pokémon have the highest Attack`,
      value: `${highestAttack.attack} avg`,
      icon: 'Sword',
      type: 'positive',
    });
  }

  return insights;
}

function calculateVariance(stats: PokemonStats): number {
  const values = Object.values(stats);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((acc, val) => acc + (val - mean) ** 2, 0) / values.length;
  return variance;
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatPokemonId(id: number): string {
  return `#${String(id).padStart(3, '0')}`;
}

export function getStatColor(statName: string): string {
  const colors: Record<string, string> = {
    hp: '#00b894',
    attack: '#e17055',
    defense: '#74b9ff',
    specialAttack: '#a29bfe',
    specialDefense: '#6c5ce7',
    speed: '#fdcb6e',
  };
  return colors[statName] || '#666';
}
