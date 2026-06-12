/**
 * Global State Store (Zustand)
 * 
 * Architecture Decision:
 * We use Zustand for global state management because:
 * 1. Minimal boilerplate compared to Redux
 * 2. Built-in persistence middleware
 * 3. No provider wrapping needed
 * 4. TypeScript-first design
 * 
 * Persisted state includes favorites, history, and preferences.
 * This ensures user data survives page refreshes.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  // Favorites
  favorites: number[];
  addFavorite: (id: number) => void;
  removeFavorite: (id: number) => void;
  isFavorite: (id: number) => boolean;

  // History
  history: number[];
  addToHistory: (id: number) => void;
  clearHistory: () => void;

  // Preferences
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  // Language
  language: 'en' | 'es';
  setLanguage: (lang: 'en' | 'es') => void;
  toggleLanguage: () => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Favorites
      favorites: [],
      addFavorite: (id) =>
        set((state) => ({
          favorites: state.favorites.includes(id)
            ? state.favorites
            : [...state.favorites, id],
        })),
      removeFavorite: (id) =>
        set((state) => ({
          favorites: state.favorites.filter((fid) => fid !== id),
        })),
      isFavorite: (id) => get().favorites.includes(id),

      // History
      history: [],
      addToHistory: (id) =>
        set((state) => ({
          history: [id, ...state.history.filter((hid) => hid !== id)].slice(0, 50),
        })),
      clearHistory: () => set({ history: [] }),

      // Preferences
      theme: 'dark',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      sidebarCollapsed: false,
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      // Language
      language: 'es',
      setLanguage: (language) => set({ language }),
      toggleLanguage: () => set((state) => ({ language: state.language === 'en' ? 'es' : 'en' })),

      // Search
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),
    }),
    {
      name: 'dashdex-store',
      partialize: (state) => ({
        favorites: state.favorites,
        history: state.history,
        theme: state.theme,
        language: state.language,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }

  )
);
