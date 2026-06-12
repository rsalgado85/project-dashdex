/**
 * VideogamesPage - Pokémon Video Games Database
 *
 * Fetches and displays all Pokémon video games from the RAWG API.
 * Features:
 * - Grid of game cards with cover art, rating, release date
 * - Search by name
 * - Filter by platform/console
 * - Game detail modal with full description
 * - Ordered from newest to oldest
 * - Vanguard/avant-garde visual style
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ChevronDown, ChevronUp, Star, Calendar, Monitor, Clock, Gamepad2, ArrowLeft, ArrowRight, Trophy } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { fetchPokemonGames, fetchGameDetail, fetchPlatforms } from '@/services/rawg.service';
import type { RawgGame, RawgGameDetail, Platform } from '@/services/rawg.service';

const PLATFORM_LOGOS: Record<string, string> = {
  'nintendo-switch': '🕹️',
  'nintendo-3ds': '🎮',
  'nintendo-ds': '🎮',
  'game-boy-advance': '🎮',
  'game-boy-color': '🎮',
  'game-boy': '🎮',
  'nintendo-64': '🎮',
  'super-nintendo': '🎮',
  'nintendo-enterprise-system': '🎮',
  'pc': '💻',
  'ios': '📱',
  'android': '📱',
};

function formatDate(dateStr: string): string {
  if (!dateStr) return 'TBA';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function getYear(dateStr: string): string {
  if (!dateStr) return 'TBA';
  return dateStr.split('-')[0];
}

function getMetacriticColor(score: number | null): string {
  if (!score) return '#4a5568';
  if (score >= 80) return '#48bb78';
  if (score >= 60) return '#ecc94b';
  return '#f56565';
}

export function VideogamesPage() {
  const { theme, language } = useAppStore();
  const isDark = theme === 'dark';

  const [games, setGames] = useState<RawgGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedGame, setSelectedGame] = useState<RawgGameDetail | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchPlatforms().then(setPlatforms).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchPokemonGames(page, 20, debouncedSearch || undefined, selectedPlatform || undefined)
      .then((data) => { if (!cancelled) { setGames(data.results); setTotalCount(data.count); setLoading(false); } })
      .catch((err) => { if (!cancelled) { setError(err.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, [page, debouncedSearch, selectedPlatform]);

  const openDetail = useCallback(async (gameId: number) => {
    try { const detail = await fetchGameDetail(gameId); setSelectedGame(detail); }
    catch { setSelectedGame(null); }
  }, []);

  const totalPages = Math.ceil(totalCount / 20);
  const relevantPlatforms = platforms.filter((p) =>
    p.name.toLowerCase().includes('nintendo') || p.name.toLowerCase().includes('game boy') ||
    p.name.toLowerCase().includes('switch') || p.name.toLowerCase().includes('ds') ||
    p.name.toLowerCase().includes('3ds') || p.name.toLowerCase() === 'pc' ||
    p.name.toLowerCase() === 'ios' || p.name.toLowerCase() === 'android'
  );

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
        <h1 className="text-3xl font-bold gradient-text">Pokémon Videogames</h1>
        <p className="text-text-secondary">Complete database of Pokémon video games across all consoles and generations</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="relative">
        <div className="rounded-2xl p-1" style={{ background: isDark ? 'linear-gradient(135deg, rgba(255,77,109,0.2), rgba(217,70,239,0.2))' : 'linear-gradient(135deg, rgba(255,77,109,0.1), rgba(217,70,239,0.1))' }}>
          <div className="rounded-xl flex flex-col sm:flex-row gap-3 p-3" style={{ backgroundColor: isDark ? 'rgba(11,18,32,0.9)' : 'rgba(255,255,255,0.9)', backdropFilter: 'blur(20px)' }}>
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }} />
              <input ref={searchRef} type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Pokémon games..."
                className="w-full pl-9 pr-8 py-2.5 rounded-xl text-sm outline-none transition-all"
                style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', color: isDark ? '#ffffff' : '#1a1a2e', border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}
              />
              {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10 transition-colors"><X size={14} style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }} /></button>}
            </div>
            <button onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{ color: showFilters ? '#ffffff' : isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)', border: `1px solid ${showFilters ? 'transparent' : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`, background: showFilters ? 'linear-gradient(90deg, #ff4d6d, #d946ef)' : isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }}>
              <Monitor size={16} /> <span>Platform</span> {showFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mt-2">
              <div className="rounded-2xl p-3 flex flex-wrap gap-2" style={{ backgroundColor: isDark ? 'rgba(11,18,32,0.8)' : 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
                <button onClick={() => setSelectedPlatform('')}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{ color: !selectedPlatform ? '#ffffff' : isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)', background: !selectedPlatform ? 'linear-gradient(90deg, #ff4d6d, #d946ef)' : isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', border: `1px solid ${!selectedPlatform ? 'transparent' : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
                  All Platforms
                </button>
                {relevantPlatforms.map((p) => (
                  <button key={p.id} onClick={() => setSelectedPlatform(selectedPlatform === p.id.toString() ? '' : p.id.toString())}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={{ color: selectedPlatform === p.id.toString() ? '#ffffff' : isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)', background: selectedPlatform === p.id.toString() ? 'linear-gradient(90deg, #ff4d6d, #d946ef)' : isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', border: `1px solid ${selectedPlatform === p.id.toString() ? 'transparent' : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
                    {PLATFORM_LOGOS[p.slug] || '🎮'} {p.name}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="flex items-center justify-between">
        <p className="text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)' }}>{totalCount} Pokémon games found</p>
        {loading && <div className="flex items-center gap-2 text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)' }}>
          <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)', borderTopColor: '#ff4d6d' }} /> Loading...</div>}
      </motion.div>

      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl p-6 text-center" style={{ backgroundColor: isDark ? 'rgba(255,77,109,0.1)' : 'rgba(255,77,109,0.05)', border: `1px solid ${isDark ? 'rgba(255,77,109,0.2)' : 'rgba(255,77,109,0.1)'}` }}>
          <p className="text-sm font-medium" style={{ color: '#ff4d6d' }}>{error}</p>
          <button onClick={() => { setPage(1); setSearch(''); setSelectedPlatform(''); }} className="mt-3 px-4 py-2 rounded-xl text-xs font-medium text-white" style={{ background: 'linear-gradient(90deg, #ff4d6d, #d946ef)' }}>Reset Filters</button>
        </motion.div>
      )}

      {!error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          <AnimatePresence mode="popLayout">
            {games.map((game, index) => (
              <motion.div key={game.id} layout initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: index * 0.03, duration: 0.3 }}
                onClick={() => openDetail(game.id)} className="group cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 hover:translate-y-[-6px]"
                style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`, boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.2)' : '0 2px 12px rgba(0,0,0,0.04)' }}>
                <div className="relative aspect-[16/9] overflow-hidden">
                  {game.background_image ? <img src={game.background_image} alt={game.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                    : <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #ff4d6d22, #d946ef22)' }}><Gamepad2 size={48} style={{ opacity: 0.3 }} /></div>}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  {game.metacritic && <div className="absolute top-3 right-3 w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shadow-lg" style={{ backgroundColor: getMetacriticColor(game.metacritic), color: '#ffffff' }}>{game.metacritic}</div>}
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider backdrop-blur-md" style={{ backgroundColor: 'rgba(0,0,0,0.5)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.1)' }}>{getYear(game.released)}</div>
                  <div className="absolute bottom-3 left-3 right-3"><h3 className="text-sm font-bold text-white leading-tight drop-shadow-lg">{game.name}</h3></div>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    {game.platforms.slice(0, 4).map((p) => (
                      <span key={p.platform.id} className="px-2 py-0.5 rounded-md text-[9px] font-semibold uppercase tracking-wider"
                        style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }}>
                        {PLATFORM_LOGOS[p.platform.slug] || '🎮'} {p.platform.name.split(' ').slice(0, 2).join(' ')}
                      </span>
                    ))}
                    {game.platforms.length > 4 && <span className="text-[9px] font-medium" style={{ color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)' }}>+{game.platforms.length - 4}</span>}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5"><Star size={12} fill="#f6e05e" color="#f6e05e" /><span className="text-xs font-semibold" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>{game.rating.toFixed(1)}</span></div>
                    <div className="flex items-center gap-1.5"><Calendar size={11} style={{ color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)' }} /><span className="text-[10px] font-medium" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)' }}>{formatDate(game.released)}</span></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {!loading && !error && games.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <Gamepad2 size={64} className="mx-auto mb-4" style={{ opacity: 0.2 }} />
          <p className="text-lg font-medium" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)' }}>No Pokémon games found</p>
          <p className="text-sm mt-1" style={{ color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)' }}>Try adjusting your search or filters</p>
        </motion.div>
      )}

      {totalPages > 1 && !error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex items-center justify-center gap-3">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-all disabled:opacity-30"
            style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
            <ArrowLeft size={14} /> Previous
          </button>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const startPage = Math.max(1, Math.min(page - 2, totalPages - 4));
              const pageNum = startPage + i;
              if (pageNum > totalPages) return null;
              return (
                <button key={pageNum} onClick={() => setPage(pageNum)}
                  className="w-9 h-9 rounded-xl text-xs font-bold transition-all"
                  style={{ color: page === pageNum ? '#ffffff' : isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)', background: page === pageNum ? 'linear-gradient(90deg, #ff4d6d, #d946ef)' : isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', border: `1px solid ${page === pageNum ? 'transparent' : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
                  {pageNum}
                </button>
              );
            })}
          </div>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-all disabled:opacity-30"
            style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
            Next <ArrowRight size={14} />
          </button>
        </motion.div>
      )}

      <AnimatePresence>
        {selectedGame && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
            onClick={() => setSelectedGame(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()} className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl"
              style={{ backgroundColor: isDark ? '#0b1220' : '#ffffff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`, boxShadow: '0 25px 80px rgba(0,0,0,0.5)' }}>
              <button onClick={() => setSelectedGame(null)} className="absolute top-4 right-4 z-10 w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-md transition-all hover:scale-110"
                style={{ backgroundColor: 'rgba(0,0,0,0.5)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.1)' }}><X size={18} /></button>
              <div className="relative h-64 md:h-80 overflow-hidden">
                {selectedGame.background_image ? <img src={selectedGame.background_image} alt={selectedGame.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #ff4d6d33, #d946ef33)' }}><Gamepad2 size={80} style={{ opacity: 0.3 }} /></div>}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b1220] via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <h2 className="text-2xl md:text-3xl font-black text-white drop-shadow-lg">{selectedGame.name}</h2>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-sm text-white/70">{formatDate(selectedGame.released)}</span>
                    {selectedGame.metacritic && <span className="px-2 py-0.5 rounded-lg text-xs font-bold" style={{ backgroundColor: getMetacriticColor(selectedGame.metacritic), color: '#ffffff' }}>{selectedGame.metacritic}</span>}
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="rounded-2xl p-4" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}` }}>
                    <Star size={16} className="mb-1" fill="#f6e05e" color="#f6e05e" />
                    <p className="text-lg font-bold" style={{ color: isDark ? '#ffffff' : '#1a1a2e' }}>{selectedGame.rating.toFixed(1)}</p>
                    <p className="text-[10px] font-medium" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)' }}>Rating ({selectedGame.ratings_count})</p>
                  </div>
                  <div className="rounded-2xl p-4" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}` }}>
                    <Clock size={16} className="mb-1" style={{ opacity: 0.6 }} />
                    <p className="text-lg font-bold" style={{ color: isDark ? '#ffffff' : '#1a1a2e' }}>{selectedGame.playtime}h</p>
                    <p className="text-[10px] font-medium" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)' }}>Playtime</p>
                  </div>
                  <div className="rounded-2xl p-4" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}` }}>
                    <Trophy size={16} className="mb-1" style={{ opacity: 0.6 }} />
                    <p className="text-lg font-bold" style={{ color: isDark ? '#ffffff' : '#1a1a2e' }}>{selectedGame.added.toLocaleString()}</p>
                    <p className="text-[10px] font-medium" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)' }}>Added to lists</p>
                  </div>
                  <div className="rounded-2xl p-4" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}` }}>
                    <Monitor size={16} className="mb-1" style={{ opacity: 0.6 }} />
                    <p className="text-lg font-bold" style={{ color: isDark ? '#ffffff' : '#1a1a2e' }}>{selectedGame.platforms.length}</p>
                    <p className="text-[10px] font-medium" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)' }}>Platforms</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-2" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>About</h3>
                  <p className="text-sm leading-relaxed" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)' }}>{selectedGame.description_raw || 'No description available.'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-3" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>Available on</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedGame.platforms.map((p) => (
                      <span key={p.platform.id} className="px-3 py-1.5 rounded-xl text-xs font-medium"
                        style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}` }}>
                        {PLATFORM_LOGOS[p.platform.slug] || '🎮'} {p.platform.name}
                      </span>
                    ))}
                  </div>
                </div>
                {selectedGame.developers && selectedGame.developers.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-2" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>Developers</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedGame.developers.map((d) => (
                        <span key={d.id} className="px-3 py-1.5 rounded-xl text-xs font-medium"
                          style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}` }}>
                          {d.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
