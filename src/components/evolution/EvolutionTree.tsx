/**
 * Evolution Tree Component
 * 
 * Visual component that renders a Pokémon's evolution chain as an interactive tree.
 * Supports:
 * - Linear evolutions (Bulbasaur -> Ivysaur -> Venusaur)
 * - Branching evolutions (Eevee -> multiple forms)
 * - Evolution details (level, item, trade, etc.)
 * - Click to navigate to Pokémon detail
 */

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useEvolutionChainBySpecies } from '@/hooks/useEvolution';
import { TYPE_COLORS } from '@/constants';
import type { EvolutionNode } from '@/services/evolution.service';

interface EvolutionTreeProps {
  speciesId: number;
  pokemonImages: Map<string, string>;
  pokemonTypes: Map<string, { type: { name: string } }[]>;
}

function EvolutionNodeCard({
  node,
  images,
  types,
  onNavigate,
  depth = 0,
}: {
  node: EvolutionNode;
  images: Map<string, string>;
  types: Map<string, { type: { name: string } }[]>;
  onNavigate: (id: number) => void;
  depth?: number;
}) {
  const pokemonTypes = types.get(node.species_name) || [];
  const imageUrl = images.get(node.species_name);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: depth * 0.1 }}
      className="evolution-node"
      style={{ marginLeft: depth > 0 ? 40 : 0 }}
    >
      <div
        className="evolution-card"
        onClick={() => onNavigate(node.species_id)}
        role="button"
        tabIndex={0}
        aria-label={`View ${node.species_name} details`}
        onKeyDown={(e) => e.key === 'Enter' && onNavigate(node.species_id)}
      >
        <div className="evolution-image-container">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={node.species_name}
              className="evolution-image"
              loading="lazy"
            />
          ) : (
            <div className="evolution-image-placeholder">
              #{node.species_id}
            </div>
          )}
        </div>
        <div className="evolution-info">
          <span className="evolution-name">
            {node.species_name.charAt(0).toUpperCase() + node.species_name.slice(1)}
          </span>
          <div className="evolution-types">
            {pokemonTypes.map((t) => (
              <span
                key={t.type.name}
                className="evolution-type-badge"
                style={{ backgroundColor: TYPE_COLORS[t.type.name] || '#666' }}
              >
                {t.type.name}
              </span>
            ))}
          </div>
          {node.details && (
            <div className="evolution-details">
              {node.details.min_level && (
                <span className="evolution-detail-badge">
                  Lv. {node.details.min_level}
                </span>
              )}
              {node.details.trigger === 'use-item' && node.details.item && (
                <span className="evolution-detail-badge item-badge">
                  {node.details.item.replace(/-/g, ' ')}
                </span>
              )}
              {node.details.trigger === 'trade' && (
                <span className="evolution-detail-badge trade-badge">
                  Trade
                </span>
              )}
              {node.details.trigger === 'shed' && (
                <span className="evolution-detail-badge">
                  Shed
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Render children with arrows */}
      {node.children.length > 0 && (
        <div className="evolution-children">
          {node.children.map((child, index) => (
            <div key={child.species_name} className="evolution-child-wrapper">
              <div className="evolution-arrow">
                <svg width="24" height="40" viewBox="0 0 24 40">
                  <line x1="12" y1="0" x2="12" y2="30" stroke="#3a3a4a" strokeWidth="2" />
                  <polygon points="4,28 12,38 20,28" fill="#3a3a4a" />
                </svg>
              </div>
              <EvolutionNodeCard
                node={child}
                images={images}
                types={types}
                onNavigate={onNavigate}
                depth={depth + 1}
              />
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export function EvolutionTree({ speciesId, pokemonImages, pokemonTypes }: EvolutionTreeProps) {
  const navigate = useNavigate();
  const { data: chain, isLoading, error } = useEvolutionChainBySpecies(speciesId);

  const handleNavigate = (id: number) => {
    navigate(`/pokemon/${id}`);
  };

  if (isLoading) {
    return (
      <div className="evolution-loading">
        <div className="skeleton-pulse" style={{ height: 80, width: '100%', borderRadius: 12 }} />
        <div className="skeleton-pulse" style={{ height: 80, width: '100%', borderRadius: 12, marginTop: 16 }} />
      </div>
    );
  }

  if (error || !chain) {
    return (
      <div className="evolution-error">
        <p>No evolution data available</p>
      </div>
    );
  }

  return (
    <div className="evolution-tree" role="tree" aria-label="Pokémon evolution chain">
      <AnimatePresence>
        <EvolutionNodeCard
          node={chain.chain}
          images={pokemonImages}
          types={pokemonTypes}
          onNavigate={handleNavigate}
        />
      </AnimatePresence>
    </div>
  );
}
