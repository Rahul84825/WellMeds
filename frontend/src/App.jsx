import React, { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";

// Context Providers
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider, useCart } from "./context/CartContext";
import { WishlistProvider, useWishlist } from "./context/WishlistContext";

import { Toaster } from "sonner";

// Routes
import AppRoutes from "./routes/AppRoutes";

/**
 * SyncBridge — registers cart/wishlist sync callbacks with AuthContext
 * so they fire automatically after login/logout.
 * Must be rendered inside all three providers.
 */
const SyncBridge = () => {
  const { registerLoginCallback, registerLogoutCallback } = useAuth();
  const { syncCartForUser, saveCartToLocalOnLogout } = useCart();
  const { syncWishlistForUser } = useWishlist();

  useEffect(() => {
    const unsubCart = registerLoginCallback(syncCartForUser);
    const unsubWishlist = registerLoginCallback(syncWishlistForUser);
    const unsubCartLogout = registerLogoutCallback(saveCartToLocalOnLogout);

    return () => {
      unsubCart();
      unsubWishlist();
      unsubCartLogout();
    };
  }, [
    registerLoginCallback,
    registerLogoutCallback,
    syncCartForUser,
    syncWishlistForUser,
    saveCartToLocalOnLogout,
  ]);

  return null;
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <BrowserRouter>
            <Toaster position="top-right" richColors closeButton />
            <SyncBridge />
            <AppRoutes />
          </BrowserRouter>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
