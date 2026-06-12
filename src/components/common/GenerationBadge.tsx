/**
 * GenerationBadge Component
 * 
 * Displays a small badge showing which generation a Pokémon belongs to.
 * Uses the Pokémon's ID to determine the generation dynamically.
 * Styled as a compact, glassmorphism tag that fits anywhere.
 */

import { useMemo } from 'react';
import { getGenerationIdFromPokemonId, getGenerationDisplayName } from '@/services/generation.service';

interface GenerationBadgeProps {
  pokemonId: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const GEN_COLORS: Record<number, string> = {
  1: '#667eea',   // Kanto - purple
  2: '#f5576c',   // Johto - pink
  3: '#4facfe',   // Hoenn - blue
  4: '#43e97b',   // Sinnoh - green
  5: '#fa709a',   // Unova - rose
  6: '#a18cd1',   // Kalos - lavender
  7: '#fccb90',   // Alola - peach
  8: '#e0c3fc',   // Galar - light purple
  9: '#f5576c',   // Hisui - coral
  10: '#ff6f00',  // Paldea - orange
};

const GEN_SHORT: Record<number, string> = {
  1: 'Gen I',
  2: 'Gen II',
  3: 'Gen III',
  4: 'Gen IV',
  5: 'Gen V',
  6: 'Gen VI',
  7: 'Gen VII',
  8: 'Gen VIII',
  9: 'Gen IX',
  10: 'Gen X',
};

export function GenerationBadge({ pokemonId, size = 'sm', showLabel = true }: GenerationBadgeProps) {
  const genId = useMemo(() => getGenerationIdFromPokemonId(pokemonId), [pokemonId]);
  const color = GEN_COLORS[genId] || '#6c5ce7';
  const shortLabel = GEN_SHORT[genId] || `Gen ${genId}`;
  const fullLabel = getGenerationDisplayName(genId);

  const sizeClasses = {
    sm: 'text-[9px] px-1.5 py-0.5',
    md: 'text-[10px] px-2 py-0.5',
    lg: 'text-xs px-2.5 py-1',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-bold uppercase tracking-wider ${sizeClasses[size]}`}
      style={{
        backgroundColor: `${color}22`,
        color: color,
        border: `1px solid ${color}33`,
      }}
      title={fullLabel}
      aria-label={`Generation ${genId}: ${fullLabel}`}
    >
      {/* Small dot indicator */}
      <span
        className="rounded-full"
        style={{
          backgroundColor: color,
          width: size === 'sm' ? 4 : size === 'md' ? 5 : 6,
          height: size === 'sm' ? 4 : size === 'md' ? 5 : 6,
        }}
      />
      {showLabel && shortLabel}
    </span>
  );
}
