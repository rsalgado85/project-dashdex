import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { capitalize } from '@/utils/pokemonUtils';
import { getTypeIcon } from '@/constants/typeIcons';
import type { PokemonWithStats } from '@/types/pokemon';

interface PokemonListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  pokemon: PokemonWithStats[];
  statLabel?: string;
  statValue?: (p: PokemonWithStats) => number | string;
}

const ITEMS_PER_PAGE = 5;

export function PokemonListModal({ isOpen, onClose, title, pokemon, statLabel, statValue }: PokemonListModalProps) {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page when modal opens or pokemon list changes
  useMemo(() => {
    if (isOpen) setCurrentPage(1);
  }, [isOpen, pokemon.length]);

  const totalPages = Math.max(1, Math.ceil(pokemon.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedPokemon = pokemon.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay - z-index alto para cubrir todo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/70 z-[100]"
            onClick={onClose}
          />

          {/* Modal - centrado perfecto en cualquier pantalla */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 10 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
          >
            <div
              className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden"
              style={{
                backgroundColor: 'var(--color-card-bg, #1a1a2e)',
                border: '1px solid var(--color-border, rgba(255,255,255,0.08))',
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-5 py-4 border-b shrink-0"
                style={{ borderColor: 'var(--color-border, rgba(255,255,255,0.08))' }}
              >
                <h2
                  className="text-lg font-semibold"
                  style={{ color: 'var(--color-text-primary, #ffffff)' }}
                >
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{
                    color: 'var(--color-text-secondary, #94a3b8)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-hover, rgba(255,255,255,0.06))';
                    e.currentTarget.style.color = 'var(--color-text-primary, #ffffff)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--color-text-secondary, #94a3b8)';
                  }}
                  aria-label="Close modal"
                >
                  <X size={18} />
                </button>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto px-2 py-2">
                {paginatedPokemon.length === 0 ? (
                  <div
                    className="p-8 text-center"
                    style={{ color: 'var(--color-text-secondary, #94a3b8)' }}
                  >
                    No Pokémon found
                  </div>
                ) : (
                  <div className="space-y-1">
                    {paginatedPokemon.map((p, index) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          navigate(`/pokemon/${p.id}`);
                          onClose();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left group"
                        style={{
                          color: 'var(--color-text-primary, #ffffff)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--color-hover, rgba(255,255,255,0.06))';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <span
                          className="text-xs w-6 text-right font-mono shrink-0"
                          style={{ color: 'var(--color-text-secondary, #94a3b8)' }}
                        >
                          {startIndex + index + 1}
                        </span>
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-10 h-10 object-contain group-hover:scale-110 transition-transform shrink-0"
                          loading="lazy"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium truncate block">
                            {capitalize(p.name)}
                          </span>
                          <span
                            className="text-xs"
                            style={{ color: 'var(--color-text-secondary, #94a3b8)' }}
                          >
                            #{String(p.id).padStart(3, '0')}
                          </span>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          {p.types.map((t) => {
                            const TypeIcon = getTypeIcon(t.type.name);
                            return (
                              <span
                                key={t.type.name}
                                className={`type-badge type-${t.type.name} text-[10px] flex items-center gap-0.5`}
                              >
                                <TypeIcon size={8} />
                                {t.type.name}
                              </span>
                            );
                          })}
                        </div>
                        {statLabel && statValue && (
                          <div className="text-right ml-2 shrink-0">
                            <span
                              className="text-xs"
                              style={{ color: 'var(--color-text-secondary, #94a3b8)' }}
                            >
                              {statLabel}
                            </span>
                            <p className="text-sm font-bold gradient-text">{statValue(p)}</p>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer with pagination */}
              <div
                className="flex items-center justify-between px-5 py-3 border-t shrink-0"
                style={{ borderColor: 'var(--color-border, rgba(255,255,255,0.08))' }}
              >
                <span
                  className="text-xs"
                  style={{ color: 'var(--color-text-secondary, #94a3b8)' }}
                >
                  {pokemon.length} Pokémon
                </span>

                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage <= 1}
                      className="p-1.5 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{
                        color: 'var(--color-text-secondary, #94a3b8)',
                      }}
                      onMouseEnter={(e) => {
                        if (currentPage > 1) {
                          e.currentTarget.style.backgroundColor = 'var(--color-hover, rgba(255,255,255,0.06))';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                      aria-label="Previous page"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    <span
                      className="text-xs font-medium px-2"
                      style={{ color: 'var(--color-text-primary, #ffffff)' }}
                    >
                      {currentPage} / {totalPages}
                    </span>

                    <button
                      onClick={handleNextPage}
                      disabled={currentPage >= totalPages}
                      className="p-1.5 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{
                        color: 'var(--color-text-secondary, #94a3b8)',
                      }}
                      onMouseEnter={(e) => {
                        if (currentPage < totalPages) {
                          e.currentTarget.style.backgroundColor = 'var(--color-hover, rgba(255,255,255,0.06))';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                      aria-label="Next page"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
