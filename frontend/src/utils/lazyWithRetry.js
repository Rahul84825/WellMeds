import { lazy } from "react";

/**
 * lazyWithRetry
 * Automatically handles stale chunk loading errors when new production versions are deployed.
 * If a dynamically imported chunk fails (e.g. 404 / MIME type text/html due to new build hashes),
 * it performs a single automatic window reload to fetch the latest application bundle.
 */
export const lazyWithRetry = (componentImport) =>
  lazy(async () => {
    const isAlreadyRefreshed = sessionStorage.getItem("chunk_reload_retry");

    try {
      const module = await componentImport();
      sessionStorage.removeItem("chunk_reload_retry");
      return module;
    } catch (error) {
      console.warn("Chunk loading failed, attempting auto-reload for latest version:", error);
      if (!isAlreadyRefreshed) {
        sessionStorage.setItem("chunk_reload_retry", "true");
        window.location.reload();
        return new Promise(() => {}); // Keep promise pending until page reloads
      }
      sessionStorage.removeItem("chunk_reload_retry");
      throw error;
    }
  });

export default lazyWithRetry;
