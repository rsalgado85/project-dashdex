/**
 * Multi Pokémon Selector Component
 * 
 * Enhanced selector that supports selecting 2, 3, or 4 Pokémon for comparison.
 * Features:
 * - Dropdown with search that filters in real-time as you type
 * - Shows full list when opened, filters as you type
 * - Click outside to close
 */

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, X } from 'lucide-react';
import { useAllPokemon } from '@/hooks/usePokemon';
import { capitalize } from '@/utils/pokemonUtils';
import { getTypeIcon } from '@/constants/typeIcons';
import type { PokemonWithStats } from '@/types/pokemon';

interface MultiPokemonSelectorProps {
  selected: (PokemonWithStats | null)[];
  onChange: (index: number, pokemon: PokemonWithStats | null) => void;
  maxSlots?: number;
}

export function MultiPokemonSelector({ selected, onChange, maxSlots = 4 }: MultiPokemonSelectorProps) {
  const { data: allPokemon } = useAllPokemon();
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const dropdownRefs = useRef<(HTMLDivElement | null)[]>([]);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Filter Pokémon based on search query - shows all when search is empty
  const filteredPokemon = useMemo(() => {
    if (!allPokemon) return [];
    if (!search.trim()) return allPokemon.slice(0, 100); // Show first 100 when no search
    const q = search.toLowerCase().trim();
    return allPokemon.filter(
      (p) => p.name.toLowerCase().includes(q) || String(p.id).includes(q)
    ).slice(0, 100);
  }, [allPokemon, search]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      dropdownRefs.current.forEach((ref) => {
        if (ref && !ref.contains(e.target as Node)) {
          setOpenDropdown(null);
        }
      });
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (openDropdown !== null && searchInputRef.current) {
      // Small delay to ensure DOM is ready
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [openDropdown]);

  const handleSelect = useCallback((index: number, pokemon: PokemonWithStats) => {
    onChange(index, pokemon);
    setOpenDropdown(null);
    setSearch('');
  }, [onChange]);

  const handleRemove = useCallback((index: number) => {
    onChange(index, null);
  }, [onChange]);

  const toggleDropdown = useCallback((index: number) => {
    setOpenDropdown((prev) => {
      if (prev === index) {
        setSearch('');
        return null;
      }
      setSearch('');
      return index;
    });
  }, []);

  return (
    <div className="multi-pokemon-selector">
      <div className="selector-slots" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {Array.from({ length: maxSlots }).map((_, index) => (
          <div
            key={index}
            className="selector-slot"
            style={{ position: 'relative' }}
            ref={(el) => { dropdownRefs.current[index] = el; }}
          >
            <div className="slot-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span className="slot-label" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-secondary, #94a3b8)' }}>
                Pokémon {index + 1}
              </span>
              {selected[index] && (
                <button
                  className="slot-remove"
                  onClick={() => handleRemove(index)}
                  aria-label={`Remove Pokémon ${index + 1}`}
                  style={{
                    padding: '4px',
                    borderRadius: '6px',
                    border: 'none',
                    background: 'rgba(255,255,255,0.06)',
                    color: 'var(--color-text-secondary, #94a3b8)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,80,80,0.2)'; e.currentTarget.style.color = '#ff5050'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'var(--color-text-secondary, #94a3b8)'; }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Selector Button */}
            <button
              className={`slot-selector ${selected[index] ? 'has-value' : ''}`}
              onClick={() => toggleDropdown(index)}
              aria-label={`Select Pokémon ${index + 1}`}
              aria-expanded={openDropdown === index}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '12px',
                border: `1px solid ${openDropdown === index ? 'var(--color-accent, #6c5ce7)' : 'var(--color-border, rgba(255,255,255,0.08))'}`,
                background: 'var(--color-card-bg, #1a1a2e)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                color: 'var(--color-text-primary, #fff)',
                fontSize: '13px',
              }}
              onMouseEnter={(e) => { if (openDropdown !== index) e.currentTarget.style.borderColor = 'var(--color-accent, #6c5ce7)'; }}
              onMouseLeave={(e) => { if (openDropdown !== index) e.currentTarget.style.borderColor = 'var(--color-border, rgba(255,255,255,0.08))'; }}
            >
              {selected[index] ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                  <img
                    src={selected[index].imageUrl}
                    alt={selected[index].name}
                    style={{ width: '36px', height: '36px', objectFit: 'contain', borderRadius: '8px' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {capitalize(selected[index].name)}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--color-text-secondary, #94a3b8)' }}>
                      #{String(selected[index].id).padStart(3, '0')}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {selected[index].types.map((t) => {
                      const TypeIcon = getTypeIcon(t.type.name);
                      return (
                        <span key={t.type.name} className={`type-badge type-${t.type.name} text-[10px]`} style={{ padding: '2px 6px' }}>
                          <TypeIcon size={8} />
                        </span>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <span style={{ color: 'var(--color-text-secondary, #94a3b8)', flex: 1, textAlign: 'left' }}>
                  Select Pokémon
                </span>
              )}
              <ChevronDown
                size={14}
                style={{
                  color: 'var(--color-text-secondary, #94a3b8)',
                  transition: 'transform 0.2s',
                  transform: openDropdown === index ? 'rotate(180deg)' : 'rotate(0deg)',
                  flexShrink: 0,
                }}
              />
            </button>

            {/* Dropdown */}
            <AnimatePresence>
              {openDropdown === index && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scaleY: 0.95 }}
                  animate={{ opacity: 1, y: 0, scaleY: 1 }}
                  exit={{ opacity: 0, y: -8, scaleY: 0.95 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '4px',
                    zIndex: 50,
                    borderRadius: '12px',
                    border: '1px solid var(--color-border, rgba(255,255,255,0.08))',
                    background: 'var(--color-card-bg, #1a1a2e)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                    overflow: 'hidden',
                    transformOrigin: 'top',
                  }}
                >
                  {/* Search Input */}
                  <div style={{ padding: '8px', borderBottom: '1px solid var(--color-border, rgba(255,255,255,0.06))' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid var(--color-border, rgba(255,255,255,0.06))',
                    }}>
                      <Search size={14} style={{ color: 'var(--color-text-secondary, #94a3b8)', flexShrink: 0 }} />
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name or ID..."
                        style={{
                          flex: 1,
                          border: 'none',
                          background: 'transparent',
                          color: 'var(--color-text-primary, #fff)',
                          fontSize: '12px',
                          outline: 'none',
                          width: '100%',
                        }}
                      />
                      {search && (
                        <button
                          onClick={() => setSearch('')}
                          style={{
                            border: 'none',
                            background: 'rgba(255,255,255,0.06)',
                            color: 'var(--color-text-secondary, #94a3b8)',
                            cursor: 'pointer',
                            padding: '2px',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Results List */}
                  <div style={{
                    maxHeight: '280px',
                    overflowY: 'auto',
                    padding: '4px',
                  }}>
                    {filteredPokemon.length === 0 ? (
                      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-secondary, #94a3b8)', fontSize: '12px' }}>
                        No Pokémon found
                      </div>
                    ) : (
                      filteredPokemon.map((p) => {
                        const isSelected = selected.some((s) => s?.id === p.id);
                        return (
                          <button
                            key={p.id}
                            disabled={isSelected}
                            onClick={() => handleSelect(index, p)}
                            style={{
                              width: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              padding: '8px 10px',
                              borderRadius: '8px',
                              border: 'none',
                              background: 'transparent',
                              cursor: isSelected ? 'not-allowed' : 'pointer',
                              transition: 'all 0.15s',
                              color: 'var(--color-text-primary, #fff)',
                              fontSize: '12px',
                              textAlign: 'left',
                              opacity: isSelected ? 0.4 : 1,
                            }}
                            onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                          >
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              style={{ width: '32px', height: '32px', objectFit: 'contain', borderRadius: '6px', flexShrink: 0 }}
                              loading="lazy"
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {capitalize(p.name)}
                              </div>
                              <div style={{ fontSize: '10px', color: 'var(--color-text-secondary, #94a3b8)' }}>
                                #{String(p.id).padStart(3, '0')}
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '3px', flexShrink: 0 }}>
                              {p.types.map((t) => {
                                const TypeIcon = getTypeIcon(t.type.name);
                                return (
                                  <span key={t.type.name} className={`type-badge type-${t.type.name}`} style={{ fontSize: '9px', padding: '1px 5px' }}>
                                    <TypeIcon size={7} />
                                  </span>
                                );
                              })}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>

                  {/* Results count */}
                  <div style={{
                    padding: '6px 12px',
                    borderTop: '1px solid var(--color-border, rgba(255,255,255,0.06))',
                    textAlign: 'center',
                    fontSize: '10px',
                    color: 'var(--color-text-secondary, #94a3b8)',
                  }}>
                    {filteredPokemon.length} Pokémon {search ? `matching "${search}"` : ''}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
