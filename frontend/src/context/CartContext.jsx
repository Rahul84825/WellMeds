import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { cartService } from "../services/api/cartService";
import { checkoutSessionService } from "../services/api/checkoutSessionService";
import { roundPrice } from "../utils/currency";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const hasToken = () => !!localStorage.getItem("medishop_token");

  const [cartItems, setCartItems] = useState(() => {
    // Only unauthenticated guest carts are loaded from local storage
    if (!localStorage.getItem("medishop_token")) {
      try {
        const savedGuest = localStorage.getItem("medishop_guest_cart");
        return savedGuest ? JSON.parse(savedGuest) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingRxFile, setPendingRxFile] = useState(null);

  // Cart Lock & Session states
  const [isCartLocked, setIsCartLocked] = useState(false);
  const [checkoutSessionStatus, setCheckoutSessionStatus] = useState("ACTIVE"); // ACTIVE | LOCKED | PENDING_VERIFICATION | VERIFIED | PAYMENT_PENDING | PAYMENT_SUCCESS | EXPIRED | CANCELLED
  const [lockReason, setLockReason] = useState("");

  // Persist to localStorage ONLY for unauthenticated guest sessions
  useEffect(() => {
    if (!hasToken()) {
      localStorage.setItem("medishop_guest_cart", JSON.stringify(cartItems));
    } else {
      localStorage.removeItem("medishop_guest_cart");
      localStorage.removeItem("medishop_cart");
    }
  }, [cartItems]);

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

  // Complete hard purge on user logout
  const purgeCartOnLogout = useCallback(() => {
    setCartItems([]);
    setIsCartLocked(false);
    setCheckoutSessionStatus("ACTIVE");
    setLockReason("");
    setPendingRxFile(null);
    localStorage.removeItem("medishop_cart");
    localStorage.removeItem("medishop_guest_cart");
    localStorage.removeItem("wellmeds_cart_lock_sync");
    localStorage.removeItem("wellmeds_cart_cleared");
  }, []);

  // Multi-tab sync & tab focus refresh
  useEffect(() => {
    refreshCartLockStatus();

    const handleStorageChange = (e) => {
      if (e.key === "wellmeds_auth_logout" || e.key === "wellmeds_cart_cleared") {
        purgeCartOnLogout();
      }
      if (e.key === "wellmeds_cart_lock_sync") {
        refreshCartLockStatus();
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
  }, [refreshCartLockStatus, purgeCartOnLogout]);

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
        const variantName = item.variantName || "";
        const variantId = item.variantId || "";
        const effectivePrice = item.price !== undefined ? item.price : product.price || 0;
        const itemKey = variantName ? `${productId}-${variantName}` : productId;

        return {
          id: itemKey,
          _id: itemKey,
          productId,
          variantName,
          variantId,
          name: variantName ? `${product.name} (${variantName})` : (product.name || "Unknown Product"),
          rawName: product.name || "Unknown Product",
          price: effectivePrice,
          originalPrice: product.originalPrice || null,
          image: product.image || "",
          category: product.category || "",
          brand: product.manufacturer || product.brand || "",
          manufacturer: product.manufacturer || product.brand || "",
          stock: product.stock ?? 999,
          requiresRx: product.requiresRx || false,
          badge: product.badge || "",
          quantity: item?.quantity || 1,
          isSurgical: product.isSurgical || false,
        };
      });
  };

  // ─────────────────────────────────────────────────────
  // Backend sync — called after login with the logged-in token
  // Fetches authenticated user's cart from backend DB.
  // Merges genuine guest cart ONLY if guest items were added while logged out.
  // ─────────────────────────────────────────────────────
  const syncCartForUser = useCallback(async (isInitialLogin = false) => {
    setIsSyncing(true);
    try {
      if (isInitialLogin) {
        // Check if a genuine guest cart exists from unauthenticated browsing
        const savedGuest = localStorage.getItem("medishop_guest_cart");
        let guestItems = [];
        try {
          guestItems = savedGuest ? JSON.parse(savedGuest) : [];
        } catch {
          guestItems = [];
        }

        if (guestItems.length > 0) {
          // Fetch current server cart to prevent duplicates
          const serverItems = await cartService.getCart();
          const normalizedServer = normalizeBackendItems(serverItems);
          const serverIds = normalizedServer.map((i) => i.id);
          const guestOnlyItems = guestItems.filter((i) => !serverIds.includes(i.id));

          for (const item of guestOnlyItems) {
            try {
              await cartService.addToCart(item.productId || item.id, item.quantity, {
                variantName: item.variantName,
                variantId: item.variantId,
                price: item.price,
              });
            } catch (err) {
              console.warn(`Could not sync guest cart item ${item.name}:`, err.message);
            }
          }
          // Immediately delete guest cart from local storage after merging
          localStorage.removeItem("medishop_guest_cart");
        }
      }

      // Fetch the single source of truth: authenticated user's backend cart
      const serverItems = await cartService.getCart();
      setCartItems(normalizeBackendItems(serverItems));
    } catch (err) {
      console.warn("Cart sync failed:", err.message);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Called on logout: purge local cart completely
  const saveCartToLocalOnLogout = useCallback(() => {
    purgeCartOnLogout();
  }, [purgeCartOnLogout]);

  // ─────────────────────────────────────────────────────
  // Cart operations — optimistic update + server sync
  // ─────────────────────────────────────────────────────
  const handleLockError = (err) => {
    if (err.response && (err.response.status === 409 || err.response.data?.code === "CART_LOCKED")) {
      setIsCartLocked(true);
      setCheckoutSessionStatus(err.response.data?.status || "LOCKED");
      setLockReason(err.response.data?.message || "Cart is locked under prescription verification.");
      broadcastLockSync();
      syncCartForUser();
      return true;
    }
    return false;
  };

  const autoUnlockCart = async () => {
    if (isCartLocked) {
      setIsCartLocked(false);
      setCheckoutSessionStatus("ACTIVE");
      setLockReason("");
      try {
        await checkoutSessionService.modifyCart();
      } catch (e) {
        console.warn("Cart unlock notice:", e.message);
      }
    }
  };

  const addToCart = useCallback(async (product, quantity = 1, selectedVariant = null) => {
    if (!product) return;
    if (isCartLocked) {
      await autoUnlockCart();
    }

    const productId = (product.productId || product._id || product.id)?.toString();
    const variantObj = selectedVariant || product.selectedVariant || null;
    const variantName = variantObj?.name || product.variantName || "";
    const variantId = variantObj?._id || product.variantId || "";
    const effectivePrice = variantObj?.sellingPrice !== undefined
      ? variantObj.sellingPrice
      : variantObj?.price !== undefined
      ? variantObj.price
      : product.price || 0;
    const itemKey = variantName ? `${productId}-${variantName}` : productId;

    // Optimistic local update
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === itemKey);
      if (existing) {
        const newQty = Math.min(30, existing.quantity + quantity);
        return prev.map((i) => (i.id === itemKey ? { ...i, quantity: newQty } : i));
      }
      return [
        ...prev,
        {
          ...product,
          id: itemKey,
          _id: itemKey,
          productId,
          variantName,
          variantId,
          price: effectivePrice,
          name: variantName ? `${product.name} (${variantName})` : product.name,
          rawName: product.name,
          quantity: Math.min(30, quantity),
        },
      ];
    });

    // Backend sync if logged in
    if (hasToken()) {
      try {
        const serverItems = await cartService.addToCart(productId, quantity, {
          variantName,
          variantId,
          price: effectivePrice,
        });
        if (serverItems) {
          setCartItems(normalizeBackendItems(serverItems));
        }
        refreshCartLockStatus();
      } catch (err) {
        if (!handleLockError(err)) {
          console.warn("Backend addToCart failed:", err.message);
        }
      }
    }
  }, [isCartLocked, refreshCartLockStatus]);

  const removeFromCart = useCallback(async (id, variantName = "") => {
    if (!id) return;
    if (isCartLocked) {
      await autoUnlockCart();
    }

    let productId = id;
    let targetVariant = variantName;

    // If id is composite (e.g. 123-Small)
    if (id.includes("-") && !variantName) {
      const parts = id.split("-");
      productId = parts[0];
      targetVariant = parts.slice(1).join("-");
    }

    setCartItems((prev) => prev.filter((i) => i.id !== id && i.productId !== id));

    if (hasToken()) {
      try {
        const serverItems = await cartService.removeFromCart(productId, targetVariant);
        if (serverItems) {
          setCartItems(normalizeBackendItems(serverItems));
        }
        refreshCartLockStatus();
      } catch (err) {
        if (!handleLockError(err)) {
          console.warn("Backend removeFromCart failed:", err.message);
        }
      }
    }
  }, [isCartLocked, refreshCartLockStatus]);

  const updateQuantity = useCallback(async (id, quantity, variantName = "") => {
    if (!id) return;
    if (isCartLocked) {
      await autoUnlockCart();
    }

    if (quantity <= 0) {
      removeFromCart(id, variantName);
      return;
    }

    let productId = id;
    let targetVariant = variantName;

    if (id.includes("-") && !variantName) {
      const parts = id.split("-");
      productId = parts[0];
      targetVariant = parts.slice(1).join("-");
    }

    setCartItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, quantity: Math.min(i.stock || 999, quantity) } : i
      )
    );

    if (hasToken()) {
      try {
        const serverItems = await cartService.updateCartQuantity(productId, quantity, {
          variantName: targetVariant,
        });
        if (serverItems) {
          setCartItems(normalizeBackendItems(serverItems));
        }
        refreshCartLockStatus();
      } catch (err) {
        if (!handleLockError(err)) {
          console.warn("Backend updateQuantity failed:", err.message);
        }
      }
    }
  }, [isCartLocked, removeFromCart, refreshCartLockStatus]);

  const clearCart = useCallback(async () => {
    if (isCartLocked) {
      return;
    }

    setCartItems([]);
    localStorage.removeItem("medishop_cart");
    localStorage.removeItem("medishop_guest_cart");

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
    localStorage.removeItem("medishop_guest_cart");
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
        await syncCartForUser();
      }
    } catch (err) {
      console.warn("Modify cart failed:", err.message);
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
  // GST is already included in product prices
  const tax = 0;
  const total = roundPrice(subtotal + shipping);
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
        purgeCartOnLogout,
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

