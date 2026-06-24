import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { cartService } from "../services/api/cartService";

export const CartContext = createContext();

/**
 * CartProvider — Hybrid strategy:
 * - Guests: cart stored in localStorage only.
 * - Logged-in users: cart synced to backend. localStorage acts as a local cache.
 *
 * Pass `user` prop (from AuthContext) to enable backend sync.
 * CartProvider is intentionally kept user-agnostic; the sync is triggered
 * externally via the `syncCartForUser` and `clearServerCart` helpers exposed
 * through context, called by AuthContext on login / logout.
 */
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem("medishop_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isSyncing, setIsSyncing] = useState(false);

  // Persist to localStorage on every change
  useEffect(() => {
    localStorage.setItem("medishop_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // ─────────────────────────────────────────────────────
  // Helpers to normalize backend cart items → local shape
  // ─────────────────────────────────────────────────────
  const normalizeBackendItems = (backendItems) => {
    if (!Array.isArray(backendItems)) return [];
    return backendItems
      .filter((item) => {
        if (!item) return false;
        // Skip items where product is just an ObjectId string (unpopulated)
        const p = item.product;
        return p && typeof p === "object" && (p._id || p.id);
      })
      .map((item) => {
        const product = item.product || {};
        const productId = (product._id || product.id)?.toString() || "";
        return {
          id: productId,
          _id: productId,
          name: product.name || "Unknown Product",
          price: product.price || 0,
          originalPrice: product.originalPrice || null,
          image: product.image || "",
          category: product.category || "",
          brand: product.brand || "",
          stock: product.stock ?? 999,
          requiresRx: product.requiresRx || false,
          badge: product.badge || "",
          quantity: item?.quantity || 1,
        };
      });
  };

  // ─────────────────────────────────────────────────────
  // Backend sync — called after login with the logged-in token
  // Merges local guest cart with server cart, then syncs up.
  // ─────────────────────────────────────────────────────
  const syncCartForUser = useCallback(async () => {
    setIsSyncing(true);
    try {
      // 1. Fetch server cart
      const serverItems = await cartService.getCart();
      const normalizedServer = normalizeBackendItems(serverItems);

      // 2. Get current local (guest) items
      const localItems = cartItems;

      if (localItems.length === 0) {
        // No guest cart — just use server cart
        setCartItems(normalizedServer);
      } else {
        // Merge: upload local items that aren't on server
        const serverIds = normalizedServer.map((i) => i.id);
        const guestOnlyItems = localItems.filter((i) => !serverIds.includes(i.id));

        for (const item of guestOnlyItems) {
          try {
            await cartService.addToCart(item.id, item.quantity);
          } catch (err) {
            console.warn(`Could not sync guest cart item ${item.name}:`, err.message);
          }
        }

        // Re-fetch merged server cart
        const mergedServerItems = await cartService.getCart();
        setCartItems(normalizeBackendItems(mergedServerItems));
      }
    } catch (err) {
      console.warn("Cart sync failed, staying on local cart:", err.message);
    } finally {
      setIsSyncing(false);
    }
  }, []); // eslint-disable-line

  // Called on logout: save current cart to localStorage, no backend call needed
  const saveCartToLocalOnLogout = useCallback(() => {
    // Cart is already persisted to localStorage via useEffect — nothing extra needed.
    // This is a no-op but can be extended if needed.
  }, []);

  // ─────────────────────────────────────────────────────
  // Cart operations — try backend first, fall back to local
  // ─────────────────────────────────────────────────────
  const hasToken = () => !!localStorage.getItem("medishop_token");

  const addToCart = useCallback(async (product, quantity = 1) => {
    if (!product) return;
    const productId = (product._id || product.id)?.toString();

    // Optimistic local update
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === productId);
      if (existing) {
        const newQty = Math.min(product.stock, existing.quantity + quantity);
        return prev.map((i) => (i.id === productId ? { ...i, quantity: newQty } : i));
      }
      return [
        ...prev,
        {
          ...product,
          id: productId,
          _id: productId,
          quantity: Math.min(product.stock, quantity),
        },
      ];
    });

    // Backend sync if logged in
    if (hasToken()) {
      try {
        await cartService.addToCart(productId, quantity);
      } catch (err) {
        console.warn("Backend addToCart failed:", err.message);
      }
    }
  }, []);

  const removeFromCart = useCallback(async (id) => {
    if (!id) return;
    setCartItems((prev) => prev.filter((i) => i.id !== id));

    if (hasToken()) {
      try {
        await cartService.removeFromCart(id);
      } catch (err) {
        console.warn("Backend removeFromCart failed:", err.message);
      }
    }
  }, []);

  const updateQuantity = useCallback(async (id, quantity) => {
    if (!id) return;
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCartItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, quantity: Math.min(i.stock || 999, quantity) } : i
      )
    );

    if (hasToken()) {
      try {
        await cartService.updateCartQuantity(id, quantity);
      } catch (err) {
        console.warn("Backend updateQuantity failed:", err.message);
      }
    }
  }, []);

  const clearCart = useCallback(async () => {
    setCartItems([]);
    localStorage.removeItem("medishop_cart");

    if (hasToken()) {
      try {
        await cartService.clearCart();
      } catch (err) {
        console.warn("Backend clearCart failed:", err.message);
      }
    }
  }, []);

  // ─────────────────────────────────────────────────────
  // Derived values
  // ─────────────────────────────────────────────────────
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  // Indian shipping: free above ₹499, else ₹49 flat fee
  const shipping = subtotal === 0 ? 0 : subtotal >= 499 ? 0 : 49;
  // GST 12%
  const tax = subtotal * 0.12;
  const total = subtotal + shipping + tax;
  const requiresRx = cartItems.some((item) => item.requiresRx);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        subtotal,
        shipping,
        tax,
        total,
        requiresRx,
        isSyncing,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        syncCartForUser,
        saveCartToLocalOnLogout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
