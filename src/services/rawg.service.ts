/**
 * RAWG Video Games Database Service
 *
 * Service layer for fetching Pokémon video game data from RAWG API.
 * Centralizes all API calls for the Videogames feature.
 *
 * Architecture:
 * - Single service file for all RAWG interactions
 * - Returns typed data for frontend consumption
 * - Handles API errors gracefully
 * - Supports search, filtering by platform, and detail views
 */

const RAWG_API_KEY = import.meta.env.VITE_RAWG_API_KEY as string;
const RAWG_BASE_URL = 'https://api.rawg.io/api';

export interface RawgGame {
  id: number;
  name: string;
  slug: string;
  released: string;
  background_image: string;
  rating: number;
  ratings_count: number;
  metacritic: number | null;
  platforms: {
    platform: {
      id: number;
      name: string;
      slug: string;
    };
  }[];
  genres: {
    id: number;
    name: string;
    slug: string;
  }[];
  short_screenshots: {
    id: number;
    image: string;
  }[];
  esrb_rating?: {
    id: number;
    name: string;
    slug: string;
  } | null;
  playtime: number;
  added: number;
}

export interface RawgGameDetail extends RawgGame {
  description_raw: string;
  website: string;
  reddit_url: string;
  metacritic_url: string;
  developers: { id: number; name: string; slug: string }[];
  publishers: { id: number; name: string; slug: string }[];
  tags: { id: number; name: string; slug: string; language: string }[];
  stores: {
    id: number;
    store: { id: number; name: string; slug: string };
  }[];
  clip: { clip: string; clips: Record<string, string>; video: string; preview: string } | null;
}

export interface RawgResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: RawgGame[];
}

export interface Platform {
  id: number;
  name: string;
  slug: string;
  games_count: number;
  image_background: string;
}

/**
 * Fetches Pokémon games from RAWG API, ordered by release date (newest first).
 * Uses the 'pokemon' tag to filter only Pokémon-related games.
 */
export async function fetchPokemonGames(
  page: number = 1,
  pageSize: number = 20,
  search?: string,
  platform?: string
): Promise<RawgResponse> {
  const params = new URLSearchParams({
    key: RAWG_API_KEY,
    page: page.toString(),
    page_size: pageSize.toString(),
    ordering: '-released',
    tags: 'pokemon',
  });

  if (search) {
    params.set('search', search);
  }

  if (platform) {
    params.set('platforms', platform);
  }

  const response = await fetch(`${RAWG_BASE_URL}/games?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error(`RAWG API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetches detailed information for a specific game by ID.
 */
export async function fetchGameDetail(gameId: number): Promise<RawgGameDetail> {
  const response = await fetch(`${RAWG_BASE_URL}/games/${gameId}?key=${RAWG_API_KEY}`);
  
  if (!response.ok) {
    throw new Error(`RAWG API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetches available platforms for filtering.
 */
export async function fetchPlatforms(): Promise<Platform[]> {
  const response = await fetch(`${RAWG_BASE_URL}/platforms?key=${RAWG_API_KEY}&page_size=50`);
  
  if (!response.ok) {
    throw new Error(`RAWG API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.results;
}

/**
 * Fetches screenshots for a specific game.
 */
export async function fetchGameScreenshots(gameId: number): Promise<{ id: number; image: string }[]> {
  const response = await fetch(`${RAWG_BASE_URL}/games/${gameId}/screenshots?key=${RAWG_API_KEY}`);
  
  if (!response.ok) {
    throw new Error(`RAWG API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.results;
}
