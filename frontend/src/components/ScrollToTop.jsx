import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop
 *
 * A global, zero-config scroll restoration component.
 * Mount it once inside <BrowserRouter> and every route change
 * will automatically reset the scroll position to the top.
 *
 * - Triggers only on real URL pathname changes.
 * - Does NOT trigger on: modals, drawers, tabs, accordions, or hash-only changes.
 * - Preserves browser history, back/forward state, and all navigation guards.
 * - No memory leaks — useEffect cleanup is handled by React.
 *
 * Behavior can be changed in a single place:
 *   "instant"  → zero visual jank, recommended for page transitions (default)
 *   "smooth"   → animated scroll, optional for longer pages
 */
const ScrollToTop = ({ behavior = "instant" }) => {
  const { pathname } = useLocation();

  useEffect(() => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior });
    } catch {
      // Fallback for browsers that don't support the options object
      window.scrollTo(0, 0);
    }
  }, [pathname, behavior]);

  return null;
};

export default ScrollToTop;
