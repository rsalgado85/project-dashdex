/**
 * Recent Pokémon Viewed Card - Inspired by Matches from reference
 * Shows recently viewed Pokémon as mini cards
 */

import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAllPokemon } from '@/hooks/usePokemon';
import { useAppStore } from '@/store/useAppStore';
import { capitalize, formatPokemonId } from '@/utils/pokemonUtils';
import { TYPE_COLORS } from '@/constants';
import { Clock, ChevronRight } from 'lucide-react';
import { GenerationBadge } from '@/components/common/GenerationBadge';
import { t } from '@/constants/translations';

export function RecentPokemonCard() {
  const navigate = useNavigate();
  const { history, language } = useAppStore();
  const { data: allPokemon } = useAllPokemon();

  const recentPokemon = useMemo(() => {
    if (!allPokemon || history.length === 0) return [];
    return history
      .slice(0, 4)
      .map((id) => allPokemon.find((p) => p.id === id))
      .filter(Boolean);
  }, [allPokemon, history]);

  return (
    <motion.div
      className="rounded-[32px] p-6 h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      style={{
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(25px)',
        WebkitBackdropFilter: 'blur(25px)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
            <Clock size={18} className="text-text-secondary" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-primary">{t('dashboard.recentViewed', language)}</h3>
            <p className="text-[10px] text-text-secondary">{t('dashboard.yourHistory', language)}</p>
          </div>
        </div>
        {recentPokemon.length > 0 && (
          <motion.button
            onClick={() => navigate('/explorer')}
            className="text-[11px] font-semibold px-3 py-1.5 rounded-full flex items-center gap-1"
            style={{
              backgroundColor: 'rgba(255,255,255,0.06)',
              color: 'var(--color-text-secondary)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {t('dashboard.viewAll', language)} <ChevronRight size={12} />
          </motion.button>
        )}
      </div>

      {/* Recent Pokémon Grid */}
      {recentPokemon.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Clock size={32} className="text-text-secondary opacity-30 mb-2" />
          <p className="text-xs text-text-secondary opacity-50">{t('dashboard.noRecent', language)}</p>
          <p className="text-[10px] text-text-secondary opacity-30 mt-1">{t('dashboard.startExploring', language)}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5">
          {recentPokemon.map((pokemon, i) => {
            if (!pokemon) return null;
            const typeColor = TYPE_COLORS[pokemon.dominantType] || '#6c5ce7';
            return (
              <motion.button
                key={pokemon.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                onClick={() => navigate(`/pokemon/${pokemon.id}`)}
                className="relative overflow-hidden rounded-2xl p-3 text-left group"
                style={{
                  backgroundColor: `${typeColor}11`,
                  border: `1px solid ${typeColor}22`,
                }}
                whileHover={{
                  scale: 1.03,
                  backgroundColor: `${typeColor}22`,
                  transition: { duration: 0.2 },
                }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Pokémon image */}
                <div className="flex items-center gap-2.5">
                  <motion.img
                    src={pokemon.artworkUrl}
                    alt={pokemon.name}
                    className="w-10 h-10 object-contain flex-shrink-0"
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-text-primary truncate">
                      {capitalize(pokemon.name)}
                    </p>
                    <p className="text-[9px] text-text-secondary font-mono">
                      {formatPokemonId(pokemon.id)}
                    </p>
                  </div>
                </div>

                {/* Generation badge */}
                <div className="absolute top-2 right-2">
                  <GenerationBadge pokemonId={pokemon.id} size="sm" />
                </div>
              </motion.button>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
