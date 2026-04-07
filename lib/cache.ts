/**
 * Cache utilities and helpers for Next.js 14 caching strategies
 * Implements ISR, revalidateTag, revalidatePath, and cache monitoring
 */

import { unstable_cache } from "next/cache";
import { revalidateTag, revalidatePath } from "next/cache";

// Cache tag constants for consistent tagging across the application
export const CACHE_TAGS = {
  // Page-level tags
  HOMEPAGE: "homepage",
  ABOUT: "about", 
  CONTACT: "contact",
  TUITION: "tuition",
  ENROLLMENT: "enrollment",
  PRIVACY: "privacy",
  FAQ: "faq",
  PROGRAMS: "programs",
  
  // API-level tags
  ENROLLMENT_API: "enrollment-api",
  CSRF_API: "csrf-api",
  
  // Data tags
  BUSINESS_INFO: "business-info",
  TESTIMONIALS: "testimonials",
  PROGRAMS_DATA: "programs-data",
} as const;

// Cache duration constants (in seconds)
export const CACHE_DURATIONS = {
  // Static content - long cache times
  STATIC_CONTENT: 3600, // 1 hour
  HOMEPAGE: 1800, // 30 minutes
  ABOUT_PAGE: 3600, // 1 hour
  CONTACT_PAGE: 3600, // 1 hour
  TUITION_PAGE: 1800, // 30 minutes
  
  // API responses - shorter cache times
  API_RESPONSE: 300, // 5 minutes
  CSRF_TOKEN: 60, // 1 minute
  
  // Dynamic content - very short or no cache
  DYNAMIC_CONTENT: 0, // no cache
} as const;

/**
 * Creates a cached fetch with proper tagging and duration
 */
export function cachedFetch(
  url: string,
  options: RequestInit & {
    next?: {
      tags?: string[];
      revalidate?: number;
    };
  } = {}
) {
  const { next = {}, ...fetchOptions } = options;
  
  return fetch(url, {
    ...fetchOptions,
    next: {
      revalidate: CACHE_DURATIONS.STATIC_CONTENT,
      tags: [],
      ...next,
    },
  });
}

/**
 * Creates a cached function wrapper using unstable_cache
 * Useful for database operations or expensive computations
 */
export function createCachedFunction<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keyParts: string[],
  options: {
    revalidate?: number;
    tags?: string[];
  } = {}
): T {
  return unstable_cache(fn, keyParts, {
    revalidate: CACHE_DURATIONS.STATIC_CONTENT,
    tags: [],
    ...options,
  }) as T;
}

/**
 * Cache invalidation helpers
 */
export const cacheInvalidation = {
  /**
   * Invalidates cache by tag (granular control)
   */
  byTag: (tag: string) => {
    console.log(`[Cache] Invalidating tag: ${tag}`);
    revalidateTag(tag);
  },

  /**
   * Invalidates cache by path (entire route)
   */
  byPath: (path: string) => {
      const normalizedPath = path.startsWith("/") ? path : `/${path}`;
      if (normalizedPath.length <= 1) {
        throw new Error("Invalid cache path");
      }
      console.log(`[Cache] Invalidating path: ${normalizedPath}`);
      revalidatePath(normalizedPath);
  },

  /**
   * Invalidates multiple tags at once
   */
  byTags: (tags: string[]) => {
    console.log(`[Cache] Invalidating tags: ${tags.join(", ")}`);
    tags.forEach(tag => revalidateTag(tag));
  },

  /**
   * Invalidates enrollment-related caches after form submission
   */
  invalidateEnrollment: () => {
    cacheInvalidation.byTags([
      CACHE_TAGS.ENROLLMENT_API,
      CACHE_TAGS.ENROLLMENT,
    ]);
  },

  /**
   * Invalidates all page caches (useful for major content updates)
   */
  invalidateAllPages: () => {
      cacheInvalidation.byTags(Object.values(CACHE_TAGS));
  },
};

/**
 * Cache headers for API responses
 */
export const cacheHeaders = {
  /**
   * Returns cache-control headers for API responses
   */
  forAPI: (maxAge: number = CACHE_DURATIONS.API_RESPONSE) => ({
    "Cache-Control": `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 2}`,
    "Vary": "Accept-Encoding",
  }),

  /**
   * Returns cache-control headers for static content
   */
  forStatic: (maxAge: number = CACHE_DURATIONS.STATIC_CONTENT) => ({
    "Cache-Control": `public, max-age=${maxAge}, immutable`,
  }),

  /**
   * Returns no-cache headers for dynamic content
   */
  forDynamic: () => ({
    "Cache-Control": "no-store, no-cache, must-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
  }),
};

/**
 * Cache monitoring and debugging utilities
 */
export const cacheMonitoring = {
  /**
   * Logs cache hit/miss information (development only)
   */
  logCacheOperation: (operation: string, tag?: string, path?: string) => {
    if (process.env.NODE_ENV === "development") {
      const timestamp = new Date().toISOString();
      const details = [operation, tag && `tag: ${tag}`, path && `path: ${path}`]
        .filter(Boolean)
        .join(" | ");
      console.log(`[${timestamp}] [Cache] ${details}`);
    }
  },

  /**
   * Validates cache tag format
   */
  validateTag: (tag: string): boolean => {
    return typeof tag === "string" && tag.length > 0 && tag.length <= 256;
  },

  /**
   * Returns cache statistics (placeholder for future implementation)
   */
  getStats: () => ({
    totalCached: 0,
    hitRate: 0,
    missRate: 0,
    lastInvalidation: null,
  }),
};

/**
 * Business info cache helper - cached business information
 */
export const getBusinessInfo = createCachedFunction(
  async () => ({
    name: "Riley Day Care",
    address: "1509 Haymarket Rd, Dallas, TX 75253",
    phone: "(972) 286-0357",
    description: "A warm, licensed daycare in Southeast Dallas offering small-group care, play-based learning, and a calm daily routine.",
  }),
  ["business-info"],
  {
    revalidate: CACHE_DURATIONS.STATIC_CONTENT,
    tags: [CACHE_TAGS.BUSINESS_INFO],
  }
);

/**
 * Testimonials cache helper - cached testimonials data
 */
export const getTestimonials = createCachedFunction(
  async () => [
    {
      id: "1",
      text: "We knew from the first visit that Riley Day Care was the right place for our child.",
      author: "Happy parent in Southeast Dallas",
    },
    // Add more testimonials as needed
  ],
  ["testimonials"],
  {
    revalidate: CACHE_DURATIONS.STATIC_CONTENT,
    tags: [CACHE_TAGS.TESTIMONIALS],
  }
);
