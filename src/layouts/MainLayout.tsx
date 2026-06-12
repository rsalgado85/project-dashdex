import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/common/Sidebar';
import { LoadingOverlay } from '@/components/common/LoadingOverlay';
import { useAppStore } from '@/store/useAppStore';
import { useProgressivePokemon } from '@/hooks/useProgressiveLoader';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, LayoutDashboard, Search, GitCompare, Trophy, Heart } from 'lucide-react';

const MOBILE_NAV_ITEMS = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/explorer', icon: Search, label: 'Explore' },
  { path: '/compare', icon: GitCompare, label: 'Compare' },
  { path: '/rankings', icon: Trophy, label: 'Rankings' },
  { path: '/favorites', icon: Heart, label: 'Faves' },
];

export function MainLayout() {
  const { sidebarCollapsed, toggleSidebar, theme } = useAppStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const {
    isLoading,
    isLoaded,
    progress,
    currentGeneration,
    loadedPokemon,
    totalPokemon,
    currentGenPokemon,
    totalGenPokemon,
  } = useProgressivePokemon();

  // Apply theme class to document
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
  }, [theme]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Scroll to top on route change
  useEffect(() => {
    const mainContent = document.querySelector('main');
    if (mainContent) {
      mainContent.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const bgStyle = theme === 'light'
    ? { background: '#f0f2f5' }
    : { background: 'radial-gradient(ellipse at 20% 50%, #1e293b 0%, #111827 40%, #0f172a 70%, #0b1220 100%)' };

  return (
    <div className="flex h-screen overflow-hidden" style={bgStyle}>
      {/* Loading Overlay - only renders during first-time data load (no flash if cached) */}
      {isLoading && (
        <LoadingOverlay
          isVisible={true}
          progress={progress}
          currentGeneration={currentGeneration}
          loadedPokemon={loadedPokemon}
          totalPokemon={totalPokemon}
          currentGenPokemon={currentGenPokemon}
          totalGenPokemon={totalGenPokemon}
        />
      )}

      {/* Desktop Sidebar - hidden on mobile */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 z-50 h-full w-[280px] lg:hidden"
            >
              <Sidebar />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between px-3 py-3" style={{
          borderBottom: theme === 'light' ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(255,255,255,0.04)',
          backgroundColor: theme === 'light' ? 'rgba(255,255,255,0.8)' : 'transparent',
          backdropFilter: theme === 'light' ? 'blur(12px)' : 'none',
        }}>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-lg transition-colors active:scale-95"
            style={{ color: theme === 'light' ? 'var(--color-text-secondary)' : 'rgba(255,255,255,0.6)' }}
            aria-label="Open navigation menu"
          >
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#ff4d6d] to-[#d946ef] flex items-center justify-center p-1">
              <img src="/logo.svg" alt="DASHDEX" className="w-full h-full object-contain" />
            </div>
            <span className="text-base font-black tracking-tight" style={{ color: theme === 'light' ? '#1a1a2e' : '#ffffff' }}>
              DASH<span className="text-[#ff4d6d]">DEX</span>
            </span>
          </div>
          <div className="w-9" />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto px-3 py-4 md:px-6 md:py-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </main>

        {/* Mobile Bottom Nav - visible only on mobile */}
        <MobileBottomNav />

        {/* Copyright Footer - hidden on mobile (replaced by bottom nav) */}
        <footer className="hidden lg:block py-3 px-4 md:px-6 lg:px-8 text-center" style={{
          borderTop: theme === 'light' ? '1px solid rgba(0,0,0,0.04)' : '1px solid rgba(255,255,255,0.04)',
        }}>
          <p className="text-xs" style={{ color: theme === 'light' ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.3)' }}>
            &copy; {new Date().getFullYear()} DASHDEX - Pokédex Analytics. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}

/**
 * Mobile Bottom Navigation Bar
 * Replaces the sidebar on mobile with a compact bottom tab bar.
 * Shows only the 5 most important navigation items.
 */
function MobileBottomNav() {
  const { theme } = useAppStore();
  const isDark = theme === 'dark';
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav
      className="lg:hidden flex items-center justify-around px-2 py-1 safe-area-bottom"
      style={{
        backgroundColor: isDark ? 'rgba(11, 18, 32, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
      aria-label="Mobile navigation"
    >
      {MOBILE_NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="flex flex-col items-center gap-0.5 py-1 px-2 min-w-0 transition-all active:scale-90"
            style={{ color: isActive ? '#ff4d6d' : isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)' }}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon size={20} />
            <span className="text-[9px] font-semibold truncate max-w-full">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
