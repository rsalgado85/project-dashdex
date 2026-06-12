import { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Swords, Shield, Eye, Brain, Gauge, ArrowRight } from 'lucide-react';
import { useEnrichedPokemon, usePokemonSpecies, useEvolutionChain, useAllPokemon } from '@/hooks/usePokemon';
import { useAppStore } from '@/store/useAppStore';
import { capitalize, formatPokemonId, getStatColor } from '@/utils/pokemonUtils';
import { ChartSkeleton } from '@/components/common/Skeleton';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { getTypeIcon } from '@/constants/typeIcons';
import { GenerationBadge } from '@/components/common/GenerationBadge';
import { t } from '@/constants/translations';
import type { EvolutionNode } from '@/types/pokemon';

const STAT_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  hp: Heart,
  attack: Swords,
  defense: Shield,
  'special-attack': Eye,
  'special-defense': Brain,
  speed: Gauge,
};

// Flatten evolution chain into a list of species names
function flattenEvolutionChain(node: EvolutionNode): string[] {
  const names: string[] = [node.species.name];
  for (const child of node.evolves_to) {
    names.push(...flattenEvolutionChain(child));
  }
  return names;
}

export function PokemonDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: pokemon, isLoading } = useEnrichedPokemon(id ?? '');
  const { data: species } = usePokemonSpecies(pokemon?.id ?? 0);
  const { data: allPokemon } = useAllPokemon();
  const { addFavorite, removeFavorite, isFavorite, addToHistory, language } = useAppStore();

  // Extract evolution chain ID from species URL
  const evolutionChainId = useMemo(() => {
    if (!species?.evolution_chain?.url) return null;
    const parts = species.evolution_chain.url.split('/');
    return Number(parts[parts.length - 2]) || null;
  }, [species]);

  const { data: evolutionChain } = useEvolutionChain(evolutionChainId ?? 0);

  // Build evolution chain with images
  const evolutionData = useMemo(() => {
    if (!evolutionChain || !allPokemon) return null;
    const names = flattenEvolutionChain(evolutionChain.chain);
    
    // Create a map of pokemon name -> pokemon data
    const pokemonMap = new Map(allPokemon.map((p) => [p.name.toLowerCase(), p]));
    
    return names.map((name) => {
      const p = pokemonMap.get(name.toLowerCase());
      return {
        name,
        id: p?.id ?? 0,
        imageUrl: p?.artworkUrl ?? '',
        types: p?.types ?? [],
      };
    }).filter((e) => e.id > 0);
  }, [evolutionChain, allPokemon]);

  // Add to history when viewed
  useEffect(() => {
    if (pokemon?.id) {
      addToHistory(pokemon.id);
    }
  }, [pokemon?.id, addToHistory]);

  const favorite = pokemon ? isFavorite(pokemon.id) : false;

  const flavorText = useMemo(() => 
    species?.flavor_text_entries
      ?.find((entry) => entry.language.name === 'en')
      ?.flavor_text?.replace(/[\n\f]/g, ' '),
    [species]
  );

  const genus = useMemo(() => 
    species?.genera
      ?.find((g) => g.language.name === 'en')
      ?.genus,
    [species]
  );

  const statChartData = useMemo(() => pokemon ? [
    { name: 'HP', value: pokemon.computedStats.hp, color: '#00b894' },
    { name: 'Attack', value: pokemon.computedStats.attack, color: '#e17055' },
    { name: 'Defense', value: pokemon.computedStats.defense, color: '#74b9ff' },
    { name: 'Sp. Atk', value: pokemon.computedStats.specialAttack, color: '#a29bfe' },
    { name: 'Sp. Def', value: pokemon.computedStats.specialDefense, color: '#6c5ce7' },
    { name: 'Speed', value: pokemon.computedStats.speed, color: '#fdcb6e' },
  ] : [], [pokemon]);

  if (isLoading || !pokemon) {
    return (
      <div className="space-y-8">
        <ChartSkeleton height="h-96" />
        <ChartSkeleton height="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
        aria-label={t('common.goBack', language)}
      >
        <ArrowLeft size={20} />
        <span className="text-sm">{t('common.back', language)}</span>
      </button>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 relative overflow-hidden"
      >
        <div className="animated-gradient absolute inset-0" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8">
          {/* Image */}
          <div className="flex-shrink-0">
            <motion.img
              src={pokemon.artworkUrl}
              alt={pokemon.name}
              className="w-48 h-48 lg:w-64 lg:h-64 object-contain drop-shadow-2xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              loading="eager"
              fetchPriority="high"
            />
          </div>

          {/* Info */}
          <div className="flex-1 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-between gap-4 mb-4">
              <div>
                <p className="text-text-secondary text-sm">{formatPokemonId(pokemon.id)}</p>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl lg:text-4xl font-bold gradient-text">
                    {capitalize(pokemon.name)}
                  </h1>
                  <GenerationBadge pokemonId={pokemon.id} size="md" />
                </div>
                {genus && (
                  <p className="text-text-secondary text-sm mt-1">{genus}</p>
                )}
              </div>
              <button
                onClick={() => favorite ? removeFavorite(pokemon.id) : addFavorite(pokemon.id)}
                className={`p-3 rounded-xl transition-all ${
                  favorite
                    ? 'bg-danger/20 text-danger'
                    : 'bg-glass hover:bg-glass-hover text-text-secondary'
                }`}
                aria-label={favorite ? t('common.removeFavorites', language) : t('common.addFavorites', language)}
              >
                <Heart size={20} fill={favorite ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Types with icons */}
            <div className="flex gap-2 justify-center lg:justify-start mb-4">
              {pokemon.types.map((t) => {
                const TypeIcon = getTypeIcon(t.type.name);
                return (
                  <span key={t.type.name} className={`type-badge type-${t.type.name} flex items-center gap-1.5`}>
                    <TypeIcon size={12} />
                    {t.type.name}
                  </span>
                );
              })}
            </div>

            {/* Description */}
            {flavorText && (
              <p className="text-text-secondary text-sm leading-relaxed mb-4">
                {flavorText}
              </p>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-4 max-w-lg mx-auto lg:mx-0">
              <div className="text-center p-3 rounded-xl bg-glass">
                <p className="text-xs text-text-secondary">{t('detail.weight', language)}</p>
                <p className="font-semibold">{(pokemon.weight / 10).toFixed(1)} {t('common.kg', language)}</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-glass">
                <p className="text-xs text-text-secondary">{t('detail.height', language)}</p>
                <p className="font-semibold">{(pokemon.height / 10).toFixed(1)} {t('common.m', language)}</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-glass">
                <p className="text-xs text-text-secondary">{t('detail.baseExp', language)}</p>
                <p className="font-semibold">{pokemon.base_experience}</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-glass">
                <p className="text-xs text-text-secondary">{t('common.total', language)}</p>
                <p className="font-bold gradient-text">{pokemon.totalStats}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Evolution Chain */}
      {evolutionData && evolutionData.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card p-6"
        >
          <h2 className="text-lg font-semibold mb-6">{t('detail.evolutionChain', language)}</h2>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {evolutionData.map((evo, index) => (
              <div key={evo.id} className="flex items-center gap-4">
                {/* Evolution card */}
                <button
                  onClick={() => navigate(`/pokemon/${evo.id}`)}
                  className={`flex flex-col items-center gap-1.5 p-4 rounded-xl transition-all hover:scale-105 min-w-[130px] ${
                    evo.id === pokemon.id
                      ? 'bg-accent/15 border border-accent/30 ring-1 ring-accent/20'
                      : 'bg-glass hover:bg-glass-hover'
                  }`}
                >
                  <img
                    src={evo.imageUrl}
                    alt={evo.name}
                    className="w-16 h-16 object-contain"
                    loading="lazy"
                  />
                  <span className={`text-sm font-medium ${
                    evo.id === pokemon.id ? 'text-accent-light' : 'text-text-primary'
                  }`}>
                    {capitalize(evo.name)}
                  </span>
                  <span className="text-[10px] text-text-secondary">
                    #{String(evo.id).padStart(3, '0')}
                  </span>
                  <GenerationBadge pokemonId={evo.id} size="sm" />
                  <div className="flex gap-1">
                    {evo.types.map((t) => {
                      const TypeIcon = getTypeIcon(t.type.name);
                      return (
                        <span key={t.type.name} className={`type-badge type-${t.type.name} text-[8px] px-1.5 py-0.5`}>
                          <TypeIcon size={6} />
                        </span>
                      );
                    })}
                  </div>
                </button>

                {/* Arrow between evolutions */}
                {index < evolutionData.length - 1 && (
                  <ArrowRight size={20} className="text-text-secondary flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Stats Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6"
      >
        <h2 className="text-lg font-semibold mb-4">{t('detail.stats', language)}</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bar Chart */}
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statChartData} layout="vertical">
              <XAxis type="number" domain={[0, 255]} stroke="#8b8b9e" />
              <YAxis type="category" dataKey="name" stroke="#8b8b9e" width={80} />
              <Tooltip
                contentStyle={{
                  background: '#13131a',
                  border: '1px solid #1e1e2a',
                  borderRadius: '12px',
                }}
              />
              <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={20}>
                {statChartData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Stat Details */}
          <div className="space-y-3">
            {pokemon.stats.map((stat) => {
              const Icon = STAT_ICONS[stat.stat.name] || Gauge;
              const percentage = (stat.base_stat / 255) * 100;
              return (
                <div key={stat.stat.name}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Icon size={14} className="text-text-secondary" />
                      <span className="text-sm text-text-secondary">
                        {capitalize(stat.stat.name.replace('-', ' '))}
                      </span>
                    </div>
                    <span className="text-sm font-bold gradient-text">{stat.base_stat}</span>
                  </div>
                  <div className="stat-bar">
                    <motion.div
                      className="stat-bar-fill"
                      style={{ backgroundColor: getStatColor(stat.stat.name) }}
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              );
            })}
            <div className="pt-2 border-t border-dark-border">
              <div className="flex justify-between">
                <span className="text-sm text-text-secondary">{t('common.total', language)}</span>
                <span className="text-sm font-bold gradient-text">{pokemon.totalStats}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Abilities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-6"
      >
        <h2 className="text-lg font-semibold mb-4">{t('detail.abilities', language)}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {pokemon.abilities.map((ability) => (
            <div key={ability.ability.name} className="p-4 rounded-xl bg-glass">
              <div className="flex items-center gap-2 mb-1">
                <Brain size={14} className="text-accent-light" />
                <span className="font-medium text-sm">
                  {capitalize(ability.ability.name.replace('-', ' '))}
                </span>
                {ability.is_hidden && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent-light">
                    {t('common.hidden', language)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
