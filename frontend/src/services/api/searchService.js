import apiInstance from "./api";

// Simple in-memory cache for search results
const searchCache = new Map();

export const searchService = {
  /**
   * Search all entities with query string
   * @param {string} query
   * @param {AbortSignal} [signal]
   * @returns {Object|null} Grouped search results (or null if canceled)
   */
  async searchAll(query, signal) {
    const trimmed = query.trim().toLowerCase();
    if (trimmed.length < 2) return {};

    // Check in-memory cache first
    if (searchCache.has(trimmed)) {
      return searchCache.get(trimmed);
    }

    try {
      const response = await apiInstance.get("/products/search-all", {
        params: { q: query.trim() },
        signal
      });
      
      const results = response.results || {};
      searchCache.set(trimmed, results);
      return results;
    } catch (error) {
      // Don't throw or bubble error if the request was intentionally aborted
      if (error.name === "CanceledError" || error.code === "ERR_CANCELED" || error.message === "canceled") {
        return null;
      }
      throw error;
    }
  },

  /**
   * Clear search cache
   */
  clearCache() {
    searchCache.clear();
  }
};
