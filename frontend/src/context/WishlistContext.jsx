import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import apiInstance from "../services/api/api";

export const WishlistContext = createContext();

/**
 * WishlistProvider — Hybrid strategy:
 * - Guests: wishlist stored in localStorage.
 * - Logged-in users: wishlist synced to backend.
 */
export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      const saved = localStorage.getItem("medishop_wishlist");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem("medishop_wishlist", JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  const hasToken = () => !!localStorage.getItem("medishop_token");

  const normalizeProduct = (product) => ({
    id: (product._id || product.id)?.toString(),
    _id: (product._id || product.id)?.toString(),
    name: product.name,
    price: product.price,
    originalPrice: product.originalPrice,
    image: product.image || "",
    category: product.category,
    brand: product.brand,
    stock: product.stock,
    requiresRx: product.requiresRx || false,
    badge: product.badge || "",
  });

  // Sync wishlist from backend on login
  const syncWishlistForUser = useCallback(async () => {
    try {
      const data = await apiInstance.get("/wishlist");
      const serverProducts = (data.products || []).map(normalizeProduct);
      setWishlistItems(serverProducts);
    } catch (err) {
      console.warn("Wishlist sync failed, staying on local:", err.message);
    }
  }, []);

  const toggleWishlist = useCallback(async (product) => {
    if (!product) return;
    const productId = (product._id || product.id || product)?.toString();

    // Optimistic local update
    setWishlistItems((prev) => {
      const exists = prev.some((i) => i.id === productId);
      if (exists) {
        return prev.filter((i) => i.id !== productId);
      }
      return [...prev, normalizeProduct(product)];
    });

    // Backend sync if logged in
    if (hasToken()) {
      try {
        await apiInstance.post("/wishlist/toggle", { productId });
      } catch (err) {
        console.warn("Backend toggleWishlist failed:", err.message);
      }
    }
  }, []);

  const removeFromWishlist = useCallback(async (id) => {
    if (!id) return;
    const productId = (id._id || id.id || id)?.toString();
    setWishlistItems((prev) => prev.filter((i) => i.id !== productId));

    if (hasToken()) {
      try {
        await apiInstance.post("/wishlist/toggle", { productId });
      } catch (err) {
        console.warn("Backend removeFromWishlist failed:", err.message);
      }
    }
  }, []);

  const addToWishlist = useCallback((product) => {
    if (!product) return;
    const productId = (product._id || product.id || product)?.toString();
    if (!wishlistItems.some((i) => i.id === productId)) {
      toggleWishlist(product);
    }
  }, [wishlistItems, toggleWishlist]);

  const isInWishlist = useCallback((id) => {
    if (!id) return false;
    const strId = (id._id || id.id || id)?.toString();
    return wishlistItems.some((i) => i.id === strId);
  }, [wishlistItems]);

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        isInWishlist,
        toggleWishlist,
        addToWishlist,
        removeFromWishlist,
        syncWishlistForUser,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within a WishlistProvider");
  return context;
};
