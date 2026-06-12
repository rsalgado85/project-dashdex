export const API_BASE_URL = 'https://pokeapi.co/api/v2';
export const POKEMON_LIMIT = 2000; // Support all generations including future ones
export const CACHE_PREFIX = 'dashdex_';
export const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
export const STALE_TIME = 30 * 60 * 1000; // 30 minutes

export const STAT_NAMES: Record<string, string> = {
  hp: 'HP',
  attack: 'Attack',
  defense: 'Defense',
  'special-attack': 'Sp. Attack',
  'special-defense': 'Sp. Defense',
  speed: 'Speed',
};

export const STAT_COLORS: Record<string, string> = {
  hp: '#00b894',
  attack: '#e17055',
  defense: '#74b9ff',
  'special-attack': '#a29bfe',
  'special-defense': '#6c5ce7',
  speed: '#fdcb6e',
};

export const TYPE_COLORS: Record<string, string> = {
  normal: '#A8A878',
  fire: '#F08030',
  water: '#6890F0',
  electric: '#F8D030',
  grass: '#78C850',
  ice: '#98D8D8',
  fighting: '#C03028',
  poison: '#A040A0',
  ground: '#E0C068',
  flying: '#A890F0',
  psychic: '#F85888',
  bug: '#A8B820',
  rock: '#B8A038',
  ghost: '#705898',
  dragon: '#7038F8',
  dark: '#705848',
  steel: '#B8B8D0',
  fairy: '#EE99AC',
};

export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  STATISTICS: '/statistics',
  COMPARE: '/compare',
  EXPLORER: '/explorer',
  POKEMON_DETAIL: '/pokemon/:id',
  RANKINGS: '/rankings',
  INSIGHTS: '/insights',
  FAVORITES: '/favorites',
  ABOUT: '/about',
  VIDEOGAMES: '/videogames',
  HISTORY: '/history',
} as const;

export const NAV_ITEMS = [
  { label: 'Dashboard', path: ROUTES.DASHBOARD, icon: 'LayoutDashboard' },
  { label: 'Statistics', path: ROUTES.STATISTICS, icon: 'BarChart3' },
  { label: 'Compare', path: ROUTES.COMPARE, icon: 'GitCompare' },
  { label: 'Explorer', path: ROUTES.EXPLORER, icon: 'Search' },
  { label: 'Rankings', path: ROUTES.RANKINGS, icon: 'Trophy' },
  { label: 'Insights', path: ROUTES.INSIGHTS, icon: 'Lightbulb' },
  { label: 'Favorites', path: ROUTES.FAVORITES, icon: 'Heart' },
  { label: 'Videogames', path: ROUTES.VIDEOGAMES, icon: 'Gamepad2' },
  { label: 'History', path: ROUTES.HISTORY, icon: 'BookOpen' },
  { label: 'About', path: ROUTES.ABOUT, icon: 'User' },
] as const;
