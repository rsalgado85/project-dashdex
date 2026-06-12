/**
 * LoadingOverlay - Premium Loading Screen
 *
 * Premium gaming-style loading overlay that shows real-time progress
 * of Pokémon data loading by generation. Features:
 * - Animated Pokéball spinner
 * - Generation-by-generation progress bar
 * - Current generation being loaded with icon
 * - Smooth entrance/exit animations via Framer Motion
 * - Glassmorphism design with gradient accents
 *
 * Inspired by: Pokémon Scarlet & Violet loading screens,
 * Nintendo Switch startup animation, Valorant loading screens
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { t } from '@/constants/translations';
import { useEffect, useState } from 'react';

interface LoadingOverlayProps {
  isVisible: boolean;
  progress: number; // 0-100
  currentGeneration: string;
  loadedPokemon: number;
  totalPokemon: number;
  currentGenPokemon: number;
  totalGenPokemon: number;
  onComplete?: () => void;
}

const GENERATION_ICONS: Record<string, string> = {
  'generation-i': '❶',
  'generation-ii': '❷',
  'generation-iii': '❸',
  'generation-iv': '❹',
  'generation-v': '❺',
  'generation-vi': '❻',
  'generation-vii': '❼',
  'generation-viii': '❽',
  'generation-ix': '❾',
  'generation-x': '❿',
};

const GENERATION_COLORS: Record<string, string> = {
  'generation-i': '#667eea',
  'generation-ii': '#f093fb',
  'generation-iii': '#4facfe',
  'generation-iv': '#43e97b',
  'generation-v': '#fa709a',
  'generation-vi': '#a18cd1',
  'generation-vii': '#fccb90',
  'generation-viii': '#e0c3fc',
  'generation-ix': '#f5576c',
  'generation-x': '#ff6f00',
};

const LOADING_TIPS = [
  'loading.tip1',
  'loading.tip2',
  'loading.tip3',
  'loading.tip4',
  'loading.tip5',
  'loading.tip6',
];

export function LoadingOverlay({
  isVisible,
  progress,
  currentGeneration,
  loadedPokemon,
  totalPokemon,
  currentGenPokemon,
  totalGenPokemon,
}: LoadingOverlayProps) {
  const { language, theme } = useAppStore();
  const isDark = theme === 'dark';
  const [tipIndex, setTipIndex] = useState(0);

  // Rotate tips every 4 seconds
  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % LOADING_TIPS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isVisible]);

  const genColor = GENERATION_COLORS[currentGeneration] || '#6c5ce7';
  const genIcon = GENERATION_ICONS[currentGeneration] || '◉';
  const genDisplayName = currentGeneration
    .replace('generation-', 'Gen ')
    .replace(/^g/, 'G')
    .toUpperCase();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            background: isDark
              ? 'radial-gradient(ellipse at center, #1e293b 0%, #0f172a 50%, #020617 100%)'
              : 'radial-gradient(ellipse at center, #f0f2f5 0%, #e2e8f0 50%, #cbd5e1 100%)',
          }}
        >
          {/* Background decorative particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: `${100 + i * 50}px`,
                  height: `${100 + i * 50}px`,
                  background: `radial-gradient(circle, ${genColor}${isDark ? '11' : '08'} 0%, transparent 70%)`,
                  left: `${15 + i * 12}%`,
                  top: `${20 + (i % 3) * 25}%`,
                }}
                animate={{
                  x: [0, 30, 0, -20, 0],
                  y: [0, -20, 10, 20, 0],
                  scale: [1, 1.1, 0.95, 1.05, 1],
                }}
                transition={{
                  duration: 8 + i * 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>

          {/* Main Content */}
          <div className="relative z-10 flex flex-col items-center max-w-md w-full px-6">
            {/* Logo */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
              className="mb-8"
            >
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${genColor}33, ${genColor}11)`,
                  border: `2px solid ${genColor}44`,
                  boxShadow: `0 0 40px ${genColor}22`,
                }}
              >
                <img
                  src="/logo.svg"
                  alt="DASHDEX"
                  className="w-full h-full object-contain"
                />
              </div>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-black tracking-tight mb-2"
              style={{ color: isDark ? '#ffffff' : '#1a1a2e' }}
            >
              DASH<span style={{ color: '#ff4d6d' }}>DEX</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-sm mb-8"
              style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }}
            >
              {t('loading.preparing', language)}
            </motion.p>

            {/* Progress Bar Container */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="w-full space-y-4"
            >
              {/* Current Generation Indicator */}
              <div
                className="flex items-center gap-3 p-3 rounded-2xl"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                  border: `1px solid ${genColor}22`,
                }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                  style={{
                    background: `${genColor}22`,
                    border: `1px solid ${genColor}44`,
                  }}
                >
                  {genIcon}
                </motion.div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-bold truncate"
                    style={{ color: isDark ? '#ffffff' : '#1a1a2e' }}
                  >
                    {t('loading.loadingGen', language)} {genDisplayName}
                  </p>
                  <p
                    className="text-[11px]"
                    style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}
                  >
                    {currentGenPokemon} / {totalGenPokemon} {t('loading.pokemon', language)}
                  </p>
                </div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: genColor, boxShadow: `0 0 8px ${genColor}` }}
                />
              </div>

              {/* Progress Bar */}
              <div
                className="w-full h-3 rounded-full overflow-hidden"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                }}
              >
                <motion.div
                  className="h-full rounded-full relative"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  style={{
                    background: `linear-gradient(90deg, ${genColor}, #ff4d6d)`,
                    boxShadow: `0 0 12px ${genColor}44`,
                  }}
                >
                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                    }}
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </motion.div>
              </div>

              {/* Stats Row */}
              <div className="flex items-center justify-between">
                <span
                  className="text-xs font-mono"
                  style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}
                >
                  {loadedPokemon.toLocaleString()} / {totalPokemon.toLocaleString()}
                </span>
                <span
                  className="text-xs font-bold font-mono"
                  style={{ color: genColor }}
                >
                  {Math.round(progress)}%
                </span>
              </div>
            </motion.div>

            {/* Tips Carousel */}
            <motion.div
              key={tipIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="mt-8 text-center"
            >
              <p
                className="text-[11px] italic max-w-xs mx-auto leading-relaxed"
                style={{ color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)' }}
              >
                💡 {t(LOADING_TIPS[tipIndex] as any, language)}
              </p>
            </motion.div>
          </div>

          {/* Bottom branding */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-8 text-center"
          >
            <p
              className="text-[10px] tracking-widest uppercase"
              style={{ color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' }}
            >
              {t('loading.poweredBy', language)}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
