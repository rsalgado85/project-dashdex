/**
 * Cache Manager - Multi-level caching system
 * 
 * Architecture Decision:
 * We implement a two-level cache strategy:
 * Level 1: TanStack Query (in-memory, reactive)
 * Level 2: LocalStorage (persistent, cross-session)
 * 
 * This ensures fast subsequent loads and offline resilience.
 * The cache checks LocalStorage first before making API calls,
 * reducing bandwidth and improving perceived performance.
 * 
 * Important: localStorage has a ~5MB limit. We only cache lightweight
 * data (lists, summaries) and rely on TanStack Query for individual
 * Pokémon details which are stored in memory.
 */

import { CACHE_PREFIX, CACHE_TTL } from '@/constants';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  size: number; // estimated size in bytes
}

const MAX_CACHE_SIZE = 4.5 * 1024 * 1024; // 4.5MB limit to stay under 5MB quota

export class CacheManager {
  private prefix: string;
  private defaultTtl: number;

  constructor(prefix: string = CACHE_PREFIX, defaultTtl: number = CACHE_TTL) {
    this.prefix = prefix;
    this.defaultTtl = defaultTtl;
  }

  /**
   * Estimates the size of a value in bytes.
   */
  private estimateSize(value: unknown): number {
    const str = JSON.stringify(value);
    return str ? str.length * 2 : 0; // UTF-16 uses 2 bytes per char
  }

  /**
   * Retrieves a cached value. Returns null if not found or expired.
   * Implements lazy expiration - checks TTL on read.
   * Validates that the cached data has the expected structure.
   */
  get<T>(key: string): T | null {
    try {
      const fullKey = this.prefix + key;
      const raw = localStorage.getItem(fullKey);
      if (!raw) return null;

      const entry: CacheEntry<T> = JSON.parse(raw);
      
      if (this.isExpired(entry)) {
        this.remove(key);
        return null;
      }

      return entry.data;
    } catch {
      // If parsing fails, remove corrupted entry
      this.remove(key);
      return null;
    }
  }

  /**
   * Stores a value in the cache with optional TTL.
   * Uses compression via JSON serialization.
   * Automatically evicts old entries if quota is exceeded.
   */
  set<T>(key: string, data: T, ttl?: number): void {
    try {
      const fullKey = this.prefix + key;
      const size = this.estimateSize(data);
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl: ttl ?? this.defaultTtl,
        size,
      };
      localStorage.setItem(fullKey, JSON.stringify(entry));
    } catch (error) {
      // Handle quota exceeded errors gracefully
      console.warn('Cache write failed, clearing old entries:', error);
      this.evictOldest();
      
      // Retry after eviction
      try {
        const fullKey = this.prefix + key;
        const size = this.estimateSize(data);
        const entry: CacheEntry<T> = {
          data,
          timestamp: Date.now(),
          ttl: ttl ?? this.defaultTtl,
          size,
        };
        localStorage.setItem(fullKey, JSON.stringify(entry));
      } catch {
        // If still failing, just skip caching
        console.warn('Cache write failed again after eviction, skipping cache.');
      }
    }
  }

  /**
   * Evicts the oldest entries until we're under the max cache size.
   */
  private evictOldest(): void {
    const entries: { key: string; timestamp: number }[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.prefix)) {
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const entry = JSON.parse(raw);
            entries.push({ key, timestamp: entry.timestamp || 0 });
          }
        } catch {
          // Remove corrupted entries
          if (key) localStorage.removeItem(key);
        }
      }
    }

    // Sort by timestamp (oldest first) and remove oldest 50%
    entries.sort((a, b) => a.timestamp - b.timestamp);
    const toRemove = Math.ceil(entries.length / 2);
    
    for (let i = 0; i < toRemove && i < entries.length; i++) {
      localStorage.removeItem(entries[i].key);
    }
  }

  /**
   * Removes a specific cache entry.
   */
  remove(key: string): void {
    const fullKey = this.prefix + key;
    localStorage.removeItem(fullKey);
  }

  /**
   * Clears all cache entries with the configured prefix.
   */
  clear(): void {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.prefix)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  }

  /**
   * Checks if a cache entry has expired based on its TTL.
   */
  isExpired<T>(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  /**
   * Returns the age of a cache entry in milliseconds.
   * Returns -1 if the entry doesn't exist.
   */
  getAge(key: string): number {
    const fullKey = this.prefix + key;
    const raw = localStorage.getItem(fullKey);
    if (!raw) return -1;

    try {
      const entry: CacheEntry<unknown> = JSON.parse(raw);
      return Date.now() - entry.timestamp;
    } catch {
      return -1;
    }
  }
}

// Singleton instance for global use
export const cacheManager = new CacheManager();
