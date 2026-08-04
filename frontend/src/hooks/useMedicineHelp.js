import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useCart } from "./useCart";

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
const FIVE_MINUTES_MS = 5 * 60 * 1000;

export const useMedicineHelp = () => {
  const { pathname } = useLocation();
  const { cartItems } = useCart();
  
  const [isOpen, setIsOpen] = useState(false);
  const [lastSearchQuery, setLastSearchQuery] = useState("");
  const failedSearchCountRef = useRef(0);
  const timerRef = useRef(null);

  // Check if current page is in the suppressed list
  const isSuppressedPage = useCallback(() => {
    const p = pathname.toLowerCase();
    return (
      p.includes("/checkout") ||
      p.includes("/payment") ||
      p.includes("/admin") ||
      p.includes("/upload-prescription") ||
      p.includes("/login")
    );
  }, [pathname]);

  // Check 24-hour frequency capping & session capping
  const canShowPopup = useCallback(() => {
    if (isSuppressedPage()) return false;

    // Check if user already contacted WhatsApp in this session
    try {
      if (sessionStorage.getItem("wellmeds_help_contacted") === "true") {
        return false;
      }
      if (sessionStorage.getItem("wellmeds_help_popup_shown_session") === "true") {
        return false;
      }
      
      const lastShown = localStorage.getItem("wellmeds_help_popup_last_shown");
      if (lastShown) {
        const timeDiff = Date.now() - parseInt(lastShown, 10);
        if (timeDiff < TWENTY_FOUR_HOURS_MS) {
          return false;
        }
      }
    } catch (e) {
      console.warn("Storage access error in useMedicineHelp:", e);
    }

    return true;
  }, [isSuppressedPage]);

  // Function to show popup
  const triggerPopup = useCallback((query = "") => {
    if (!canShowPopup()) return;

    if (query) {
      setLastSearchQuery(query);
    }

    setIsOpen(true);

    try {
      localStorage.setItem("wellmeds_help_popup_last_shown", Date.now().toString());
      sessionStorage.setItem("wellmeds_help_popup_shown_session", "true");
    } catch (e) {
      console.warn("Storage set error in useMedicineHelp:", e);
    }

    console.log("[Analytics] Medicine Help Popup Viewed:", {
      event: "popup_viewed",
      query,
      timestamp: new Date().toISOString()
    });
  }, [canShowPopup]);

  // Handler for when user closes popup
  const handleClose = useCallback(() => {
    setIsOpen(false);
    console.log("[Analytics] Medicine Help Popup Closed:", {
      event: "popup_closed",
      query: lastSearchQuery,
      timestamp: new Date().toISOString()
    });
  }, [lastSearchQuery]);

  // Trigger 1 & 2: Handle failed search events (called from search components)
  const recordSearchResult = useCallback((query, resultCount) => {
    if (!query || !query.trim()) return;

    const trimmed = query.trim();

    if (resultCount === 0) {
      failedSearchCountRef.current += 1;
      setLastSearchQuery(trimmed);

      // Trigger 2: 3 consecutive failed searches -> immediate
      if (failedSearchCountRef.current >= 3) {
        triggerPopup(trimmed);
        return;
      }

      // Trigger 1: 0 results -> 2-second delay
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        triggerPopup(trimmed);
      }, 2000);
    } else {
      // Reset failed search counter on successful search
      failedSearchCountRef.current = 0;
      if (timerRef.current) clearTimeout(timerRef.current);
    }
  }, [triggerPopup]);

  // Trigger 3: Long browsing session (5+ minutes with 0 cart items)
  useEffect(() => {
    if (isSuppressedPage()) return;

    const sessionTimer = setTimeout(() => {
      if ((!cartItems || cartItems.length === 0) && canShowPopup()) {
        triggerPopup(lastSearchQuery);
      }
    }, FIVE_MINUTES_MS);

    return () => clearTimeout(sessionTimer);
  }, [isSuppressedPage, cartItems, canShowPopup, triggerPopup, lastSearchQuery]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return {
    isOpen,
    lastSearchQuery,
    triggerPopup,
    recordSearchResult,
    handleClose,
  };
};

export default useMedicineHelp;
