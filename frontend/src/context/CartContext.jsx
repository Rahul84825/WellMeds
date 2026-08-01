import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { cartService } from "../services/api/cartService";
import { checkoutSessionService } from "../services/api/checkoutSessionService";
import { roundPrice } from "../utils/currency";
import { toast } from "sonner";

export const CartContext = createContext();

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
  const [pendingRxFile, setPendingRxFile] = useState(null);

  // Cart Lock & Session states
  const [isCartLocked, setIsCartLocked] = useState(false);
  const [checkoutSessionStatus, setCheckoutSessionStatus] = useState("ACTIVE"); // ACTIVE | LOCKED | PENDING_VERIFICATION | VERIFIED | PAYMENT_PENDING | PAYMENT_SUCCESS | EXPIRED | CANCELLED
  const [lockReason, setLockReason] = useState("");

  // Persist to localStorage on every change
  useEffect(() => {
    localStorage.setItem("medishop_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const hasToken = () => !!localStorage.getItem("medishop_token");

  // Fetch Checkout Session & Lock Status
  const refreshCartLockStatus = useCallback(async () => {
    if (!hasToken()) {
      setIsCartLocked(false);
      setCheckoutSessionStatus("ACTIVE");
      setLockReason("");
      return;
    }

    try {
      const res = await checkoutSessionService.getSessionStatus();
      if (res && res.success) {
        setIsCartLocked(!!res.isLocked);
        setCheckoutSessionStatus(res.status || "ACTIVE");
        setLockReason(res.session?.lockReason || "");
      }
    } catch (err) {
      console.warn("Failed to fetch checkout session status:", err.message);
    }
  }, []);

  // Multi-tab sync & tab focus refresh
  useEffect(() => {
    refreshCartLockStatus();

    const handleStorageChange = (e) => {
      if (e.key === "wellmeds_cart_lock_sync") {
        refreshCartLockStatus();
      }
      if (e.key === "wellmeds_cart_cleared") {
        setCartItems([]);
        setIsCartLocked(false);
        setCheckoutSessionStatus("PAYMENT_SUCCESS");
        setLockReason("");
        setPendingRxFile(null);
        localStorage.removeItem("medishop_cart");
      }
    };

    const handleFocus = () => {
      refreshCartLockStatus();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [refreshCartLockStatus]);

  // Broadcast lock state change to other tabs
  const broadcastLockSync = () => {
    localStorage.setItem("wellmeds_cart_lock_sync", Date.now().toString());
  };

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
          brand: product.manufacturer || product.brand || "",
          manufacturer: product.manufacturer || product.brand || "",
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
  // ─────────────────────────────────────────────────────
  // Backend sync — called after login with the logged-in token
  // Merges local guest cart with server cart only on initial login.
  // ─────────────────────────────────────────────────────
  const syncCartForUser = useCallback(async (isInitialLogin = false) => {
    setIsSyncing(true);
    try {
      // 1. Fetch server cart
      const serverItems = await cartService.getCart();
      const normalizedServer = normalizeBackendItems(serverItems);

      if (!isInitialLogin) {
        // Session restore or page refresh: server cart is the single source of truth!
        setCartItems(normalizedServer);
      } else {
        // Fresh login: merge guest cart items into server cart
        const savedGuest = localStorage.getItem("medishop_cart");
        let guestItems = [];
        try {
          guestItems = savedGuest ? JSON.parse(savedGuest) : [];
        } catch {
          guestItems = [];
        }

        if (guestItems.length === 0) {
          setCartItems(normalizedServer);
        } else {
          const serverIds = normalizedServer.map((i) => i.id);
          const guestOnlyItems = guestItems.filter((i) => !serverIds.includes(i.id));

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
      }
    } catch (err) {
      console.warn("Cart sync failed, staying on local cart:", err.message);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Called on logout: save current cart to localStorage, no backend call needed
  const saveCartToLocalOnLogout = useCallback(() => {
    // Cart is already persisted to localStorage via useEffect
  }, []);

  // ─────────────────────────────────────────────────────
  // Cart operations — optimistic update + server sync
  // ─────────────────────────────────────────────────────
  const handleLockError = (err) => {
    if (err.response && (err.response.status === 409 || err.response.data?.code === "CART_LOCKED")) {
      setIsCartLocked(true);
      setCheckoutSessionStatus(err.response.data?.status || "LOCKED");
      setLockReason(err.response.data?.message || "Cart is locked under prescription verification.");
      broadcastLockSync();
      toast.error(err.response.data?.message || "Cart is currently locked because your prescription is under verification.");
      syncCartForUser();
      return true;
    }
    return false;
  };

  const addToCart = useCallback(async (product, quantity = 1) => {
    if (!product) return;
    if (isCartLocked) {
      toast.error("Cart is locked under prescription verification. Click 'Modify Cart' to edit medicines.");
      return;
    }

    const productId = (product._id || product.id)?.toString();

    // Optimistic local update
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === productId);
      if (existing) {
        const newQty = Math.min(30, existing.quantity + quantity);
        return prev.map((i) => (i.id === productId ? { ...i, quantity: newQty } : i));
      }
      return [
        ...prev,
        {
          ...product,
          id: productId,
          _id: productId,
          quantity: Math.min(30, quantity),
        },
      ];
    });

    // Backend sync if logged in
    if (hasToken()) {
      try {
        const serverItems = await cartService.addToCart(productId, quantity);
        if (serverItems) {
          setCartItems(normalizeBackendItems(serverItems));
        }
      } catch (err) {
        if (!handleLockError(err)) {
          console.warn("Backend addToCart failed:", err.message);
        }
      }
    }
  }, [isCartLocked]);

  const removeFromCart = useCallback(async (id) => {
    if (!id) return;
    if (isCartLocked) {
      toast.error("Cart is locked under prescription verification. Click 'Modify Cart' to edit medicines.");
      return;
    }

    setCartItems((prev) => prev.filter((i) => i.id !== id));

    if (hasToken()) {
      try {
        const serverItems = await cartService.removeFromCart(id);
        if (serverItems) {
          setCartItems(normalizeBackendItems(serverItems));
        }
      } catch (err) {
        if (!handleLockError(err)) {
          console.warn("Backend removeFromCart failed:", err.message);
        }
      }
    }
  }, [isCartLocked]);

  const updateQuantity = useCallback(async (id, quantity) => {
    if (!id) return;
    if (isCartLocked) {
      toast.error("Cart is locked under prescription verification. Click 'Modify Cart' to edit medicines.");
      return;
    }

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
        const serverItems = await cartService.updateCartQuantity(id, quantity);
        if (serverItems) {
          setCartItems(normalizeBackendItems(serverItems));
        }
      } catch (err) {
        if (!handleLockError(err)) {
          console.warn("Backend updateQuantity failed:", err.message);
        }
      }
    }
  }, [isCartLocked, removeFromCart]);

  const clearCart = useCallback(async () => {
    if (isCartLocked) {
      toast.error("Cart is locked under prescription verification.");
      return;
    }

    setCartItems([]);
    localStorage.removeItem("medishop_cart");

    if (hasToken()) {
      try {
        await cartService.clearCart();
      } catch (err) {
        if (!handleLockError(err)) {
          console.warn("Backend clearCart failed:", err.message);
        }
      }
    }
  }, [isCartLocked]);

  // Production Post-Order Reset: Safely bypasses locks, resets state, and syncs tabs
  const resetCartPostOrder = useCallback(() => {
    setCartItems([]);
    setIsCartLocked(false);
    setCheckoutSessionStatus("PAYMENT_SUCCESS");
    setLockReason("");
    setPendingRxFile(null);
    localStorage.removeItem("medishop_cart");
    localStorage.setItem("wellmeds_cart_cleared", Date.now().toString());
    broadcastLockSync();
  }, []);

  const modifyCart = useCallback(async () => {
    if (!hasToken()) return;
    setIsSyncing(true);
    try {
      const res = await checkoutSessionService.modifyCart();
      if (res && res.success) {
        setIsCartLocked(false);
        setCheckoutSessionStatus("CANCELLED");
        setLockReason("");
        broadcastLockSync();
        toast.info("Cart unlocked. Current prescription verification has been cancelled.");
        await syncCartForUser();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to modify cart. Please try again.");
    } finally {
      setIsSyncing(false);
    }
  }, [syncCartForUser]);

  // ─────────────────────────────────────────────────────
  // Derived values
  // ─────────────────────────────────────────────────────
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = roundPrice(cartItems.reduce((acc, item) => acc + (Number(item.price) || 0) * item.quantity, 0));
  // Indian shipping: free above ₹499, else ₹49 flat fee
  const shipping = subtotal === 0 ? 0 : subtotal >= 499 ? 0 : 49;
  // GST 12%
  const tax = roundPrice(subtotal * 0.12);
  const total = roundPrice(subtotal + shipping + tax);
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
        isCartLocked,
        checkoutSessionStatus,
        lockReason,
        modifyCart,
        refreshCartLockStatus,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        resetCartPostOrder,
        syncCartForUser,
        saveCartToLocalOnLogout,
        pendingRxFile,
        setPendingRxFile,
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
