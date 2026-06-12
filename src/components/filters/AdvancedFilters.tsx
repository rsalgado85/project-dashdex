/**
 * Advanced Filters Component
 * 
 * Composable filter panel for Pokémon data.
 * Supports combining multiple filter criteria with a clean UI.
 * Features:
 * - Generation selector (dynamic from PokéAPI)
 * - Type selector
 * - Habitat, Color, Shape selectors
 * - Legendary / Mythical / Baby toggles
 * - Search input with debounce
 * - Clear all filters button
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAllGenerations } from '@/hooks/useGenerations';
import { TYPE_COLORS } from '@/constants';
import type { FilterState } from '@/hooks/useFilters';

interface AdvancedFiltersProps {
  filters: FilterState;
  onFilterChange: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  filterOptions: {
    types: string[];
    habitats: string[];
    colors: string[];
    shapes: string[];
  };
}

export function AdvancedFilters({
  filters,
  onFilterChange,
  onClearFilters,
  hasActiveFilters,
  filterOptions,
}: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: generations } = useAllGenerations();

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  return (
    <div className="advanced-filters">
      <div className="filters-header">
        <div className="filters-search">
          <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, ID, or type..."
            value={filters.searchQuery}
            onChange={(e) => onFilterChange('searchQuery', e.target.value)}
            className="search-input"
            aria-label="Search Pokémon"
          />
        </div>
        <div className="filters-actions">
          {hasActiveFilters && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="clear-filters-btn"
              onClick={onClearFilters}
              aria-label="Clear all filters"
            >
              Clear Filters
            </motion.button>
          )}
          <button
            className="toggle-filters-btn"
            onClick={toggleExpanded}
            aria-expanded={isExpanded}
            aria-label="Toggle advanced filters"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 21v-7" />
              <path d="M4 10V3" />
              <path d="M12 21v-9" />
              <path d="M12 8V3" />
              <path d="M20 21v-5" />
              <path d="M20 12V3" />
              <path d="M1 14h6" />
              <path d="M9 8h6" />
              <path d="M17 16h6" />
            </svg>
            Filters
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="filters-panel"
          >
            <div className="filters-grid">
              {/* Generation Filter */}
              <div className="filter-group">
                <label className="filter-label">Generation</label>
                <select
                  value={filters.generationId || ''}
                  onChange={(e) => onFilterChange('generationId', e.target.value ? Number(e.target.value) : null)}
                  className="filter-select"
                  aria-label="Filter by generation"
                >
                  <option value="">All Generations</option>
                  {generations?.map((gen) => (
                    <option key={gen.id} value={gen.id}>
                      {gen.displayName} ({gen.region})
                    </option>
                  ))}
                </select>
              </div>

              {/* Type Filter */}
              <div className="filter-group">
                <label className="filter-label">Type</label>
                <select
                  value={filters.type || ''}
                  onChange={(e) => onFilterChange('type', e.target.value || null)}
                  className="filter-select"
                  aria-label="Filter by type"
                >
                  <option value="">All Types</option>
                  {filterOptions.types.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Habitat Filter */}
              <div className="filter-group">
                <label className="filter-label">Habitat</label>
                <select
                  value={filters.habitat || ''}
                  onChange={(e) => onFilterChange('habitat', e.target.value || null)}
                  className="filter-select"
                  aria-label="Filter by habitat"
                >
                  <option value="">All Habitats</option>
                  {filterOptions.habitats.map((habitat) => (
                    <option key={habitat} value={habitat}>
                      {habitat.charAt(0).toUpperCase() + habitat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Color Filter */}
              <div className="filter-group">
                <label className="filter-label">Color</label>
                <select
                  value={filters.color || ''}
                  onChange={(e) => onFilterChange('color', e.target.value || null)}
                  className="filter-select"
                  aria-label="Filter by color"
                >
                  <option value="">All Colors</option>
                  {filterOptions.colors.map((color) => (
                    <option key={color} value={color}>
                      {color.charAt(0).toUpperCase() + color.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Shape Filter */}
              <div className="filter-group">
                <label className="filter-label">Shape</label>
                <select
                  value={filters.shape || ''}
                  onChange={(e) => onFilterChange('shape', e.target.value || null)}
                  className="filter-select"
                  aria-label="Filter by shape"
                >
                  <option value="">All Shapes</option>
                  {filterOptions.shapes.map((shape) => (
                    <option key={shape} value={shape}>
                      {shape.charAt(0).toUpperCase() + shape.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Special Toggles */}
              <div className="filter-group toggles-group">
                <label className="filter-label">Special Categories</label>
                <div className="filter-toggles">
                  <label className="filter-toggle">
                    <input
                      type="checkbox"
                      checked={filters.isLegendary === true}
                      onChange={(e) => onFilterChange('isLegendary', e.target.checked ? true : null)}
                    />
                    <span>Legendary</span>
                  </label>
                  <label className="filter-toggle">
                    <input
                      type="checkbox"
                      checked={filters.isMythical === true}
                      onChange={(e) => onFilterChange('isMythical', e.target.checked ? true : null)}
                    />
                    <span>Mythical</span>
                  </label>
                  <label className="filter-toggle">
                    <input
                      type="checkbox"
                      checked={filters.isBaby === true}
                      onChange={(e) => onFilterChange('isBaby', e.target.checked ? true : null)}
                    />
                    <span>Baby</span>
                  </label>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
