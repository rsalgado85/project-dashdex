/**
 * Premium Gaming Sidebar
 * 
 * Redesigned sidebar inspired by Valorant Tracker, Pokémon Home, and Nintendo Switch UI.
 * Features:
 * - 280px expanded / 80px collapsed (icon-only mode)
 * - Glassmorphism with blur effects
 * - Gradient active states with glow
 * - Smooth Framer Motion animations
 * - Collapsible via toggle button
 * - Theme-aware (dark/light mode)
 */

import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  BarChart3,
  GitCompare,
  Search,
  Trophy,
  Lightbulb,
  Heart,
  Gamepad2,
  BookOpen,
  User,
  Sun,
  Moon,
  Languages,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { NAV_ITEMS } from '@/constants';
import { t, type TranslationKey } from '@/constants/translations';

const iconMap: Record<string, React.ComponentType<{ size?: number }>> = {
  LayoutDashboard,
  BarChart3,
  GitCompare,
  Search,
  Trophy,
  Lightbulb,
  Heart,
  Gamepad2,
  BookOpen,
  User,
};

export function Sidebar() {
  const { sidebarCollapsed, theme, toggleTheme, language, toggleLanguage, toggleSidebar } = useAppStore();

  const isDark = theme === 'dark';

  const sidebarBg = isDark ? '#0b1220' : '#ffffff';
  const borderColor = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)';
  const textMuted = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)';
  const textHover = isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)';
  const hoverBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
  const logoSubtext = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)';

  return (
    <motion.aside
      className="fixed lg:relative z-30 h-full flex flex-col overflow-hidden"
      initial={false}
      animate={{
        width: sidebarCollapsed ? 80 : 280,
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      style={{
        backgroundColor: sidebarBg,
        borderRight: `1px solid ${borderColor}`,
        boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.04)',
      }}
      aria-label={t('common.mainNav', language)}
    >
      {/* Logo Section */}
      <div className="flex items-center justify-between px-6 py-6" style={{ borderBottom: `1px solid ${borderColor}` }}>
        <AnimatePresence mode="wait">
          {!sidebarCollapsed ? (
            <motion.div
              key="expanded-logo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center">
                <img src="/logo.svg" alt="DASHDEX" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight" style={{ color: isDark ? '#ffffff' : '#1a1a2e' }}>
                  DASH<span className="text-[#ff4d6d]">DEX</span>
                </h1>
                <p className="text-[10px] font-medium tracking-wider uppercase" style={{ color: logoSubtext }}>
                  Pokédex Analytics
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed-logo"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="w-full flex justify-center"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff4d6d] to-[#d946ef] flex items-center justify-center shadow-lg shadow-[#ff4d6d]/20 p-1.5">
                <img src="/logo.svg" alt="DASHDEX" className="w-full h-full object-contain" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
        {NAV_ITEMS.map((item) => {
          const Icon = iconMap[item.icon] || LayoutDashboard;
          const labelKey = `nav.${item.label.toLowerCase()}` as TranslationKey;
          const translatedLabel = t(labelKey, language);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="flex items-center gap-3 px-4 py-3 rounded-[999px] transition-all duration-200 group relative"
              style={({ isActive }) =>
                isActive
                  ? {
                      background: 'linear-gradient(90deg, #ff4d6d, #d946ef)',
                      boxShadow: isDark
                        ? '0 0 20px rgba(255,77,109,0.3), 0 0 40px rgba(217,70,239,0.15)'
                        : '0 0 12px rgba(255,77,109,0.2)',
                      color: '#ffffff',
                      fontWeight: 600,
                    }
                  : {
                      color: textMuted,
                    }
              }
              onMouseEnter={(e) => {
                if (!e.currentTarget.classList.contains('active')) {
                  e.currentTarget.style.color = textHover;
                }
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.classList.contains('active')) {
                  e.currentTarget.style.color = textMuted;
                }
              }}
              aria-label={translatedLabel}
            >
              <div className="flex items-center justify-center w-5 h-5 flex-shrink-0">
                <Icon size={20} />
              </div>
              <AnimatePresence mode="wait">
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.15 }}
                    className="text-sm font-medium whitespace-nowrap"
                  >
                    {translatedLabel}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Controls */}
      <div className="px-3 py-4 space-y-2" style={{ borderTop: `1px solid ${borderColor}` }}>
        {/* Collapse Toggle */}
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-[999px] transition-all duration-200"
          style={{ color: textMuted }}
          onMouseEnter={(e) => { e.currentTarget.style.color = textHover; e.currentTarget.style.backgroundColor = hoverBg; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = textMuted; e.currentTarget.style.backgroundColor = 'transparent'; }}
          aria-label={sidebarCollapsed ? t('common.expand', language) : t('common.collapse', language)}
        >
          {sidebarCollapsed ? <ChevronRight size={18} /> : (
            <>
              <ChevronLeft size={18} />
              <AnimatePresence mode="wait">
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-xs font-medium"
                  >
                    {t('common.collapse', language)}
                  </motion.span>
                )}
              </AnimatePresence>
            </>
          )}
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-[999px] transition-all duration-200"
          style={{ color: textMuted }}
          onMouseEnter={(e) => { e.currentTarget.style.color = textHover; e.currentTarget.style.backgroundColor = hoverBg; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = textMuted; e.currentTarget.style.backgroundColor = 'transparent'; }}
          aria-label={t('common.toggleTheme', language)}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          <AnimatePresence mode="wait">
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs font-medium"
              >
                {theme === 'dark' ? t('theme.dark', language) : t('theme.light', language)}
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* Language Toggle */}
        <button
          onClick={toggleLanguage}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-[999px] transition-all duration-200"
          style={{ color: textMuted }}
          onMouseEnter={(e) => { e.currentTarget.style.color = textHover; e.currentTarget.style.backgroundColor = hoverBg; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = textMuted; e.currentTarget.style.backgroundColor = 'transparent'; }}
          aria-label={t('common.toggleLang', language)}
        >
          <Languages size={18} />
          <AnimatePresence mode="wait">
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs font-medium"
              >
                {language === 'en' ? t('lang.en', language) : t('lang.es', language)}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}
